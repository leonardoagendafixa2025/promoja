import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Store, UserCheck, Check, Sparkles, X, Lock, ArrowRight } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
  onSelectSuperAdmin?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSelectSuperAdmin }) => {
  const { allUsers, allTenants, currentUser, currentTenant, switchUser } = useAuth();

  const handleSelectProfile = (userId: string) => {
    switchUser(userId);
    if (onSelectSuperAdmin) onSelectSuperAdmin();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase text-rose-400 tracking-wider flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> Controle de Acesso & Níveis de Login
            </span>
            <h3 className="text-xl font-black text-white font-display">Alternador de Perfil & Autenticação</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2">
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-xs text-slate-300">
          Selecione o perfil desejado para acessar o painel de administração global ou da loja:
        </p>

        {/* BOTÃO DIRETO SUPER ADMIN */}
        <button
          onClick={() => {
            const superAdminUser = allUsers.find(u => u.role === 'SUPER_ADMIN') || allUsers[0];
            handleSelectProfile(superAdminUser.id);
          }}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-purple-600 via-rose-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-black text-xs uppercase tracking-wider shadow-xl flex items-center justify-between transition transform active:scale-95"
        >
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-amber-200" />
            <div className="text-left">
              <div className="text-sm font-black font-display">⚡ ENTRAR NO SUPER ADMIN CONTROL CENTER</div>
              <div className="text-[11px] font-normal text-purple-100">Acesso Total ao SaaS, Clientes, MRR e Configurações Globais</div>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-white" />
        </button>

        {/* LISTA DE OUTROS PERFIS */}
        <div className="space-y-3 pt-2">
          {allUsers.map((user) => {
            const tenant = allTenants.find(t => t.id === user.tenantId);
            const isCurrent = currentUser?.id === user.id;

            return (
              <button
                key={user.id}
                onClick={() => handleSelectProfile(user.id)}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  isCurrent
                    ? 'bg-purple-950/40 border-purple-500/80 shadow-lg shadow-purple-950/50'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow ${
                    user.role === 'SUPER_ADMIN' ? 'bg-purple-600' : 'bg-rose-600'
                  }`}>
                    {user.role === 'SUPER_ADMIN' ? <Shield className="w-6 h-6 text-white" /> : <Store className="w-6 h-6 text-white" />}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-black text-white font-display">{user.name}</h4>
                      {user.role === 'SUPER_ADMIN' ? (
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                          SUPER ADMIN (DONO DO SAAS)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                          ADMIN DO SUPERMERCADO
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 mt-0.5">
                      Email: <strong className="text-white font-mono">{user.email}</strong> • Empresa: <strong className="text-slate-300">{tenant?.name}</strong>
                    </p>
                  </div>
                </div>

                <div className="shrink-0 pl-3">
                  <span className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow">
                    Entrar
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="pt-2 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};
