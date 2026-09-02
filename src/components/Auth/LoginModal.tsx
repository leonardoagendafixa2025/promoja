import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Store, Sparkles, X, Lock, ArrowRight, Mail, Key, UserPlus, Eye, EyeOff } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
  onSelectSuperAdmin?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSelectSuperAdmin }) => {
  const { login, register } = useAuth();

  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // LOGIN FORM STATE
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // REGISTER FORM STATE
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerCompanyName, setRegisterCompanyName] = useState('');
  const [registerPlanId, setRegisterPlanId] = useState('plan_pro');

  const handleLoginFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;

    setIsSubmitting(true);
    const success = await login(loginEmail, loginPassword);
    setIsSubmitting(false);

    if (success) {
      if (loginEmail.toLowerCase().includes('carlos') || loginEmail.toLowerCase().includes('promoja')) {
        if (onSelectSuperAdmin) onSelectSuperAdmin();
      }
      onClose();
    }
  };

  const handleRegisterFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName || !registerEmail || !registerPassword || !registerCompanyName) return;

    setIsSubmitting(true);
    const success = await register(registerName, registerEmail, registerPassword, registerCompanyName, registerPlanId);
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* CABEÇALHO DO MODAL */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase text-rose-400 tracking-wider flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> Autenticação Segura PROMOJÁ
            </span>
            <h3 className="text-xl font-black text-white font-display">
              {authMode === 'LOGIN' ? 'Entrar na sua Conta' : 'Criar Nova Conta (Registro SaaS)'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* ABAS DE AUTENTICAÇÃO REAL */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setAuthMode('LOGIN')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              authMode === 'LOGIN' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-4 h-4" />
            Entrar com E-mail e Senha
          </button>
          <button
            onClick={() => setAuthMode('REGISTER')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              authMode === 'REGISTER' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Criar Nova Empresa
          </button>
        </div>

        {/* MODO 1: LOGIN COM E-MAIL E SENHA */}
        {authMode === 'LOGIN' && (
          <form onSubmit={handleLoginFormSubmit} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">E-mail de Acesso</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    required
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="seu.email@empresa.com.br"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Sua Senha</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Autenticando...' : 'ENTRAR NA CONTA'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* MODO 2: REGISTRO SAAS (NOVA EMPRESA) */}
        {authMode === 'REGISTER' && (
          <form onSubmit={handleRegisterFormSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Seu Nome Completo</label>
                <input
                  required
                  type="text"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  placeholder="Ex: Roberto Silva"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Nome do Supermercado / Loja</label>
                <input
                  required
                  type="text"
                  value={registerCompanyName}
                  onChange={(e) => setRegisterCompanyName(e.target.value)}
                  placeholder="Ex: Supermercado São José"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">E-mail Profissional</label>
                <input
                  required
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder="contato@empresa.com.br"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Crie uma Senha</label>
                <input
                  required
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Plano Desejado</label>
              <select
                value={registerPlanId}
                onChange={(e) => setRegisterPlanId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="plan_free">Plano Gratuito (05 artes/mês)</option>
                <option value="plan_basic">Plano Básico (100 artes/mês - R$ 99/mês)</option>
                <option value="plan_pro">Plano Profissional (500 artes/mês - R$ 149/mês)</option>
                <option value="plan_premium">Plano Enterprise (Ilimitado - R$ 299/mês)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50 mt-2"
            >
              {isSubmitting ? 'Criando sua Conta...' : 'CRIAR CONTA E ACESSAR A PLATAFORMA'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
