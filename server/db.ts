import { Tenant, User, Product, Template, Campaign, RenderJob, Design, SubscriptionPlan } from '../src/types';
import { INITIAL_PLANS, INITIAL_TENANTS, INITIAL_USERS, INITIAL_PRODUCTS, INITIAL_TEMPLATES, INITIAL_CAMPAIGNS } from './seedData';

class DatabaseManager {
  private tenants: Map<string, Tenant> = new Map();
  private users: Map<string, User> = new Map();
  private products: Map<string, Product> = new Map();
  private templates: Map<string, Template> = new Map();
  private campaigns: Map<string, Campaign> = new Map();
  private renderJobs: Map<string, RenderJob> = new Map();
  private designs: Map<string, Design> = new Map();
  private plans: Map<string, SubscriptionPlan> = new Map();

  constructor() {
    this.seed();
  }

  private seed() {
    INITIAL_PLANS.forEach(p => this.plans.set(p.id, p));
    INITIAL_TENANTS.forEach(t => this.tenants.set(t.id, t));
    INITIAL_USERS.forEach(u => this.users.set(u.id, u));
    INITIAL_PRODUCTS.forEach(p => this.products.set(p.id, p));
    INITIAL_TEMPLATES.forEach(t => this.templates.set(t.id, t));
    INITIAL_CAMPAIGNS.forEach(c => this.campaigns.set(c.id, c));
  }

  clearAllData(tenantId?: string) {
    if (tenantId) {
      for (const [id, prod] of this.products.entries()) {
        if (prod.tenantId === tenantId) this.products.delete(id);
      }
      for (const [id, camp] of this.campaigns.entries()) {
        if (camp.tenantId === tenantId) this.campaigns.delete(id);
      }
    } else {
      this.products.clear();
      this.campaigns.clear();
      this.renderJobs.clear();
    }
  }

  // --- TENANTS & BRAND KIT ---
  getTenants(): Tenant[] {
    return Array.from(this.tenants.values());
  }

  getTenantById(id: string): Tenant | undefined {
    return this.tenants.get(id);
  }

  getTenantBySlug(slug: string): Tenant | undefined {
    return Array.from(this.tenants.values()).find(t => t.slug === slug);
  }

  updateTenant(id: string, updates: Partial<Tenant>): Tenant {
    const tenant = this.tenants.get(id);
    if (!tenant) throw new Error('Tenant não encontrado');
    const updated = { ...tenant, ...updates };
    this.tenants.set(id, updated);
    return updated;
  }

