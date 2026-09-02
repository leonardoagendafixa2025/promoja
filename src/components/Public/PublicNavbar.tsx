import React from 'react';
import { Sparkles, ArrowRight, KeyRound, UserPlus } from 'lucide-react';

interface PublicNavbarProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({ onOpenLogin, onOpenRegister }) => {
  return (
    <header className="h-20 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40 shadow-2xl">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-400 flex items-center justify-center shadow-lg shadow-rose-950/60">
          <Sparkles className="w-6 h-6 text-white animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-wider text-white font-display flex items-center gap-1.5">
            PROMO<span className="text-rose-500">JÁ</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hidden sm:block">
            Gerador Inteligente de Folhetos & Encartes
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="hidden md:flex items-center space-x-8 text-xs font-bold text-slate-300">
        <a href="#recursos" className="hover:text-rose-400 transition">Recursos</a>
        <a href="#templates" className="hover:text-rose-400 transition">Templates</a>
        <a href="#planos" className="hover:text-rose-400 transition">Planos & Preços</a>
        <a href="#depoimentos" className="hover:text-rose-400 transition">Depoimentos</a>
      </nav>

      {/* Action Buttons */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenLogin}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow"
        >
          <KeyRound className="w-4 h-4 text-purple-400" />
          <span>Entrar</span>
        </button>

        <button
          onClick={onOpenRegister}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-purple-600 to-rose-500 hover:from-rose-500 hover:to-purple-500 text-white text-xs font-black flex items-center gap-1.5 transition shadow-lg shadow-rose-950/50 transform active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Criar Conta Grátis</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
