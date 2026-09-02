export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'COLABORADOR';

export type RetailCategory = 
  | 'SUPERMERCADO'
  | 'ACOUQUE'
  | 'HORTIFRUTI'
  | 'FARMACIA'
  | 'PADARIA'
  | 'BEBIDAS'
  | 'PET_SHOP'
  | 'GENERICO';

export type TemplateFormat = 
  | 'STORIES_9_16'    // 1080 x 1920
  | 'FEED_1_1'        // 1080 x 1080
  | 'FEED_4_5'        // 1080 x 1350
  | 'TV_16_9'         // 1920 x 1080
  | 'BANNER_16_9'     // 1920 x 1080
  | 'FLYER_A4';       // A4 multi-page

export type HighlightTag = 
  | 'SUPER OFERTA'
  | 'OFERTA IMPERDÍVEL'
  | 'MENOR PREÇO'
  | 'OFERTA DO DIA'
  | 'CHURRASCO'
  | 'FEIRA FRESCA'
  | 'PREÇO BOMBÁSTICO'
  | 'EXCLUSIVO';

export interface BrandKit {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  instagram: string;
  phone: string;
  address: string;
  slogan: string;
  customFooter: string;
  logoUrl?: string;
  secondaryLogoUrl?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: 'ACTIVE' | 'BLOCKED' | 'SUSPENDED';
  planId: string;
  createdAt: string;
  brandKit: BrandKit;
}

export interface User {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
}

export interface ProductCategory {
  id: string;
  tenantId: string;
  name: string;
  icon?: string;
}

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  brand?: string;
  categoryId: string;
  categoryName?: string;
  code?: string;
  imageUrl: string;
  priceNormal: number;
  pricePromotional: number;
  unit: string;
  weight?: string;
  description?: string;
  isHighlight?: boolean;
  highlightTag?: HighlightTag;
  validUntil?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export type ElementType = 
  | 'text'
  | 'image'
  | 'price_normal'
  | 'price_promotional'
  | 'price_badge'
  | 'discount_tag'
  | 'starburst_badge'
  | 'ribbon_banner'
  | 'logo'
  | 'brand_info'
  | 'highlight_badge'
  | 'shape'
  | 'qr_code';

export interface TemplateElement {
  id: string;
  type: ElementType;
  label: string;
  posX: number;
  posY: number;
  width: number;
  height: number;
  fontSize?: number;
  fontColor?: string;
  fontFamily?: string;
  fontStyle?: 'normal' | 'bold' | 'italic' | 'black';
  alignment?: 'left' | 'center' | 'right';
  content?: string;
  dynamicField?: string;
  zIndex: number;
  rotation?: number;
  bgColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  shadowColor?: string;
  shadowBlur?: number;
  gradientBg?: string;
}

export interface Template {
  id: string;
  name: string;
  category: RetailCategory;
  format: TemplateFormat;
  thumbnailUrl: string;
  elements: TemplateElement[];
  bgGradient?: string;
  bgColor?: string;
  bgImageUrl?: string;
  hasSpotlight?: boolean;
  spotlightColor?: string;
  isGlobal: boolean;
  tenantId?: string;
}

export interface Campaign {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'ARCHIVED';
  productIds: string[];
  templateId: string;
  formats: TemplateFormat[];
  createdBy: string;
  createdAt: string;
  viewCount?: number;
}

export interface RenderJob {
  id: string;
  tenantId: string;
  campaignId: string;
  campaignName: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  totalItems: number;
  processedItems: number;
  failedItems: number;
  createdAt: string;
  finishedAt?: string;
  zipUrl?: string;
  logs: string[];
}

export interface Design {
  id: string;
  tenantId: string;
  campaignId: string;
  productId: string;
  productName: string;
  format: TemplateFormat;
  imageUrl: string;
  thumbnailUrl: string;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceMonthly: number;
  artsLimitMonth: number;
  hasWatermark: boolean;
  hasBulkGenerator: boolean;
  hasPdfFlyer: boolean;
  hasOnlineCatalog: boolean;
  hasTvMode: boolean;
  hasMultiStore: boolean;
}
