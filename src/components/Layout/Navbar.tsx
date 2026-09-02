import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Store, Shield, Sparkles, LogOut, User, KeyRound, Globe, Settings } from 'lucide-react';
import { LoginModal } from '../Auth/LoginModal';

interface NavbarProps {
  onOpenSuperAdmin?: () => void;
  onOpenSettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSuperAdmin, onOpenSettings }) => {
  const { currentTenant, currentUser, logout } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsLoginModalOpen(true);
  };

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
        {/* BOTÃO DIRETO SUPER ADMIN (APENAS SE O USUÁRIO FOR SUPER ADMIN) */}
        {currentUser?.role === 'SUPER_ADMIN' && (
          <button
            onClick={onOpenSuperAdmin}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white text-xs font-black flex items-center gap-1.5 transition shadow-lg shadow-purple-950/50"
          >
            <Shield className="w-4 h-4 text-purple-200" />
            <span>🛡️ Super Admin Control Center</span>
          </button>
        )}

        {/* INFORMAÇÕES DO USUÁRIO LOGADO & BOTÃO DE CONFIGURAÇÕES DA CONTA */}
        {currentUser ? (
          <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-1.5">
            <User className="w-4 h-4 text-purple-400" />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Usuário Logado</span>
              <span className="text-xs font-bold text-white truncate max-w-[150px]">{currentUser.name}</span>
            </div>

            <button
              onClick={onOpenSettings}
              title="Configurações da Conta & Senha"
              className="ml-1 p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-purple-300 transition"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={handleLogout}
              title="Sair da Conta"
              className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow"
          >
            <KeyRound className="w-4 h-4" />
            <span>Entrar com E-mail</span>
          </button>
        )}

        {/* INDICADOR DE CONTEXTO: SE FOR SUPER ADMIN EXIBE VISÃO GLOBAL SAAS, SE FOR LOJISTA EXIBE SUA EMPRESA */}
        {currentUser?.role === 'SUPER_ADMIN' ? (
          <div className="flex items-center space-x-2 bg-purple-950/40 border border-purple-500/40 rounded-xl px-3 py-1.5">
            <Globe className="w-4 h-4 text-purple-400" />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-bold tracking-wider text-purple-300">Ambiente SaaS</span>
              <span className="text-xs font-black text-purple-200">Visão Global (Todas as Empresas)</span>
            </div>
          </div>
        ) : (
          currentTenant && (
            <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-1.5">
              <Store className="w-4 h-4 text-rose-400" />
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Sua Empresa</span>
                <span className="text-xs font-bold text-white truncate max-w-[140px]">
                  {currentTenant.name}
                </span>
              </div>
            </div>
          )
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
