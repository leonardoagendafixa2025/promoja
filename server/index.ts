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
  if (req.path.startsWith('/api/campaigns/public/') || req.path === '/api/plans' || req.path === '/api/templates') {
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

  // Anexar tenant validado no request
  (req as any).tenant = tenant;
  next();
};

// --- TENANTS & AUTH ---
app.get('/api/tenants', (req, res) => {
  res.json(db.getTenants());
});

app.get('/api/tenants/:id', (req, res) => {
  const tenant = db.getTenantById(req.params.id);
  if (!tenant) return res.status(404).json({ error: 'Tenant não encontrado' });
  res.json(tenant);
});

app.put('/api/tenants/:id', validateTenantAccess, (req, res) => {
  try {
    const updated = db.updateTenant(req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
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
      name: name.trim().slice(0, 200), // Sanitização de limite de tamanho
    });
    res.status(201).json(product);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ROTA DE UPLOAD DIRETO PARA O GOOGLE DRIVE (PROTEGIDA POR TENANT)
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
  const imported = db.batchImportProducts(tenantId, products);
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

// --- RENDER JOBS & ASYNC QUEUE (COM RESILIÊNCIA E TOLERÂNCIA A ERROS) ---
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

  // Job é considerado COMPLETED se a soma de processados + falhados atingir o total
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

// --- PLANS ---
app.get('/api/plans', (req, res) => {
  res.json(db.getPlans());
});

app.listen(PORT, () => {
  console.log(`🚀 API PROMOJÁ ativa com Isolamento Multi-Tenant em http://localhost:${PORT}`);
});
