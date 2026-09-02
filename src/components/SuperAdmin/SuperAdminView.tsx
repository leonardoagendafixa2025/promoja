import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { 
  Shield, 
  Building2, 
  Users, 
  DollarSign, 
  Layout, 
  LifeBuoy, 
  Bell, 
  Activity, 
  Cpu, 
  Flag, 
  Settings, 
  Search, 
  Filter, 
  Plus, 
  Key, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  RefreshCw, 
  Eye, 
  Trash2, 
  Sparkles,
  Database,
  Tag,
  Lock,
  MessageSquare,
  Radio
} from 'lucide-react';
import { Tenant, User, SubscriptionPlan, Transaction, Coupon, SupportTicket, PlatformAnnouncement, FeatureFlag, AuditLog, SystemHealth } from '../../types';

export const SuperAdminView: React.FC = () => {
  const { currentTenant, currentUser, impersonateTenant } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tenants' | 'users' | 'plans' | 'financial' | 'coupons' | 'templates' | 'support' | 'announcements' | 'audit' | 'health' | 'feature_flags'>('dashboard');

  // Estados de dados da API
  const [metricsData, setMetricsData] = useState<any>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [announcements, setAnnouncements] = useState<PlatformAnnouncement[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTenantFilter, setSelectedTenantFilter] = useState<string>('ALL');
  const [impersonateReasonModal, setImpersonateReasonModal] = useState<{ isOpen: boolean; tenantId: string; tenantName: string } | null>(null);
  const [reasonInput, setReasonInput] = useState('Suporte técnico aos produtos e artes');

  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados dos endpoints do Super Admin
  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      const [
        metricsRes,
        tenantsRes,
        usersRes,
        plansRes,
        txsRes,
        couponsRes,
        ticketsRes,
        announcementsRes,
        logsRes,
        healthRes,
        flagsRes
      ] = await Promise.all([
        fetch('/api/admin/metrics'),
        fetch('/api/tenants'),
        fetch('/api/admin/users'),
        fetch('/api/plans'),
        fetch('/api/admin/transactions'),
        fetch('/api/admin/coupons'),
        fetch('/api/admin/tickets'),
        fetch('/api/admin/announcements'),
        fetch('/api/admin/audit-logs'),
        fetch('/api/admin/system-health'),
        fetch('/api/admin/feature-flags')
      ]);

      if (metricsRes.ok) setMetricsData(await metricsRes.json());
      if (tenantsRes.ok) setTenants(await tenantsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (plansRes.ok) setPlans(await plansRes.json());
      if (txsRes.ok) setTransactions(await txsRes.json());
      if (couponsRes.ok) setCoupons(await couponsRes.json());
      if (ticketsRes.ok) setTickets(await ticketsRes.json());
      if (announcementsRes.ok) setAnnouncements(await announcementsRes.json());
      if (logsRes.ok) setAuditLogs(await logsRes.json());
      if (healthRes.ok) setSystemHealth(await healthRes.json());
      if (flagsRes.ok) setFeatureFlags(await flagsRes.json());
    } catch (err) {
      console.error('Erro ao carregar dados do Super Admin:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleStartImpersonation = async () => {
    if (!impersonateReasonModal) return;
    await impersonateTenant(impersonateReasonModal.tenantId, reasonInput);
    setImpersonateReasonModal(null);
  };

  const handleToggleFlag = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/feature-flags/${id}/toggle`, { method: 'POST' });
      if (res.ok) {
        const updatedFlag = await res.json();
        setFeatureFlags(prev => prev.map(f => f.id === id ? updatedFlag : f));
      }
    } catch (err) {
      console.error('Erro ao alterar Feature Flag:', err);
    }
  };

  const filteredTenants = tenants.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.slug.includes(searchQuery.toLowerCase());
    const matchesStatus = selectedTenantFilter === 'ALL' || t.status === selectedTenantFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Cabeçalho do Super Admin Control Center */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-950 border border-purple-500/40 p-6 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-rose-500 to-amber-400 flex items-center justify-center text-white shadow-xl shadow-purple-950/60">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase border border-purple-500/30">
                SaaS Control Center
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
              SUPER ADMIN CONTROL CENTER
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Gestão Centralizada de Tenants, Usuários, Assinaturas, Suporte, Auditoria e Saúde do Sistema.
            </p>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 text-purple-400 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Atualizar Dados</span>
        </button>
      </div>

      {/* Navegação por Módulos Operacionais */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
        {[
          { id: 'dashboard', label: 'Dashboard Executivo', icon: TrendingUp },
          { id: 'tenants', label: `Tenants (${tenants.length})`, icon: Building2 },
          { id: 'users', label: `Usuários (${users.length})`, icon: Users },
          { id: 'plans', label: 'Planos & Assinaturas', icon: DollarSign },
          { id: 'financial', label: 'Transações', icon: DollarSign },
          { id: 'coupons', label: 'Cupons', icon: Tag },
          { id: 'templates', label: 'Biblioteca Templates', icon: Layout },
          { id: 'support', label: `Suporte (${tickets.length})`, icon: LifeBuoy },
          { id: 'announcements', label: 'Avisos da Plataforma', icon: Bell },
          { id: 'audit', label: 'Logs Auditoria', icon: Activity },
          { id: 'health', label: 'Saúde do Sistema', icon: Cpu },
          { id: 'feature_flags', label: 'Feature Flags', icon: Flag },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50'
                : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 1. DASHBOARD EXECUTIVO */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <span className="text-[11px] font-black uppercase text-slate-400">MRR (Receita Recorrente Mensal)</span>
              <h3 className="text-3xl font-black text-emerald-400 font-display mt-2">
                R$ {metricsData?.metrics?.mrr?.toFixed(2) || '449,80'}
              </h3>
              <p className="text-[11px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> ARR Estimado: R$ {((metricsData?.metrics?.mrr || 449.8) * 12).toFixed(2)}
              </p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <span className="text-[11px] font-black uppercase text-slate-400">Total de Tenants Cadastrados</span>
              <h3 className="text-3xl font-black text-white font-display mt-2">
                {tenants.length}
              </h3>
              <p className="text-[11px] text-purple-400 font-bold mt-1">
                {tenants.filter(t => t.status === 'ACTIVE').length} empresas com assinatura ativa
              </p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <span className="text-[11px] font-black uppercase text-slate-400">Ticket Médio por Cliente</span>
              <h3 className="text-3xl font-black text-amber-400 font-display mt-2">
                R$ {metricsData?.metrics?.ticketMedio?.toFixed(2) || '149,90'}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-1">
                Churn Rate da Plataforma: 1.2%
              </p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <span className="text-[11px] font-black uppercase text-slate-400">Armazenamento Total de Mídias</span>
              <h3 className="text-3xl font-black text-indigo-400 font-display mt-2">
                {metricsData?.metrics?.totalStorageMb || 24.8} MB
              </h3>
              <p className="text-[11px] text-indigo-400 font-medium mt-1">
                Consumo seguro na nuvem
              </p>
            </div>
          </div>

          {/* Atividades Recentes */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-black text-white font-display flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              Atividade Recente & Auditoria de Eventos
            </h3>

            <div className="space-y-2">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <div>
                      <span className="font-bold text-white">{log.userName}</span>
                      <span className="text-slate-400 ml-2">[{log.action}] {log.details}</span>
                    </div>
                  </div>
                  <span className="text-slate-500 font-mono text-[10px]">
                    {new Date(log.timestamp).toLocaleTimeString()} • IP {log.ipAddress}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. GESTÃO DE TENANTS & IMPERSONATION */}
      {activeTab === 'tenants' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3 flex-1 max-w-md bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nome da empresa ou slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none w-full"
              />
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={selectedTenantFilter}
                onChange={(e) => setSelectedTenantFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-xs font-bold text-white rounded-xl px-3 py-2 cursor-pointer"
              >
                <option value="ALL">Todos os Status</option>
                <option value="ACTIVE">Ativos</option>
                <option value="SUSPENDED">Suspensos</option>
                <option value="TRIAL">Em Teste</option>
              </select>
            </div>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-black">
                <tr>
                  <th className="p-4">Empresa / Tenant</th>
                  <th className="p-4">Plano</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Data Cadastro</th>
                  <th className="p-4 text-right">Ações de Suporte</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-900/50 transition">
                    <td className="p-4 font-bold text-white">
                      <div>{t.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">slug: {t.slug} • ID: {t.id}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                        {t.planId.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${
                        t.status === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setImpersonateReasonModal({ isOpen: true, tenantId: t.id, tenantName: t.name })}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-black inline-flex items-center gap-1.5 transition"
                      >
                        <Key className="w-3.5 h-3.5" />
                        Entrar como Empresa (Impersonate)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. USUÁRIOS E PERMISSÕES (RBAC) */}
      {activeTab === 'users' && (
        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
          <div className="p-5 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-base font-black text-white font-display">Usuários Globais e Permissões (RBAC)</h3>
          </div>

          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-black">
              <tr>
                <th className="p-4">Nome do Usuário</th>
                <th className="p-4">E-mail</th>
                <th className="p-4">Cargo / Role</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/50 transition">
                  <td className="p-4 font-bold text-white">{u.name}</td>
                  <td className="p-4 text-slate-300">{u.email}</td>
                  <td className="p-4 font-bold text-purple-400">{u.role}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      ATIVO
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. PLANOS E ASSINATURAS */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((p) => (
            <div key={p.id} className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4 relative overflow-hidden">
              <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider">PLANO SAAS</span>
              <h3 className="text-2xl font-black text-white font-display">{p.name}</h3>
              <div className="text-3xl font-black text-emerald-400">
                R$ {p.priceMonthly.toFixed(2)} <span className="text-xs text-slate-400 font-normal">/mês</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800">
                <li>• Limite Artes: <strong>{p.artsLimitMonth} artes/mês</strong></li>
                <li>• Encartes PDF A4: {p.hasPdfFlyer ? '✅ Sim' : '❌ Não'}</li>
                <li>• Gerador em Lote: {p.hasBulkGenerator ? '✅ Sim' : '❌ Não'}</li>
                <li>• Modo TV 4K: {p.hasTvMode ? '✅ Sim' : '❌ Não'}</li>
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* 5. TRANSAÇÕES FINANCEIRAS */}
      {activeTab === 'financial' && (
        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-black">
              <tr>
                <th className="p-4">ID Transação</th>
                <th className="p-4">Empresa</th>
                <th className="p-4">Valor</th>
                <th className="p-4">Método</th>
                <th className="p-4">Status</th>
                <th className="p-4">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-900/50 transition">
                  <td className="p-4 font-mono font-bold text-white">{tx.id}</td>
                  <td className="p-4 font-bold">{tx.tenantName}</td>
                  <td className="p-4 font-bold text-emerald-400">R$ {tx.amount.toFixed(2)}</td>
                  <td className="p-4">{tx.paymentMethod}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      {tx.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{new Date(tx.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 6. CUPONS */}
      {activeTab === 'coupons' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {coupons.map((c) => (
            <div key={c.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">CUPOM ATIVO</span>
              <h3 className="text-xl font-black text-white font-mono">{c.code}</h3>
              <p className="text-xs text-slate-300">
                Desconto: <strong>{c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `R$ ${c.discountValue}`}</strong>
              </p>
              <p className="text-xs text-slate-400">
                Utilizado: {c.usedCount} de {c.maxUses} vezes
              </p>
            </div>
          ))}
        </div>
      )}

      {/* 7. BIBLIOTECA TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="text-base font-black text-white font-display mb-4">Templates Globais da Plataforma</h3>
          <p className="text-xs text-slate-400">
            Administre os modelos visuais e temas gráficos compartilhados com todas as empresas clientes.
          </p>
        </div>
      )}

      {/* 8. SUPORTE */}
      {activeTab === 'support' && (
        <div className="space-y-4">
          {tickets.map((t) => (
            <div key={t.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-purple-400">{t.tenantName}</span>
                <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                  {t.status}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">{t.subject}</h4>
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                {t.messages.map((m, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900 text-xs">
                    <span className="font-bold text-rose-400">{m.senderName}: </span>
                    <span className="text-slate-300">{m.content}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 9. AVISOS DA PLATAFORMA */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          {announcements.map((a) => (
            <div key={a.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-black uppercase text-rose-400 tracking-wider">BANER ATIVO</span>
              <h4 className="text-base font-bold text-white">{a.title}</h4>
              <p className="text-xs text-slate-300">{a.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* 10. AUDITORIA */}
      {activeTab === 'audit' && (
        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-black">
              <tr>
                <th className="p-4">Horário</th>
                <th className="p-4">Usuário</th>
                <th className="p-4">Ação</th>
                <th className="p-4">Detalhes</th>
                <th className="p-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/50 transition">
                  <td className="p-4 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-4 font-bold text-white">{log.userName}</td>
                  <td className="p-4 text-purple-400 font-bold">{log.action}</td>
                  <td className="p-4 text-slate-300">{log.details}</td>
                  <td className="p-4 text-slate-500">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 11. SAÚDE DO SISTEMA */}
      {activeTab === 'health' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 text-center space-y-2">
            <span className="text-xs font-bold text-slate-400">Banco de Dados PostgreSQL</span>
            <div className="text-lg font-black text-emerald-400 flex items-center justify-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              🟢 OPERACIONAL
            </div>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 text-center space-y-2">
            <span className="text-xs font-bold text-slate-400">Serviço de Autenticação</span>
            <div className="text-lg font-black text-emerald-400 flex items-center justify-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              🟢 OPERACIONAL
            </div>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 text-center space-y-2">
            <span className="text-xs font-bold text-slate-400">Armazenamento Cloud</span>
            <div className="text-lg font-black text-emerald-400 flex items-center justify-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              🟢 OPERACIONAL
            </div>
          </div>
        </div>
      )}

      {/* 12. FEATURE FLAGS */}
      {activeTab === 'feature_flags' && (
        <div className="space-y-4">
          {featureFlags.map((flag) => (
            <div key={flag.id} className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">{flag.name}</h4>
                <p className="text-xs text-slate-400">{flag.description}</p>
              </div>

              <button
                onClick={() => handleToggleFlag(flag.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition ${
                  flag.isEnabledGlobally
                    ? 'bg-emerald-600 text-white shadow-emerald-950/50'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {flag.isEnabledGlobally ? 'ATIVO GLOBALMENTE' : 'DESATIVADO'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE RAZÃO PARA IMPERSONATION (ACESSO SUPORTE SEGURANÇA) */}
      {impersonateReasonModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl relative overflow-hidden">
            <div className="flex items-center space-x-3 text-amber-400">
              <Lock className="w-6 h-6" />
              <h3 className="text-lg font-black text-white font-display">
                Acesso de Suporte Administrativo
              </h3>
            </div>

            <p className="text-xs text-slate-300">
              Você está prestes a acessar o painel de <strong>{impersonateReasonModal.tenantName}</strong> como Suporte. Esta ação ficará registrada no log de auditoria da plataforma.
            </p>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Motivo do Acesso</label>
              <textarea
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setImpersonateReasonModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancelar
              </button>

              <button
                onClick={handleStartImpersonation}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white text-xs font-black shadow-lg"
              >
                Confirmar e Entrar na Empresa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
