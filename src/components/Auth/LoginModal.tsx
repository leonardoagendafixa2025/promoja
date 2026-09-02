import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Store, UserCheck, Check, Sparkles, X, Lock, ArrowRight, Mail, Key, UserPlus, Eye, EyeOff, Building } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
  onSelectSuperAdmin?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSelectSuperAdmin }) => {
  const { allUsers, allTenants, currentUser, currentTenant, switchUser, login, register } = useAuth();

  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER' | 'QUICK'>('LOGIN');

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

  const handleQuickSelect = (userId: string) => {
    switchUser(userId);
    const u = allUsers.find(user => user.id === userId);
    if (u?.role === 'SUPER_ADMIN' && onSelectSuperAdmin) {
      onSelectSuperAdmin();
    }
    onClose();
  };

  const autofillLogin = (email: string) => {
    setLoginEmail(email);
    setLoginPassword('admin123');
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
            <h3 className="text-xl font-black text-white font-display">Acesse sua Conta ou Registre sua Empresa</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* ABAS DE AUTENTICAÇÃO */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setAuthMode('LOGIN')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              authMode === 'LOGIN' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-4 h-4" />
            Entrar com E-mail
          </button>
          <button
            onClick={() => setAuthMode('REGISTER')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              authMode === 'REGISTER' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Criar Nova Conta
          </button>
          <button
            onClick={() => setAuthMode('QUICK')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              authMode === 'QUICK' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Atalho Demo
          </button>
        </div>

        {/* MODO 1: LOGIN COM E-MAIL E SENHA */}
        {authMode === 'LOGIN' && (
          <form onSubmit={handleLoginFormSubmit} className="space-y-4">
            {/* CHIPS DE PREENCHIMENTO RÁPIDO PARA TESTE */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Contas de Teste (Clique para preencher):</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => autofillLogin('carlos@promoja.com.br')}
                  className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold hover:bg-purple-500/30 transition flex items-center gap-1"
                >
                  <Shield className="w-3 h-3 text-purple-400" /> Carlos (Super Admin)
                </button>
                <button
                  type="button"
                  onClick={() => autofillLogin('joao@supermodelo.com.br')}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-bold hover:bg-rose-500/30 transition flex items-center gap-1"
                >
                  <Store className="w-3 h-3 text-rose-400" /> João (Supermercado Modelo)
                </button>
              </div>
            </div>

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
                    placeholder="Digite sua senha (ex: admin123)"
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

        {/* MODO 3: ATALHOS DEMO RÁPIDOS */}
        {authMode === 'QUICK' && (
          <div className="space-y-3">
            <button
              onClick={() => {
                const superAdminUser = allUsers.find(u => u.role === 'SUPER_ADMIN') || allUsers[0];
                handleQuickSelect(superAdminUser.id);
              }}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-purple-600 via-rose-600 to-amber-500 text-white font-black text-xs uppercase tracking-wider shadow-xl flex items-center justify-between transition transform active:scale-95"
            >
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-amber-200" />
                <div className="text-left">
                  <div className="text-sm font-black font-display">⚡ ENTRAR COMO SUPER ADMIN</div>
                  <div className="text-[11px] font-normal text-purple-100">Carlos Mendes (carlos@promoja.com.br)</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-white" />
            </button>

            <div className="space-y-2">
              {allUsers.map((user) => {
                const tenant = allTenants.find(t => t.id === user.tenantId);
                const isCurrent = currentUser?.id === user.id;

                return (
                  <button
                    key={user.id}
                    onClick={() => handleQuickSelect(user.id)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition ${
                      isCurrent ? 'bg-purple-950/40 border-purple-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center font-bold text-white text-xs">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white">{user.name}</span>
                        <span className="text-[10px] text-slate-400 block">{user.email} • {tenant?.name}</span>
                      </div>
                    </div>
                    {isCurrent && <Check className="w-4 h-4 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
