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
  ShieldAlert,
  Sparkles
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
  | 'superadmin';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentTenant, currentUser } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'campaigns', label: 'Central de Campanhas', icon: Megaphone, badge: 'Principal' },
    { id: 'products', label: 'Produtos & Ofertas', icon: ShoppingBag },
    { id: 'brandkit', label: 'Brand Kit & Cores', icon: Palette },
    { id: 'templates', label: 'Biblioteca & Artes', icon: LayoutTemplate },
    { id: 'flyer', label: 'Folheto Digital & PDF', icon: FileText },
    { id: 'tv', label: 'TV de Ofertas (16:9)', icon: Tv },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950/80 backdrop-blur-xl flex flex-col justify-between p-4 shrink-0 shadow-2xl relative z-20">
      <div className="space-y-6">
        {/* Card do Tenant Ativo */}
        {currentTenant && (
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
                Plano Profissional
              </p>
            </div>
          </motion.div>
        )}

        {/* Navigation List com Framer Motion Gliding Pill */}
        <nav className="space-y-1 relative">
          <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">
            Módulos da Plataforma
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as NavTab)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-semibold text-xs transition-all relative ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
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
          })}

          {/* Super Admin Section */}
          {currentUser?.role === 'SUPER_ADMIN' && (
            <div className="pt-4 mt-4 border-t border-slate-800/80">
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-purple-400 mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                Painel Administrativo
              </p>
              <button
                onClick={() => setActiveTab('superadmin')}
                className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl font-semibold text-xs transition-all relative ${
                  activeTab === 'superadmin'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50'
                    : 'text-purple-300 hover:bg-purple-950/30 border border-purple-500/20'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Super Admin</span>
              </button>
            </div>
          )}
        </nav>
      </div>

      {/* Rota Externa do Catálogo Público */}
      {currentTenant && (
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
