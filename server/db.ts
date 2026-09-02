import { 
  Tenant, 
  User, 
  Product, 
  Template, 
  Campaign, 
  RenderJob, 
  Design, 
  SubscriptionPlan,
  Transaction,
  Coupon,
  SupportTicket,
  PlatformAnnouncement,
  FeatureFlag,
  AuditLog,
  SystemHealth
} from '../src/types';
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
  private transactions: Map<string, Transaction> = new Map();
  private coupons: Map<string, Coupon> = new Map();
  private supportTickets: Map<string, SupportTicket> = new Map();
  private announcements: Map<string, PlatformAnnouncement> = new Map();
  private featureFlags: Map<string, FeatureFlag> = new Map();
  private auditLogs: AuditLog[] = [];

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

    // Seed Transações Financeiras
    const initialTxs: Transaction[] = [
      {
        id: 'tx_101',
        tenantId: 'tenant_supermercado_modelo',
        tenantName: 'Supermercado Modelo',
        amount: 149.90,
        paymentMethod: 'CREDIT_CARD',
        status: 'PAID',
        date: '2026-03-01T10:30:00.000Z',
        gatewayRef: 'pay_99818231',
      },
      {
        id: 'tx_102',
        tenantId: 'tenant_acougue_prime',
        tenantName: 'Açougue & Boutique Prime',
        amount: 299.90,
        paymentMethod: 'PIX',
        status: 'PAID',
        date: '2026-03-02T14:15:00.000Z',
        gatewayRef: 'pix_77218391',
      }
    ];
    initialTxs.forEach(tx => this.transactions.set(tx.id, tx));

    // Seed Cupons
    const initialCoupons: Coupon[] = [
      {
        id: 'cup_PROMOJA20',
        code: 'PROMOJA20',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        validUntil: '2026-12-31T23:59:59.000Z',
        maxUses: 100,
        usedCount: 14,
        status: 'ACTIVE',
      },
      {
        id: 'cup_VAREJO50',
        code: 'VAREJO50',
        discountType: 'FIXED',
        discountValue: 50,
        validUntil: '2026-06-30T23:59:59.000Z',
        maxUses: 50,
        usedCount: 8,
        status: 'ACTIVE',
      }
    ];
    initialCoupons.forEach(c => this.coupons.set(c.id, c));

    // Seed Tickets Suporte
    const initialTickets: SupportTicket[] = [
      {
        id: 'tkt_201',
        tenantId: 'tenant_supermercado_modelo',
        tenantName: 'Supermercado Modelo',
        subject: 'Dúvida sobre diagramação de folheto PDF A4',
        category: 'DUVIDA',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        assignedTo: 'Carlos Mendes',
        createdAt: '2026-03-01T16:00:00.000Z',
        updatedAt: '2026-03-01T16:30:00.000Z',
        messages: [
          {
            senderName: 'Roberto Silva',
            senderRole: 'USER',
            content: 'Como faço para organizar 8 produtos em 2 páginas no folheto A4?',
            createdAt: '2026-03-01T16:00:00.000Z',
          },
          {
            senderName: 'Carlos Mendes (Suporte)',
            senderRole: 'SUPPORT',
            content: 'Olá Roberto! O sistema realiza a quebra automática de 4 itens por página no PDF A4. Basta incluir os 8 produtos na campanha.',
            createdAt: '2026-03-01T16:30:00.000Z',
          }
        ]
      }
    ];
    initialTickets.forEach(t => this.supportTickets.set(t.id, t));

    // Seed Avisos Globais
    const initialAnnouncements: PlatformAnnouncement[] = [
      {
        id: 'anc_301',
        title: '🚀 Nova Atualização: Editor com Auto-Scale de Tipografia!',
        message: 'Agora os títulos longos de produtos e preços grandes se ajustam automaticamente nas artes.',
        type: 'INFO',
        priority: 'NORMAL',
        startDate: '2026-03-01T00:00:00.000Z',
        endDate: '2026-04-01T00:00:00.000Z',
        targetAudience: 'ALL',
        isActive: true,
      }
    ];
    initialAnnouncements.forEach(a => this.announcements.set(a.id, a));

    // Seed Feature Flags
    const initialFlags: FeatureFlag[] = [
      {
        id: 'ff_bulk_zip',
        key: 'bulk_zip_export',
        name: 'Exportação em Lote de ZIP de Alta Resolução',
        description: 'Libera download comprimido em 1 clique de todas as artes da campanha.',
        isEnabledGlobally: true,
        allowedPlans: ['plan_pro', 'plan_premium'],
      },
      {
        id: 'ff_tv_4k',
        key: 'tv_4k_presenter',
        name: 'Apresentador TV 4K com Letreiro Contínuo',
        description: 'Modo vitrine digital 16:9 em tempo real para telas de loja.',
        isEnabledGlobally: true,
        allowedPlans: ['plan_pro', 'plan_premium'],
      }
    ];
    initialFlags.forEach(f => this.featureFlags.set(f.id, f));

    // Seed Logs Auditoria
    this.auditLogs.push({
      id: 'log_401',
      userId: 'user_superadmin',
      userName: 'Carlos Mendes',
      action: 'LOGIN',
      entity: 'AUTH',
      timestamp: new Date().toISOString(),
      ipAddress: '189.120.45.12',
      details: 'Super Admin efetuou login no Control Center',
    });
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

  saveTenant(tenant: Partial<Tenant>): Tenant {
    const id = tenant.id || `tenant_${Date.now()}`;
    const slug = tenant.slug || tenant.name?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'tenant';
    const fullTenant: Tenant = {
      id,
      name: tenant.name || 'Nova Empresa',
      slug,
      status: tenant.status || 'ACTIVE',
      planId: tenant.planId || 'plan_pro',
      createdAt: tenant.createdAt || new Date().toISOString(),
      ownerEmail: tenant.ownerEmail || 'contato@empresa.com.br',
      ownerPhone: tenant.ownerPhone || '(11) 99999-8888',
      storageUsedMb: tenant.storageUsedMb || 12.4,
      usersCount: tenant.usersCount || 1,
      flyersCount: tenant.flyersCount || 0,
      brandKit: tenant.brandKit || {
        primaryColor: '#e11d48',
        secondaryColor: '#facc15',
        accentColor: '#16a34a',
        fontFamily: 'Outfit',
        phone: '(11) 99999-8888',
        instagram: '@empresa',
        address: 'Rua Principal, 100',
        slogan: 'As melhores ofertas!',
        customFooter: 'Ofertas válidas hoje.',
      }
    };
    this.tenants.set(id, fullTenant);
    return fullTenant;
  }

  updateTenant(id: string, updates: Partial<Tenant>): Tenant {
    const tenant = this.tenants.get(id);
    if (!tenant) throw new Error('Tenant não encontrado');
    const updated = { ...tenant, ...updates };
    this.tenants.set(id, updated);
    return updated;
  }

  // --- USERS & RBAC ---
  getUsers(): User[] {
    return Array.from(this.users.values());
  }

  saveUser(user: Partial<User>): User {
    const id = user.id || `user_${Date.now()}`;
    const fullUser: User = {
      id,
      tenantId: user.tenantId || 'tenant_supermercado_modelo',
      name: user.name || 'Novo Usuário',
      email: user.email || 'usuario@empresa.com.br',
      role: user.role || 'ADMIN',
      status: user.status || 'ACTIVE',
      createdAt: user.createdAt || new Date().toISOString(),
      avatarUrl: user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };
    this.users.set(id, fullUser);
    return fullUser;
  }

  deleteUser(id: string): boolean {
    return this.users.delete(id);
  }

  // --- PRODUCTS ---
  getProducts(tenantId?: string): Product[] {
    const all = Array.from(this.products.values());
    if (tenantId) return all.filter(p => p.tenantId === tenantId);
    return all;
  }

  getProductById(id: string): Product | undefined {
    return this.products.get(id);
  }

  saveProduct(product: Partial<Product> & { tenantId: string; name: string; pricePromotional: number }): Product {
    const id = product.id || `prod_${Date.now()}`;
    const fullProduct: Product = {
      id,
      tenantId: product.tenantId,
      name: product.name,
      brand: product.brand || '',
      categoryId: product.categoryId || 'cat_geral',
      categoryName: product.categoryName || 'Geral',
      code: product.code || `${Math.floor(1000000000000 + Math.random() * 9000000000000)}`,
      imageUrl: product.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
      priceNormal: product.priceNormal || 0,
      pricePromotional: product.pricePromotional,
      unit: product.unit || 'UN',
      weight: product.weight || '',
      description: product.description || '',
      isHighlight: product.isHighlight ?? true,
      highlightTag: product.highlightTag || 'SUPER OFERTA',
      status: product.status || 'ACTIVE',
      createdAt: product.createdAt || new Date().toISOString(),
    };
    this.products.set(id, fullProduct);
    return fullProduct;
  }

  deleteProduct(id: string, tenantId?: string): boolean {
    const prod = this.products.get(id);
    if (!prod) return false;
    if (tenantId && prod.tenantId !== tenantId) return false;
    return this.products.delete(id);
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
  getTemplates(): Template[] {
    return Array.from(this.templates.values());
  }

  saveTemplate(template: Partial<Template>): Template {
    const id = template.id || `tpl_${Date.now()}`;
    const fullTemplate: Template = {
      id,
      name: template.name || 'Novo Template',
      category: template.category || 'SUPERMERCADO',
      format: template.format || 'STORIES_9_16',
      thumbnailUrl: template.thumbnailUrl || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300&auto=format&fit=crop&q=80',
      elements: template.elements || [],
      bgGradient: template.bgGradient || 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      hasSpotlight: template.hasSpotlight ?? true,
      isGlobal: template.isGlobal ?? true,
      tenantId: template.tenantId,
      status: template.status || 'PUBLISHED',
    };
    this.templates.set(id, fullTemplate);
    return fullTemplate;
  }

  // --- CAMPAIGNS ---
  getCampaigns(tenantId?: string): Campaign[] {
    const all = Array.from(this.campaigns.values());
    if (tenantId) return all.filter(c => c.tenantId === tenantId);
    return all;
  }

  getCampaignById(id: string): Campaign | undefined {
    return this.campaigns.get(id);
  }

  getCampaignBySlug(tenantSlug: string, campaignSlug: string): Campaign | undefined {
    const tenant = Array.from(this.tenants.values()).find(t => t.slug === tenantSlug);
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

  // --- TRANSAÇÕES, PLANOS E CUPONS ---
  getPlans(): SubscriptionPlan[] {
    return Array.from(this.plans.values());
  }

  savePlan(plan: Partial<SubscriptionPlan>): SubscriptionPlan {
    const id = plan.id || `plan_${Date.now()}`;
    const fullPlan: SubscriptionPlan = {
      id,
      name: plan.name || 'Novo Plano',
      priceMonthly: plan.priceMonthly || 99.90,
      priceYearly: plan.priceYearly || 999.00,
      artsLimitMonth: plan.artsLimitMonth || 300,
      hasWatermark: plan.hasWatermark ?? false,
      hasBulkGenerator: plan.hasBulkGenerator ?? true,
      hasPdfFlyer: plan.hasPdfFlyer ?? true,
      hasOnlineCatalog: plan.hasOnlineCatalog ?? true,
      hasTvMode: plan.hasTvMode ?? true,
      hasMultiStore: plan.hasMultiStore ?? false,
      status: plan.status || 'ACTIVE',
    };
    this.plans.set(id, fullPlan);
    return fullPlan;
  }

  getTransactions(): Transaction[] {
    return Array.from(this.transactions.values());
  }

  getCoupons(): Coupon[] {
    return Array.from(this.coupons.values());
  }

  saveCoupon(coupon: Partial<Coupon>): Coupon {
    const id = coupon.id || `cup_${coupon.code || Date.now()}`;
    const fullCoupon: Coupon = {
      id,
      code: coupon.code ? coupon.code.toUpperCase() : 'PROMOJA',
      discountType: coupon.discountType || 'PERCENTAGE',
      discountValue: coupon.discountValue || 10,
      validUntil: coupon.validUntil || '2026-12-31T23:59:59.000Z',
      maxUses: coupon.maxUses || 100,
      usedCount: coupon.usedCount || 0,
      status: coupon.status || 'ACTIVE',
    };
    this.coupons.set(id, fullCoupon);
    return fullCoupon;
  }

  // --- TICKETS SUPORTE & COMUNICAÇÃO ---
  getSupportTickets(): SupportTicket[] {
    return Array.from(this.supportTickets.values());
  }

  saveSupportTicket(ticket: Partial<SupportTicket>): SupportTicket {
    const id = ticket.id || `tkt_${Date.now()}`;
    const fullTicket: SupportTicket = {
      id,
      tenantId: ticket.tenantId || 'tenant_supermercado_modelo',
      tenantName: ticket.tenantName || 'Supermercado Modelo',
      subject: ticket.subject || 'Atendimento de Suporte',
      category: ticket.category || 'DUVIDA',
      priority: ticket.priority || 'MEDIUM',
      status: ticket.status || 'OPEN',
      assignedTo: ticket.assignedTo || 'Equipe PromoJá',
      createdAt: ticket.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: ticket.messages || [],
    };
    this.supportTickets.set(id, fullTicket);
    return fullTicket;
  }

  getAnnouncements(): PlatformAnnouncement[] {
    return Array.from(this.announcements.values());
  }

  saveAnnouncement(announcement: Partial<PlatformAnnouncement>): PlatformAnnouncement {
    const id = announcement.id || `anc_${Date.now()}`;
    const fullAnnouncement: PlatformAnnouncement = {
      id,
      title: announcement.title || 'Aviso da Plataforma',
      message: announcement.message || '',
      type: announcement.type || 'INFO',
      priority: announcement.priority || 'NORMAL',
      startDate: announcement.startDate || new Date().toISOString(),
      endDate: announcement.endDate || '2026-12-31T23:59:59.000Z',
      targetAudience: announcement.targetAudience || 'ALL',
      isActive: announcement.isActive ?? true,
    };
    this.announcements.set(id, fullAnnouncement);
    return fullAnnouncement;
  }

  getFeatureFlags(): FeatureFlag[] {
    return Array.from(this.featureFlags.values());
  }

  toggleFeatureFlag(id: string): FeatureFlag {
    const flag = this.featureFlags.get(id);
    if (!flag) throw new Error('Feature Flag não encontrada');
    flag.isEnabledGlobally = !flag.isEnabledGlobally;
    this.featureFlags.set(id, flag);
    return flag;
  }

  // --- LOGS DE AUDITORIA E LOGGING DE IMPERSONATION ---
  getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    const newLog: AuditLog = {
      ...log,
      id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(newLog);
    if (this.auditLogs.length > 500) this.auditLogs.pop();
  }

  getSystemHealth(): SystemHealth {
    return {
      databaseStatus: 'HEALTHY',
      authServiceStatus: 'HEALTHY',
      storageStatus: 'HEALTHY',
      pendingJobsCount: Array.from(this.renderJobs.values()).filter(j => j.status === 'PROCESSING' || j.status === 'PENDING').length,
      errorRatePercent: 0.02,
      uptimeSeconds: Math.floor(process.uptime()),
    };
  }
}

export const db = new DatabaseManager();
