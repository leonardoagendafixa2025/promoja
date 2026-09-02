import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Key, Lock, Mail, CheckCircle2, Shield, Eye, EyeOff, Save, Sparkles, UserCheck } from 'lucide-react';

export const UserSettingsView: React.FC = () => {
  const { currentUser, updateUserProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // FORM PROFILE STATE
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');

  // FORM SECURITY STATE
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');

    try {
      if (updateUserProfile) {
        await updateUserProfile({ name, email, avatarUrl });
      }
      setSuccessMessage('Dados do perfil atualizados com sucesso!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      alert('Erro ao atualizar perfil: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;

    if (newPassword !== confirmPassword) {
      alert('A nova senha e a confirmação não conferem!');
      return;
    }

    if (newPassword.length < 6) {
      alert('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setIsSaving(true);
    setSuccessMessage('');

    try {
      if (updateUserProfile) {
        await updateUserProfile({ newPassword });
      }
      setSuccessMessage('Sua senha foi alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      alert('Erro ao alterar senha: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Cabeçalho da Configuração */}
      <div className="flex items-center space-x-4 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-rose-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
          {currentUser?.avatarUrl ? (
            <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover rounded-2xl" />
          ) : (
            currentUser?.name?.charAt(0) || 'U'
          )}
        </div>

        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase border border-purple-500/30">
            {currentUser?.role === 'SUPER_ADMIN' ? 'Super Admin Control Center' : 'Painel do Lojista'}
          </span>
          <h2 className="text-2xl font-black text-white font-display mt-0.5">
            Configurações da Minha Conta
          </h2>
          <p className="text-xs text-slate-400">
            Atualize seus dados pessoais, e-mail de acesso e altere sua senha de segurança.
          </p>
        </div>
      </div>

      {/* Alerta de Sucesso */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Abas das Configurações */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Meus Dados Pessoais</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'security'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Segurança & Senha</span>
        </button>
      </div>

      {/* ABA 1: MEUS DADOS PESSOAIS */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <h3 className="text-base font-black text-white font-display border-b border-slate-800 pb-3 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-purple-400" />
            Informações do Usuário
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Nome Completo</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">E-mail de Acesso</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-3 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">URL da Foto de Perfil (Avatar)</label>
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-purple-950/60 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Salvando...' : 'Salvar Meus Dados'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ABA 2: ALTERAÇÃO DE SENHA */}
      {activeTab === 'security' && (
        <form onSubmit={handleSavePassword} className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <h3 className="text-base font-black text-white font-display border-b border-slate-800 pb-3 flex items-center gap-2">
            <Lock className="w-5 h-5 text-rose-400" />
            Alterar Senha de Acesso
          </h3>

          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Nova Senha</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-10 text-xs text-white focus:outline-none focus:border-rose-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Confirmar Nova Senha</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-10 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-rose-950/60 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Alterando Senha...' : 'Atualizar Minha Senha'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
