import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Megaphone, 
  ShoppingBag, 
  Palette, 
  LayoutTemplate, 
  FileText, 
  Tv, 
  ExternalLink,
  Shield,
  Building2,
  Users,
  DollarSign,
  Tag,
  LifeBuoy,
  Bell,
  Activity,
  Cpu,
  Flag,
  Sparkles,
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type NavTab = 
  | 'dashboard' 
  | 'campaigns' 
  | 'products' 
  | 'brandkit' 
  | 'templates' 
  | 'flyer' 
  | 'tv' 
  | 'superadmin'
  | 'settings';

export type SuperAdminSubTab =
  | 'dashboard'
  | 'tenants'
  | 'users'
  | 'plans'
  | 'financial'
  | 'coupons'
  | 'templates'
  | 'support'
  | 'announcements'
  | 'audit'
  | 'health'
  | 'feature_flags';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  superAdminSubTab?: SuperAdminSubTab;
  setSuperAdminSubTab?: (subTab: SuperAdminSubTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab,
  superAdminSubTab = 'dashboard',
  setSuperAdminSubTab
}) => {
  const { currentTenant, currentUser } = useAuth();

  const isSuperAdminMode = activeTab === 'superadmin';

  // MENU DO LOJISTA (TENANT)
  const tenantMenuItems = [
    { id: 'dashboard', label: 'Dashboard da Loja', icon: LayoutDashboard },
    { id: 'campaigns', label: 'Central de Campanhas', icon: Megaphone, badge: 'Principal' },
    { id: 'products', label: 'Produtos & Ofertas', icon: ShoppingBag },
    { id: 'brandkit', label: 'Brand Kit & Cores', icon: Palette },
    { id: 'templates', label: 'Biblioteca & Artes', icon: LayoutTemplate },
    { id: 'flyer', label: 'Folheto Digital & PDF', icon: FileText },
    { id: 'tv', label: 'TV de Ofertas (16:9)', icon: Tv },
    { id: 'settings', label: 'Configurações da Conta', icon: Settings },
  ];

  // MENU EXCLUSIVO DO SUPER ADMIN CONTROL CENTER
  const superAdminMenuItems: { id: SuperAdminSubTab; label: string; icon: any; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard Executivo', icon: LayoutDashboard },
    { id: 'tenants', label: 'Empresas / Tenants', icon: Building2, badge: 'Global' },
    { id: 'users', label: 'Usuários & Permissões', icon: Users },
    { id: 'plans', label: 'Planos & Tarifas', icon: DollarSign },
    { id: 'financial', label: 'Transações', icon: DollarSign },
    { id: 'coupons', label: 'Cupons & Descontos', icon: Tag },
    { id: 'templates', label: 'Templates Globais', icon: LayoutTemplate },
    { id: 'support', label: 'Central de Suporte', icon: LifeBuoy },
    { id: 'announcements', label: 'Avisos da Plataforma', icon: Bell },
    { id: 'audit', label: 'Logs de Auditoria', icon: Activity },
    { id: 'health', label: 'Saúde do Sistema', icon: Cpu },
    { id: 'feature_flags', label: 'Feature Flags', icon: Flag },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950/80 backdrop-blur-xl flex flex-col justify-between p-4 shrink-0 shadow-2xl relative z-20">
      <div className="space-y-6">
        {/* MODES SWITCHER / CARD DO AMBIENTE */}
        {isSuperAdminMode ? (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950 to-slate-900 border border-purple-500/40 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white font-black shadow">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black text-white font-display">CONTROL CENTER</p>
                <p className="text-[10px] text-purple-300 font-bold">Super Admin Global</p>
              </div>
            </div>
          </div>
        ) : (
          currentTenant && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/90 border border-slate-800/80 shadow-lg flex items-center space-x-3 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-xl pointer-events-none" />
              {currentTenant.brandKit.logoUrl ? (
                <img 
                  src={currentTenant.brandKit.logoUrl} 
                  alt={currentTenant.name} 
                  className="w-10 h-10 rounded-xl object-contain bg-white p-1 shadow border border-slate-200"
                />
              ) : (
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg shadow"
                  style={{ backgroundColor: currentTenant.brandKit.primaryColor || '#f43f5e' }}
                >
                  {currentTenant.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-white truncate font-display">{currentTenant.name}</p>
                <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Plano Ativo
                </p>
              </div>
            </motion.div>
          )
        )}

        {/* LISTA DE NAVEGAÇÃO LATERAL DEDICADA */}
        <nav className="space-y-1 relative">
          <p className={`px-3 text-[10px] font-extrabold uppercase tracking-widest mb-2 flex items-center gap-1 ${
            isSuperAdminMode ? 'text-purple-400' : 'text-slate-500'
          }`}>
            {isSuperAdminMode ? (
              <>
                <Shield className="w-3 h-3 text-purple-400" />
                Módulos Super Admin
              </>
            ) : (
              'Módulos da Loja'
            )}
          </p>

          {isSuperAdminMode ? (
            // ITENS DO MENU DO SUPER ADMIN
            superAdminMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = superAdminSubTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSuperAdminSubTab && setSuperAdminSubTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all relative ${
                    isActive ? 'text-white font-black' : 'text-purple-200/70 hover:text-white hover:bg-purple-950/40'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeSuperAdminTab"
                      className="absolute inset-0 bg-gradient-to-r from-purple-600 to-rose-600 rounded-xl shadow-lg shadow-purple-950/60"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}

                  <div className="flex items-center space-x-3 relative z-10">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-purple-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase relative z-10 bg-purple-500/30 text-purple-200 border border-purple-400/40">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            // ITENS DO MENU DO LOJISTA
            tenantMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as NavTab)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all relative ${
                    isActive ? 'text-white font-black' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeSidebarTab"
                      className="absolute inset-0 bg-gradient-to-r from-rose-600 to-rose-500 rounded-xl shadow-lg shadow-rose-950/50"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}

                  <div className="flex items-center space-x-3 relative z-10">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase relative z-10 ${
                      isActive ? 'bg-white/25 text-white' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </nav>
      </div>

      {/* Rota Externa do Catálogo Público (Apenas em Modo Lojista) */}
      {!isSuperAdminMode && currentTenant && (
        <div className="pt-4 border-t border-slate-800/80">
          <a
            href={`/ofertas/${currentTenant.slug}/ofertas-do-final-de-semana`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition shadow-sm group"
          >
            <span>Ver Catálogo Público</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </a>
        </div>
      )}
    </aside>
  );
};
