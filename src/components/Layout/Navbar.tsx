import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Store, UserCheck, Shield, Sparkles, KeyRound, Database } from 'lucide-react';
import { LoginModal } from '../Auth/LoginModal';
import { SupabaseConnectModal } from '../SuperAdmin/SupabaseConnectModal';
import { isSupabaseConfigured } from '../../lib/supabase';

export const Navbar: React.FC = () => {
  const { currentTenant, currentUser, allTenants, switchTenant, switchUser } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  const supabaseActive = isSupabaseConfigured();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand & Slogan */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-500 flex items-center justify-center shadow-lg shadow-rose-950/50">
          <Sparkles className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <h1 className="text-lg font-black tracking-wider text-white font-display flex items-center gap-1.5">
            PROMO<span className="text-rose-500">JÁ</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium hidden md:block">
            Uma promoção cadastrada. Uma campanha completa criada.
          </p>
        </div>
      </div>

      {/* Multi-Tenant, Supabase & User Selectors */}
      <div className="flex items-center space-x-3">
        {/* Botão do Supabase */}
        <button
          onClick={() => setIsSupabaseModalOpen(true)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
            supabaseActive
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {supabaseActive ? 'Supabase Conectado' : 'Conectar Supabase'}
          </span>
        </button>

        {/* Botão de Login / Alternador de Perfil */}
        <button
          onClick={() => setIsLoginModalOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white text-xs font-black shadow flex items-center gap-2 transition"
        >
          <KeyRound className="w-4 h-4 text-white" />
          <span className="hidden sm:inline">Alternar Perfil</span>
        </button>

        {/* Selector de Empresa / Tenant */}
        <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5">
          <Store className="w-4 h-4 text-rose-400" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Empresa Ativa</span>
            <select
              value={currentTenant?.id || ''}
              onChange={(e) => switchTenant(e.target.value)}
              className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
            >
              {allTenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id} className="bg-slate-900 text-white">
                  {tenant.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Badge da Role Atual */}
        {currentUser?.role === 'SUPER_ADMIN' ? (
          <span className="hidden lg:flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            Super Admin
          </span>
        ) : (
          <span className="hidden lg:flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Admin Tenant
          </span>
        )}
      </div>

      {isLoginModalOpen && (
        <LoginModal onClose={() => setIsLoginModalOpen(false)} />
      )}

      {isSupabaseModalOpen && (
        <SupabaseConnectModal onClose={() => setIsSupabaseModalOpen(false)} />
      )}
    </header>
  );
};
