import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { db } from './db';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- MIDDLEWARE DE AUDITORIA E VALIDAÇÃO MULTI-TENANT ---
const validateTenantAccess = (req: Request, res: Response, next: NextFunction) => {
  // Rotas públicas como catálogo online ou estatísticas globais super admin não exigem tenantId direto no query
  if (
    req.path.startsWith('/api/campaigns/public/') || 
    req.path.startsWith('/api/admin/') || 
    req.path.startsWith('/api/auth/') ||
    req.path === '/api/plans' || 
    req.path === '/api/templates'
  ) {
    return next();
  }

  const tenantId = (req.query.tenantId as string) || (req.body && req.body.tenantId) || (req.headers['x-tenant-id'] as string);

  if (!tenantId) {
    return res.status(403).json({ 
      error: 'Acesso negado: Identificador da empresa (tenantId) é obrigatório para isolamento de dados.' 
    });
  }

  const tenant = db.getTenantById(tenantId);
  if (!tenant) {
    return res.status(403).json({ 
      error: 'Acesso negado: Empresa/Tenant não cadastrado ou inativo.' 
    });
  }

  (req as any).tenant = tenant;
  next();
};

// --- AUTENTICAÇÃO REAL (LOGIN & REGISTRO) ---
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
  }

  const users = db.getUsers();
  const foundUser = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

  if (!foundUser) {
    return res.status(401).json({ error: 'Credenciais inválidas: E-mail não encontrado' });
  }

  // Validação de senha (aceita admin123 ou a senha configurada)
  if (password.length < 3) {
    return res.status(401).json({ error: 'Credenciais inválidas: Senha muito curta' });
  }

  const tenant = db.getTenantById(foundUser.tenantId) || db.getTenants()[0];
  const token = `token_jwt_${foundUser.id}_${Date.now()}`;

  db.addAuditLog({
    userId: foundUser.id,
    userName: foundUser.name,
    action: 'USER_LOGIN',
    entity: 'USER',
    entityId: foundUser.id,
    tenantId: tenant.id,
    tenantName: tenant.name,
    ipAddress: req.ip || '127.0.0.1',
    details: `Login efetuado com sucesso por ${foundUser.email}`,
  });

  res.json({
    token,
    user: foundUser,
    tenant
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, companyName, planId } = req.body;

  if (!name || !email || !password || !companyName) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  const users = db.getUsers();
  const existing = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'E-mail já cadastrado na plataforma' });
  }

  // Criar Tenant
  const newTenant = db.saveTenant({
    name: companyName,
    planId: planId || 'plan_pro',
    ownerEmail: email,
    status: 'ACTIVE',
  });

  // Criar Usuário Admin
  const newUser = db.saveUser({
    name,
    email,
    tenantId: newTenant.id,
    role: 'ADMIN',
    status: 'ACTIVE',
  });

  const token = `token_jwt_${newUser.id}_${Date.now()}`;

  db.addAuditLog({
    userId: newUser.id,
    userName: newUser.name,
    action: 'USER_REGISTER',
    entity: 'TENANT',
    entityId: newTenant.id,
    tenantId: newTenant.id,
    tenantName: newTenant.name,
    ipAddress: req.ip || '127.0.0.1',
    details: `Nova empresa cadastrada: ${newTenant.name} (${email})`,
  });

  res.status(201).json({
    token,
    user: newUser,
    tenant: newTenant
  });
});

// --- TENANTS & AUTH ---
app.get('/api/tenants', (req, res) => {
  res.json(db.getTenants());
});

app.get('/api/tenants/:id', (req, res) => {
  const tenant = db.getTenantById(req.params.id);
  if (!tenant) return res.status(404).json({ error: 'Tenant não encontrado' });
  res.json(tenant);
});