  updateBrandKit(tenantId: string, brandKit: Partial<Tenant['brandKit']>): Tenant {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) throw new Error('Tenant não encontrado');
    tenant.brandKit = { ...tenant.brandKit, ...brandKit };
    this.tenants.set(tenantId, tenant);
    return tenant;
  }

  createTenant(name: string, planId: string = 'plan_pro'): Tenant {
    const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const id = `tenant_${Date.now()}`;
    const newTenant: Tenant = {
      id,
      name,
      slug,
      status: 'ACTIVE',
      planId,
      createdAt: new Date().toISOString(),
      brandKit: {
        primaryColor: '#e11d48',
        secondaryColor: '#facc15',
        accentColor: '#16a34a',
        fontFamily: 'Outfit',
        instagram: `@${slug}`,
        phone: '(11) 90000-0000',
        address: 'Endereço da Loja',
        slogan: 'As melhores ofertas você encontra aqui!',
        customFooter: 'Ofertas válidas enquanto durarem os estoques.',
      }
    };
    this.tenants.set(id, newTenant);
    return newTenant;
  }

  // --- USERS ---
  getUsers(tenantId?: string): User[] {
    const all = Array.from(this.users.values());
    if (!tenantId) return all;
    return all.filter(u => u.tenantId === tenantId);
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  // --- PRODUCTS ---
  getProducts(tenantId: string): Product[] {
    return Array.from(this.products.values()).filter(p => p.tenantId === tenantId);
  }

  getProductById(id: string): Product | undefined {
    return this.products.get(id);
  }

  saveProduct(product: Partial<Product> & { tenantId: string; name: string; pricePromotional: number }): Product {
    const id = product.id || `prod_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const fullProduct: Product = {
      id,
      tenantId: product.tenantId,
      name: product.name,
      brand: product.brand || '',
      categoryId: product.categoryId || 'cat_geral',
      categoryName: product.categoryName || 'Geral',
      code: product.code || '',
      imageUrl: product.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
      priceNormal: product.priceNormal || product.pricePromotional * 1.2,
      pricePromotional: product.pricePromotional,
      unit: product.unit || 'UN',
      weight: product.weight || '',
      description: product.description || '',
      isHighlight: product.isHighlight || false,
      highlightTag: product.highlightTag || 'SUPER OFERTA',
      status: product.status || 'ACTIVE',
      createdAt: product.createdAt || new Date().toISOString(),
    };
    this.products.set(id, fullProduct);
    return fullProduct;
  }

  deleteProduct(id: string, tenantId: string): boolean {
    const product = this.products.get(id);
    if (product && product.tenantId === tenantId) {
      this.products.delete(id);
      return true;
    }
    return false;
  }

  batchImportProducts(tenantId: string, rawProducts: any[]): Product[] {
    const imported: Product[] = [];
    rawProducts.forEach(raw => {
      const p = this.saveProduct({
        tenantId,
        name: raw.name || raw.produto || 'Produto sem nome',
        priceNormal: parseFloat(raw.priceNormal || raw.preco_antigo || raw.preco_normal || '0') || 0,
        pricePromotional: parseFloat(raw.pricePromotional || raw.preco_novo || raw.preco_promocional || '0') || 0,
        unit: raw.unit || raw.unidade || 'UN',
        categoryName: raw.category || raw.categoria || 'Geral',
        imageUrl: raw.imageUrl || raw.imagem || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
      });
      imported.push(p);
    });
    return imported;
  }

  // --- TEMPLATES ---
  getTemplates(tenantId?: string): Template[] {
    const all = Array.from(this.templates.values());
    return all.filter(t => t.isGlobal || t.tenantId === tenantId);
  }

  getTemplateById(id: string): Template | undefined {
    return this.templates.get(id);
  }

  saveTemplate(template: Partial<Template>): Template {
    const id = template.id || `tpl_${Date.now()}`;
    const fullTemplate: Template = {
      id,
      name: template.name || 'Novo Template',
      category: template.category || 'GENERICO',
      format: template.format || 'STORIES_9_16',
      thumbnailUrl: template.thumbnailUrl || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300&auto=format&fit=crop&q=80',
      elements: template.elements || [],
      bgGradient: template.bgGradient || 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      bgColor: template.bgColor,
      isGlobal: template.isGlobal ?? true,
      tenantId: template.tenantId,
    };
    this.templates.set(id, fullTemplate);
    return fullTemplate;
  }

  // --- CAMPAIGNS ---
  getCampaigns(tenantId: string): Campaign[] {
    return Array.from(this.campaigns.values()).filter(c => c.tenantId === tenantId);
  }

  getCampaignById(id: string): Campaign | undefined {
    return this.campaigns.get(id);
  }

  getCampaignBySlug(tenantSlug: string, campaignSlug: string): Campaign | undefined {
    const tenant = this.getTenantBySlug(tenantSlug);
    if (!tenant) return undefined;
    return Array.from(this.campaigns.values()).find(c => c.tenantId === tenant.id && c.slug === campaignSlug);
  }

  saveCampaign(campaign: Partial<Campaign> & { tenantId: string; name: string }): Campaign {
    const id = campaign.id || `camp_${Date.now()}`;
    const slug = campaign.slug || campaign.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const fullCampaign: Campaign = {
      id,
      tenantId: campaign.tenantId,
      name: campaign.name,
      slug,
      startDate: campaign.startDate || new Date().toISOString().split('T')[0],
      endDate: campaign.endDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: campaign.status || 'ACTIVE',
      productIds: campaign.productIds || [],
      templateId: campaign.templateId || 'tpl_story_supermercado_vermelho',
      formats: campaign.formats || ['STORIES_9_16', 'FEED_1_1', 'TV_16_9', 'FLYER_A4'],
      createdBy: campaign.createdBy || 'user_admin',
      createdAt: campaign.createdAt || new Date().toISOString(),
      viewCount: campaign.viewCount || 0,
    };
    this.campaigns.set(id, fullCampaign);
    return fullCampaign;
  }

  incrementCampaignViews(campaignId: string) {
    const camp = this.campaigns.get(campaignId);
    if (camp) {
      camp.viewCount = (camp.viewCount || 0) + 1;
      this.campaigns.set(campaignId, camp);
    }
  }

  // --- RENDER JOBS ---
  createRenderJob(tenantId: string, campaignId: string, totalItems: number): RenderJob {
    const camp = this.campaigns.get(campaignId);
    const id = `job_${Date.now()}`;
    const job: RenderJob = {
      id,
      tenantId,
      campaignId,
      campaignName: camp ? camp.name : 'Campanha',
      status: 'PENDING',
      totalItems,
      processedItems: 0,
      failedItems: 0,
      createdAt: new Date().toISOString(),
      logs: ['Job criado. Aguardando início da fila...'],
    };
    this.renderJobs.set(id, job);
    return job;
  }

  getRenderJob(id: string): RenderJob | undefined {
    return this.renderJobs.get(id);
  }

  updateRenderJob(id: string, updates: Partial<RenderJob>): RenderJob {
    const job = this.renderJobs.get(id);
    if (!job) throw new Error('Job não encontrado');
    const updated = { ...job, ...updates };
    this.renderJobs.set(id, updated);
    return updated;
  }

  // --- PLANS ---
  getPlans(): SubscriptionPlan[] {
    return Array.from(this.plans.values());
  }
}

export const db = new DatabaseManager();
