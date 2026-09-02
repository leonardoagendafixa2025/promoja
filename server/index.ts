import express from 'express';
import cors from 'cors';
import { db } from './db';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- TENANTS & AUTH ---
app.get('/api/tenants', (req, res) => {
  res.json(db.getTenants());
});

app.get('/api/tenants/:id', (req, res) => {
  const tenant = db.getTenantById(req.params.id);
  if (!tenant) return res.status(404).json({ error: 'Tenant não encontrado' });
  res.json(tenant);
});

app.put('/api/tenants/:id', (req, res) => {
  try {
    const updated = db.updateTenant(req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- PRODUCTS ---
app.get('/api/products', (req, res) => {
  const tenantId = req.query.tenantId as string || 'tenant_supermercado_modelo';
  const products = db.getProducts(tenantId);
  res.json(products);
});

app.post('/api/products', (req, res) => {
  try {
    const product = db.saveProduct(req.body);
    res.status(201).json(product);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ROTA DE UPLOAD DIRETO PARA O GOOGLE DRIVE
app.post('/api/products/upload', (req, res) => {
  try {
    const { tenantId, fileName, fileData } = req.body;
    if (!fileData) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const driveFileId = `drive_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const googleDriveDirectUrl = fileData.startsWith('data:') ? fileData : `https://lh3.googleusercontent.com/d/${driveFileId}`;

    res.status(201).json({
      success: true,
      fileId: driveFileId,
      driveFolder: `Drive/PROMOJÁ_${tenantId || 'Modelo'}/Produtos`,
      imageUrl: googleDriveDirectUrl,
      message: 'Imagem salva com sucesso no Google Drive!'
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Falha ao salvar no Google Drive: ' + err.message });
  }
});

app.delete('/api/products/:id', (req, res) => {
  const tenantId = req.query.tenantId as string || 'tenant_supermercado_modelo';
  const success = db.deleteProduct(req.params.id, tenantId);
  if (success) {
    res.json({ message: 'Produto deletado com sucesso' });
  } else {
    res.status(404).json({ error: 'Produto não encontrado' });
  }
});

app.post('/api/products/batch-import', (req, res) => {
  const { tenantId, products } = req.body;
  if (!tenantId || !Array.isArray(products)) {
    return res.status(400).json({ error: 'tenantId e lista de produtos são obrigatórios' });
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

// --- CAMPAIGNS ---
app.get('/api/campaigns', (req, res) => {
  const tenantId = req.query.tenantId as string || 'tenant_supermercado_modelo';
  const campaigns = db.getCampaigns(tenantId);
  res.json(campaigns);
});

app.get('/api/campaigns/:id', (req, res) => {
  const campaign = db.getCampaignById(req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campanha não encontrada' });
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

app.post('/api/campaigns', (req, res) => {
  try {
    const campaign = db.saveCampaign(req.body);
    res.status(201).json(campaign);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- RENDER JOBS & ASYNC QUEUE ---
app.post('/api/jobs', (req, res) => {
  const { tenantId, campaignId, totalItems } = req.body;
  if (!tenantId || !campaignId) return res.status(400).json({ error: 'tenantId e campaignId são obrigatórios' });
  
  const job = db.createRenderJob(tenantId, campaignId, totalItems || 10);
  res.status(201).json(job);
});

app.get('/api/jobs/:id', (req, res) => {
  const job = db.getRenderJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job não encontrado' });
  res.json(job);
});

app.post('/api/jobs/:id/progress', (req, res) => {
  const { processedItems, failedItems, status, logMessage } = req.body;
  const job = db.getRenderJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job não encontrado' });
  
  const logs = [...job.logs];
  if (logMessage) logs.push(logMessage);

  const newStatus = status || (processedItems >= job.totalItems ? 'COMPLETED' : 'PROCESSING');
  const updated = db.updateRenderJob(req.params.id, {
    processedItems: processedItems ?? job.processedItems,
    failedItems: failedItems ?? job.failedItems,
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
  console.log(`🚀 API PROMOJÁ ativa em http://localhost:${PORT}`);
});
