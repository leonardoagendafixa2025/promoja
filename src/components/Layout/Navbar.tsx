import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Store, UserCheck, Shield, Sparkles, KeyRound } from 'lucide-react';
import { LoginModal } from '../Auth/LoginModal';

interface NavbarProps {
  onOpenSuperAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSuperAdmin }) => {
  const { currentTenant, currentUser, allTenants, switchTenant } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/95 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-lg">
      {/* Brand & Slogan */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-500 flex items-center justify-center shadow-lg shadow-rose-950/50">
          <Sparkles className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <h1 className="text-lg font-black tracking-wider text-white font-display flex items-center gap-1.5">
            PROMO<span className="text-rose-500">JÁ</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium hidden lg:block">
            Uma promoção cadastrada. Uma campanha completa criada.
          </p>
        </div>
      </div>

      {/* Control Buttons & Tenant Selectors */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* BOTÃO DE PERFIL */}
        <button
          onClick={() => setIsLoginModalOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition"
        >
          <KeyRound className="w-4 h-4 text-purple-400" />
          <span className="hidden md:inline">Alternar Perfil</span>
        </button>

        {/* SELECTOR DE EMPRESA */}
        <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-1.5">
          <Store className="w-4 h-4 text-rose-400" />
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Empresa Ativa</span>
            <select
              value={currentTenant?.id || ''}
              onChange={(e) => switchTenant(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              {allTenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id} className="bg-slate-900 text-white">
                  {tenant.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* BADGE DA ROLE */}
        {currentUser?.role === 'SUPER_ADMIN' ? (
          <span 
            onClick={onOpenSuperAdmin}
            className="hidden xl:flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 cursor-pointer hover:bg-purple-500/30 transition"
          >
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            Super Admin
          </span>
        ) : (
          <span className="hidden xl:flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Admin Tenant
          </span>
        )}
      </div>

      {isLoginModalOpen && (
        <LoginModal 
          onClose={() => setIsLoginModalOpen(false)}
          onSelectSuperAdmin={onOpenSuperAdmin}
        />
      )}
    </header>
  );
};