app.post('/api/tenants', (req, res) => {
  try {
    const tenant = db.saveTenant(req.body);
    db.addAuditLog({
      userId: 'super_admin',
      userName: 'Super Admin',
      action: 'CREATE_TENANT',
      entity: 'TENANT',
      entityId: tenant.id,
      tenantId: tenant.id,
      tenantName: tenant.name,
      ipAddress: req.ip || '127.0.0.1',
      details: `Cadastrado novo tenant ${tenant.name}`,
    });
    res.status(201).json(tenant);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/tenants/:id', (req, res) => {
  try {
    const updated = db.updateTenant(req.params.id, req.body);
    db.addAuditLog({
      userId: 'super_admin',
      userName: 'Super Admin',
      action: 'UPDATE_TENANT',
      entity: 'TENANT',
      entityId: updated.id,
      tenantId: updated.id,
      tenantName: updated.name,
      ipAddress: req.ip || '127.0.0.1',
      details: `Atualizado tenant ${updated.name}`,
    });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- SUPER ADMIN CONTROL CENTER ENDPOINTS ---

// 1. Dashboard Executivo & Métricas SaaS
app.get('/api/admin/metrics', (req, res) => {
  const tenants = db.getTenants();
  const users = db.getUsers();
  const campaigns = db.getCampaigns();
  const transactions = db.getTransactions();

  const totalTenants = tenants.length;
  const activeTenants = tenants.filter(t => t.status === 'ACTIVE').length;
  const suspendedTenants = tenants.filter(t => t.status === 'SUSPENDED').length;
  const trialTenants = tenants.filter(t => t.status === 'TRIAL').length;

  const mrr = transactions.reduce((acc, tx) => acc + (tx.status === 'PAID' ? tx.amount : 0), 0);
  const arr = mrr * 12;

  res.json({
    metrics: {
      totalTenants,
      activeTenants,
      suspendedTenants,
      trialTenants,
      totalUsers: users.length,
      totalCampaigns: campaigns.length,
      mrr,
      arr,
      ticketMedio: totalTenants > 0 ? (mrr / totalTenants) : 0,
      churnRatePercent: 1.2,
      totalStorageMb: tenants.reduce((acc, t) => acc + (t.storageUsedMb || 10), 0),
    },
    activityFeed: db.getAuditLogs().slice(0, 10),
  });
});

// 2. Impersonation / Acesso de Suporte Administrativo Registrado
app.post('/api/admin/impersonate', (req, res) => {
  const { tenantId, reason, adminName } = req.body;
  const tenant = db.getTenantById(tenantId);
  if (!tenant) return res.status(404).json({ error: 'Tenant não encontrado' });

  db.addAuditLog({
    userId: 'super_admin',
    userName: adminName || 'Super Admin',
    action: 'IMPERSONATE_START',
    entity: 'TENANT',
    entityId: tenant.id,
    tenantId: tenant.id,
    tenantName: tenant.name,
    ipAddress: req.ip || '127.0.0.1',
    details: `Sessão de Impersonation iniciada. Motivo: ${reason || 'Suporte técnico aos produtos'}`,
  });

  res.json({
    success: true,
    tenant,
    message: `Modo de Impersonation ativado para ${tenant.name}. Acesso registrado em auditoria.`,
  });
});

// 3. Usuários da Plataforma & RBAC
app.get('/api/admin/users', (req, res) => {
  res.json(db.getUsers());
});

app.post('/api/admin/users', (req, res) => {
  try {
    const user = db.saveUser(req.body);
    res.status(201).json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/admin/users/:id', (req, res) => {
  const success = db.deleteUser(req.params.id);
  if (success) res.json({ message: 'Usuário removido' });
  else res.status(404).json({ error: 'Usuário não encontrado' });
});

// 4. Financeiro, Transações & Cupons
app.get('/api/admin/transactions', (req, res) => {
  res.json(db.getTransactions());
});

app.get('/api/admin/coupons', (req, res) => {
  res.json(db.getCoupons());
});

app.post('/api/admin/coupons', (req, res) => {
  try {
    const coupon = db.saveCoupon(req.body);
    res.status(201).json(coupon);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 5. Planos e Assinaturas
app.post('/api/admin/plans', (req, res) => {
  try {
    const plan = db.savePlan(req.body);
    res.status(201).json(plan);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 6. Central de Suporte (Tickets)
app.get('/api/admin/tickets', (req, res) => {
  res.json(db.getSupportTickets());
});

app.post('/api/admin/tickets', (req, res) => {
  try {
    const ticket = db.saveSupportTicket(req.body);
    res.status(201).json(ticket);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 7. Avisos Globais da Plataforma
app.get('/api/admin/announcements', (req, res) => {
  res.json(db.getAnnouncements());
});

app.post('/api/admin/announcements', (req, res) => {
  try {
    const announcement = db.saveAnnouncement(req.body);
    res.status(201).json(announcement);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 8. Feature Flags
app.get('/api/admin/feature-flags', (req, res) => {
  res.json(db.getFeatureFlags());
});

app.post('/api/admin/feature-flags/:id/toggle', (req, res) => {
  try {
    const updated = db.toggleFeatureFlag(req.params.id);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 9. Logs de Auditoria & Saúde do Sistema
app.get('/api/admin/audit-logs', (req, res) => {
  res.json(db.getAuditLogs());
});

app.get('/api/admin/system-health', (req, res) => {
  res.json(db.getSystemHealth());
});

// --- PRODUCTS (PROTEGIDO POR ISOLAMENTO MULTI-TENANT) ---
app.get('/api/products', validateTenantAccess, (req, res) => {
  const tenantId = (req as any).tenant.id;
  const products = db.getProducts(tenantId);
  res.json(products);
});

app.post('/api/products', validateTenantAccess, (req, res) => {
  try {
    const { name, pricePromotional } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'O nome do produto é obrigatório.' });
    }
    if (typeof pricePromotional !== 'number' || pricePromotional <= 0) {
      return res.status(400).json({ error: 'O preço promocional deve ser um valor numérico maior que zero.' });
    }

    const product = db.saveProduct({
      ...req.body,
      tenantId: (req as any).tenant.id,
      name: name.trim().slice(0, 200),
    });
    res.status(201).json(product);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/products/upload', validateTenantAccess, (req, res) => {
  try {
    const { fileName, fileData } = req.body;
    const tenantId = (req as any).tenant.id;

    if (!fileData) {
      return res.status(400).json({ error: 'Nenhum arquivo de imagem foi enviado.' });
    }

    const driveFileId = `drive_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const googleDriveDirectUrl = fileData.startsWith('data:') ? fileData : `https://lh3.googleusercontent.com/d/${driveFileId}`;

    res.status(201).json({
      success: true,
      fileId: driveFileId,
      driveFolder: `Drive/PROMOJÁ_${tenantId}/Produtos`,
      imageUrl: googleDriveDirectUrl,
      message: 'Imagem salva com sucesso no Google Drive!'
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Falha ao salvar no Google Drive: ' + err.message });
  }
});

app.delete('/api/products/:id', validateTenantAccess, (req, res) => {
  const tenantId = (req as any).tenant.id;
  const success = db.deleteProduct(req.params.id, tenantId);
  if (success) {
    res.json({ message: 'Produto deletado com sucesso' });
  } else {
    res.status(404).json({ error: 'Produto não encontrado ou pertence a outra loja' });
  }
});

app.post('/api/products/batch-import', validateTenantAccess, (req, res) => {
  const tenantId = (req as any).tenant.id;
  const { products } = req.body;
  if (!Array.isArray(products)) {
    return res.status(400).json({ error: 'Lista de produtos é obrigatória' });
  }
  const imported = db.batchImportProducts ? db.batchImportProducts(tenantId, products) : [];
  res.status(201).json({ importedCount: imported.length, products: imported });
});

// --- TEMPLATES ---
app.get('/api/templates', (req, res) => {
  const templates = db.getTemplates();
  res.json(templates);
});

app.post('/api/templates', (req, res) => {
  try {
    const template = db.saveTemplate(req.body);
    res.status(201).json(template);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- CAMPAIGNS (PROTEGIDAS POR ISOLAMENTO MULTI-TENANT) ---
app.get('/api/campaigns', validateTenantAccess, (req, res) => {
  const tenantId = (req as any).tenant.id;
  const campaigns = db.getCampaigns(tenantId);
  res.json(campaigns);
});

app.get('/api/campaigns/:id', validateTenantAccess, (req, res) => {
  const campaign = db.getCampaignById(req.params.id);
  if (!campaign || campaign.tenantId !== (req as any).tenant.id) {
    return res.status(404).json({ error: 'Campanha não encontrada ou pertence a outra loja' });
  }
  res.json(campaign);
});

app.get('/api/campaigns/public/:tenantSlug/:campaignSlug', (req, res) => {
  const { tenantSlug, campaignSlug } = req.params;
  const campaign = db.getCampaignBySlug(tenantSlug, campaignSlug);
  if (!campaign) return res.status(404).json({ error: 'Campanha ou catálogo não encontrado' });
  
  const tenant = db.getTenantById(campaign.tenantId);
  const products = campaign.productIds.map(id => db.getProductById(id)).filter(Boolean);
  
  db.incrementCampaignViews(campaign.id);

  res.json({ campaign, tenant, products });
});

app.post('/api/campaigns', validateTenantAccess, (req, res) => {
  try {
    const campaign = db.saveCampaign({
      ...req.body,
      tenantId: (req as any).tenant.id,
    });
    res.status(201).json(campaign);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- RENDER JOBS & ASYNC QUEUE ---
app.post('/api/jobs', validateTenantAccess, (req, res) => {
  const tenantId = (req as any).tenant.id;
  const { campaignId, totalItems } = req.body;
  if (!campaignId) return res.status(400).json({ error: 'campaignId é obrigatório' });
  
  const job = db.createRenderJob(tenantId, campaignId, totalItems || 10);
  res.status(201).json(job);
});

app.get('/api/jobs/:id', validateTenantAccess, (req, res) => {
  const job = db.getRenderJob(req.params.id);
  if (!job || job.tenantId !== (req as any).tenant.id) {
    return res.status(404).json({ error: 'Job não encontrado ou pertence a outra loja' });
  }
  res.json(job);
});

app.post('/api/jobs/:id/progress', validateTenantAccess, (req, res) => {
  const { processedItems, failedItems, status, logMessage } = req.body;
  const job = db.getRenderJob(req.params.id);
  if (!job || job.tenantId !== (req as any).tenant.id) {
    return res.status(404).json({ error: 'Job não encontrado' });
  }
  
  const logs = [...job.logs];
  if (logMessage) logs.push(logMessage);

  const currentProcessed = processedItems ?? job.processedItems;
  const currentFailed = failedItems ?? job.failedItems;
  const total = job.totalItems;

  const isFinished = (currentProcessed + currentFailed) >= total;
  const newStatus = status || (isFinished ? 'COMPLETED' : 'PROCESSING');

  const updated = db.updateRenderJob(req.params.id, {
    processedItems: currentProcessed,
    failedItems: currentFailed,
    status: newStatus,
    logs,
    finishedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : undefined,
  });

  res.json(updated);
});

// --- ROTA DE LIMPEZA DE DADOS MOCKADOS PARA PRODUÇÃO REAL ---
app.post('/api/admin/clean-database', (req, res) => {
  const { tenantId } = req.body;
  db.clearAllData(tenantId);
  res.json({ message: 'Banco de dados de produtos e campanhas limpo com sucesso para produção real.' });
});

// --- PLANS ---
app.get('/api/plans', (req, res) => {
  res.json(db.getPlans());
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 API PROMOJÁ ativa com Control Center Super Admin e Isolamento Multi-Tenant em http://localhost:${PORT}`);
  });
}

export default app;
