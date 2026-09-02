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
  Radio,
  Edit,
  X,
  Send,
  PlusCircle,
  Copy,
  LayoutTemplate
} from 'lucide-react';
import { Tenant, User, SubscriptionPlan, Transaction, Coupon, SupportTicket, PlatformAnnouncement, FeatureFlag, AuditLog, SystemHealth, Template } from '../../types';
import { SuperAdminSubTab } from '../Layout/Sidebar';

interface SuperAdminViewProps {
  subTab?: SuperAdminSubTab;
}

export const SuperAdminView: React.FC<SuperAdminViewProps> = ({ subTab = 'dashboard' }) => {
  const { currentTenant, currentUser, impersonateTenant } = useAuth();
  const [activeTab, setActiveTab] = useState<SuperAdminSubTab>(subTab);

  useEffect(() => {
    setActiveTab(subTab);
  }, [subTab]);

  // Estados de dados da API
  const [metricsData, setMetricsData] = useState<any>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [announcements, setAnnouncements] = useState<PlatformAnnouncement[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTenantFilter, setSelectedTenantFilter] = useState<string>('ALL');

  // MODAIS E FORMULÁRIOS INTERATIVOS
  const [isNewTenantModalOpen, setIsNewTenantModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false);
  const [isNewCouponModalOpen, setIsNewCouponModalOpen] = useState(false);
  const [isNewTemplateModalOpen, setIsNewTemplateModalOpen] = useState(false);
  const [isNewAnnouncementModalOpen, setIsNewAnnouncementModalOpen] = useState(false);
  const [replyingTicket, setReplyingTicket] = useState<SupportTicket | null>(null);

  const [impersonateReasonModal, setImpersonateReasonModal] = useState<{ isOpen: boolean; tenantId: string; tenantName: string } | null>(null);
  const [reasonInput, setReasonInput] = useState('Suporte técnico aos produtos e artes');

  // FORM STATES
  const [newTenantForm, setNewTenantForm] = useState({
    name: '',
    slug: '',
    planId: 'plan_pro',
    ownerEmail: '',
    ownerPhone: '',
    primaryColor: '#e11d48',
  });

  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    role: 'ADMIN',
    tenantId: '',
  });

  const [newPlanForm, setNewPlanForm] = useState({
    name: '',
    priceMonthly: 149.90,
    priceYearly: 1490.00,
    artsLimitMonth: 500,
    hasWatermark: false,
    hasBulkGenerator: true,
    hasPdfFlyer: true,
    hasOnlineCatalog: true,
    hasTvMode: true,
    hasMultiStore: false,
  });

  const [newCouponForm, setNewCouponForm] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    validUntil: '2026-12-31',
    maxUses: 100,
  });

  const [newTemplateForm, setNewTemplateForm] = useState({
    name: '',
    category: 'SUPERMERCADO' as any,
    format: 'STORIES_9_16' as any,
    bgGradient: 'linear-gradient(180deg, #be123c 0%, #881337 100%)',
    hasSpotlight: true,
    isGlobal: true,
  });

  const [newAnnouncementForm, setNewAnnouncementForm] = useState({
    title: '',
    message: '',
    type: 'INFO',
    priority: 'NORMAL',
    targetAudience: 'ALL',
  });

  const [ticketReplyText, setTicketReplyText] = useState('');

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
        templatesRes,
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
        fetch('/api/templates'),
        fetch('/api/admin/tickets'),
        fetch('/api/admin/announcements'),
        fetch('/api/admin/audit-logs'),
        fetch('/api/admin/system-health'),
        fetch('/api/admin/feature-flags')
      ]);

      if (metricsRes.ok) setMetricsData(await metricsRes.json());
      if (tenantsRes.ok) {
        const loadedTenants: Tenant[] = await tenantsRes.json();
        setTenants(loadedTenants);
        if (loadedTenants.length > 0) setNewUserForm(prev => ({ ...prev, tenantId: loadedTenants[0].id }));
      }
      if (usersRes.ok) setUsers(await usersRes.json());
      if (plansRes.ok) setPlans(await plansRes.json());
      if (txsRes.ok) setTransactions(await txsRes.json());
      if (couponsRes.ok) setCoupons(await couponsRes.json());
      if (templatesRes.ok) setTemplates(await templatesRes.json());
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

  // --- HANDLERS DE AÇÕES DE PRODUÇÃO ---

  // 1. Criar Empresa (Tenant)
  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTenantForm,
          brandKit: {
            primaryColor: newTenantForm.primaryColor,
            secondaryColor: '#facc15',
            accentColor: '#16a34a',
            fontFamily: 'Outfit',
            phone: newTenantForm.ownerPhone,
            instagram: `@${newTenantForm.slug}`,
            address: 'Endereço da Loja',
            slogan: 'As melhores ofertas da cidade!',
            customFooter: 'Ofertas válidas hoje.',
          }
        })
      });
      if (res.ok) {
        const created = await res.json();
        setTenants(prev => [...prev, created]);
        setIsNewTenantModalOpen(false);
        setNewTenantForm({ name: '', slug: '', planId: 'plan_pro', ownerEmail: '', ownerPhone: '', primaryColor: '#e11d48' });
        fetchAdminData();
      }
    } catch (err) {
      alert('Erro ao cadastrar empresa');
    }
  };

  // 2. Editar / Alterar Status de Empresa
  const handleSaveTenantEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;
    try {
      const res = await fetch(`/api/tenants/${editingTenant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTenant)
      });
      if (res.ok) {
        const updated = await res.json();
        setTenants(prev => prev.map(t => t.id === updated.id ? updated : t));
        setEditingTenant(null);
      }
    } catch (err) {
      alert('Erro ao atualizar empresa');
    }
  };

  const handleToggleTenantStatus = async (tenant: Tenant) => {
    const newStatus = tenant.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetch(`/api/tenants/${tenant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setTenants(prev => prev.map(t => t.id === updated.id ? updated : t));
      }
    } catch (err) {
      alert('Erro ao alterar status da empresa');
    }
  };

  // 3. Criar Usuário
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserForm)
      });
      if (res.ok) {
        const created = await res.json();
        setUsers(prev => [...prev, created]);
        setIsNewUserModalOpen(false);
        setNewUserForm({ name: '', email: '', role: 'ADMIN', tenantId: tenants[0]?.id || '' });
      }
    } catch (err) {
      alert('Erro ao cadastrar usuário');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja remover este usuário?')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== userId));
      }
    } catch (err) {
      alert('Erro ao remover usuário');
    }
  };

  // 4. Criar Plano
  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlanForm)
      });
      if (res.ok) {
        const created = await res.json();
        setPlans(prev => [...prev, created]);
        setIsNewPlanModalOpen(false);
      }
    } catch (err) {
      alert('Erro ao criar plano');
    }
  };

  // 5. Criar Cupom
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCouponForm)
      });
      if (res.ok) {
        const created = await res.json();
        setCoupons(prev => [...prev, created]);
        setIsNewCouponModalOpen(false);
      }
    } catch (err) {
      alert('Erro ao criar cupom');
    }
  };

  // 6. Criar Template Global
  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTemplateForm,
          thumbnailUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300&auto=format&fit=crop&q=80',
          elements: [
            {
              id: `el_${Date.now()}_1`,
              type: 'ribbon_banner',
              label: 'Banner Oferta',
              posX: 140,
              posY: 120,
              width: 800,
              height: 110,
              bgColor: '#facc15',
              fontColor: '#0f172a',
              fontSize: 52,
              content: 'SUPER OFERTA',
              zIndex: 1,
            },
            {
              id: `el_${Date.now()}_2`,
              type: 'image',
              label: 'Foto do Produto',
              posX: 140,
              posY: 320,
              width: 800,
              height: 800,
              zIndex: 2,
            },
            {
              id: `el_${Date.now()}_3`,
              type: 'text',
              label: 'Nome do Produto',
              posX: 90,
              posY: 1180,
              width: 900,
              height: 180,
              dynamicField: '{{nome_produto}}',
              fontSize: 64,
              fontColor: '#ffffff',
              fontStyle: 'black',
              alignment: 'center',
              zIndex: 3,
            },
            {
              id: `el_${Date.now()}_4`,
              type: 'price_promotional',
              label: 'Preço Promocional',
              posX: 210,
              posY: 1490,
              width: 660,
              height: 145,
              fontSize: 115,
              fontColor: '#ffffff',
              alignment: 'center',
              zIndex: 5,
            }
          ]
        })
      });

      if (res.ok) {
        const created = await res.json();
        setTemplates(prev => [...prev, created]);
        setIsNewTemplateModalOpen(false);
      }
    } catch (err) {
      alert('Erro ao criar template global');
    }
  };

  // 7. Responder Ticket de Suporte
  const handleReplyTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingTicket || !ticketReplyText.trim()) return;
    try {
      const updatedMessages = [
        ...replyingTicket.messages,
        {
          senderName: currentUser?.name || 'Carlos Mendes (Suporte)',
          senderRole: 'SUPPORT' as const,
          content: ticketReplyText.trim(),
          createdAt: new Date().toISOString(),
        }
      ];

      const res = await fetch('/api/admin/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...replyingTicket,
          status: 'RESOLVED',
          messages: updatedMessages
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
        setReplyingTicket(null);
        setTicketReplyText('');
      }
    } catch (err) {
      alert('Erro ao enviar resposta do ticket');
    }
  };

  // 8. Criar Aviso da Plataforma
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAnnouncementForm)
      });
      if (res.ok) {
        const created = await res.json();
        setAnnouncements(prev => [...prev, created]);
        setIsNewAnnouncementModalOpen(false);
      }
    } catch (err) {
      alert('Erro ao publicar aviso');
    }
  };

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

            <div className="flex items-center space-x-3">
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

              <button
                onClick={() => setIsNewTenantModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Nova Empresa
              </button>
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
                      <button
                        onClick={() => handleToggleTenantStatus(t)}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase transition ${
                          t.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-rose-500/30 hover:text-rose-300'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-emerald-500/30 hover:text-emerald-300'
                        }`}
                      >
                        {t.status}
                      </button>
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setEditingTenant(t)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold inline-flex items-center gap-1 transition"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Editar
                      </button>

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
        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 space-y-4">
          <div className="p-5 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-base font-black text-white font-display">Usuários Globais e Permissões (RBAC)</h3>
            <button
              onClick={() => setIsNewUserModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Novo Usuário
            </button>
          </div>

          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-black">
              <tr>
                <th className="p-4">Nome do Usuário</th>
                <th className="p-4">E-mail</th>
                <th className="p-4">Cargo / Role</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/50 transition">
                  <td className="p-4 font-bold text-white">{u.name}</td>
                  <td className="p-4 text-slate-300">{u.email}</td>
                  <td className="p-4 font-bold text-purple-400">{u.role}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="px-2 py-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-bold transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. PLANOS E ASSINATURAS */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setIsNewPlanModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Criar Novo Plano
            </button>
          </div>

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
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setIsNewCouponModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Criar Cupom
            </button>
          </div>

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
        </div>
      )}

      {/* 7. BIBLIOTECA TEMPLATES GLOBAIS DA PLATAFORMA */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-white font-display">Biblioteca de Templates Globais</h3>
              <p className="text-xs text-slate-400">Modelos visuais e temas gráficos oficiais da plataforma fornecidos aos lojistas.</p>
            </div>

            <button
              onClick={() => setIsNewTemplateModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 transition shadow-lg shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Novo Template Global</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((tpl) => (
              <div key={tpl.id} className="glass-card p-5 rounded-3xl border border-slate-800 space-y-4 relative overflow-hidden group">
                <div 
                  className="w-full h-44 rounded-2xl relative flex items-center justify-center p-4 shadow-inner"
                  style={{ background: tpl.bgGradient || tpl.bgColor || '#1e293b' }}
                >
                  <div className="text-center text-white space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-950/60 border border-white/20">
                      {tpl.format}
                    </span>
                    <h4 className="text-sm font-black font-display text-white">{tpl.name}</h4>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                    {tpl.category}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-400">
                    {tpl.elements?.length || 0} Elementos
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. CENTRAL DE SUPORTE MULTI-TENANT */}
      {activeTab === 'support' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-white font-display flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-purple-400" />
                Central de Suporte & Chamados Técnicos
              </h3>
              <p className="text-xs text-slate-400">Atendimento a lojistas, resolução de tickets e logs de assistência.</p>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={selectedTenantFilter}
                onChange={(e) => setSelectedTenantFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-xs font-bold text-white rounded-xl px-3 py-2 cursor-pointer"
              >
                <option value="ALL">Todos os Chamados</option>
                <option value="OPEN">Apenas Abertos</option>
                <option value="IN_PROGRESS">Em Andamento</option>
                <option value="RESOLVED">Concluídos / Resolvidos</option>
              </select>

              <button
                onClick={() => setIsNewAnnouncementModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-lg shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Aviso / Ticket</span>
              </button>
            </div>
          </div>

          {tickets.length === 0 ? (
            <div className="glass-panel p-10 rounded-3xl border border-slate-800 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto">
                <LifeBuoy className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-black text-white">Nenhum Chamado Pendente no Momento</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Todos os supermercados e lojistas parceiros estão utilizando a plataforma com 100% de estabilidade.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets
                .filter(t => selectedTenantFilter === 'ALL' || t.status === selectedTenantFilter)
                .map((t) => (
                  <div key={t.id} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center space-x-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
                        <div>
                          <span className="text-xs font-black text-white font-display">{t.tenantName}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">Chamado #{t.id} • {new Date(t.createdAt).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase border ${
                          t.status === 'OPEN'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : t.status === 'IN_PROGRESS'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}>
                          {t.status === 'OPEN' ? '🟢 ABERTO' : t.status === 'IN_PROGRESS' ? '🟡 EM ANDAMENTO' : '✅ CONCLUÍDO'}
                        </span>

                        <button
                          onClick={() => setReplyingTicket(t)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{t.status === 'RESOLVED' ? 'Ver Histórico' : 'Responder Chamado'}</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-slate-100 font-display">{t.subject}</h4>
                    </div>

                    <div className="space-y-2 pt-1">
                      {t.messages.map((m, idx) => (
                        <div 
                          key={idx} 
                          className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                            m.senderRole === 'SUPPORT' 
                              ? 'bg-purple-950/40 border border-purple-500/30 text-purple-100 ml-4' 
                              : 'bg-slate-900 border border-slate-800 text-slate-200 mr-4'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold text-[11px]">
                            <span className={m.senderRole === 'SUPPORT' ? 'text-purple-300' : 'text-rose-400'}>
                              {m.senderName} {m.senderRole === 'SUPPORT' && '(Equipe PROMOJÁ)'}
                            </span>
                            <span className="text-slate-500 font-mono text-[9px]">
                              {new Date(m.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-slate-300 leading-relaxed">{m.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* 9. AVISOS DA PLATAFORMA */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-white font-display flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-400" />
                Avisos Globais da Plataforma
              </h3>
              <p className="text-xs text-slate-400">Notificações e banners informativos transmitidos para todos os painéis de lojistas.</p>
            </div>

            <button
              onClick={() => setIsNewAnnouncementModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-lg shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Publicar Novo Aviso</span>
            </button>
          </div>

          {announcements.length === 0 ? (
            <div className="glass-panel p-10 rounded-3xl border border-slate-800 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto">
                <Bell className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-black text-white">Nenhum Aviso Ativo</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Publicações enviadas aqui aparecerão como alertas no painel superior de todos os supermercados cadastrados.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((a) => (
                <div key={a.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2 relative overflow-hidden shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                      a.type === 'PROMOTION'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                    }`}>
                      {a.type} • {a.targetAudience}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(a.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-base font-black text-white font-display">{a.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{a.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 10. LOGS DE AUDITORIA */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-black text-white font-display flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              Logs de Auditoria & Segurança do Sistema
            </h3>
            <p className="text-xs text-slate-400">Rastreabilidade completa de ações administrativas, acessos e alterações de configuração.</p>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-black">
                <tr>
                  <th className="p-4">Horário</th>
                  <th className="p-4">Usuário</th>
                  <th className="p-4">Ação</th>
                  <th className="p-4">Detalhes</th>
                  <th className="p-4">Endereço IP</th>
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
        </div>
      )}

      {/* 11. SAÚDE DO SISTEMA & TELEMETRIA */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-black text-white font-display flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-400" />
              Saúde do Sistema & Telemetria em Tempo Real
            </h3>
            <p className="text-xs text-slate-400">Monitoramento da infraestrutura cloud, serviços de API e status dos bancos de dados.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 text-center space-y-2">
              <span className="text-xs font-bold text-slate-400">Banco de Dados PostgreSQL</span>
              <div className="text-lg font-black text-emerald-400 flex items-center justify-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                🟢 OPERACIONAL (14ms)
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800 text-center space-y-2">
              <span className="text-xs font-bold text-slate-400">Serviço de Autenticação JWT</span>
              <div className="text-lg font-black text-emerald-400 flex items-center justify-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                🟢 OPERACIONAL (100%)
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800 text-center space-y-2">
              <span className="text-xs font-bold text-slate-400">Armazenamento Cloud</span>
              <div className="text-lg font-black text-emerald-400 flex items-center justify-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                🟢 OPERACIONAL (24 MB)
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800 text-center space-y-2">
              <span className="text-xs font-bold text-slate-400">Disponibilidade (Uptime)</span>
              <div className="text-lg font-black text-purple-400 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                99.98% SLA
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 12. FEATURE FLAGS & CHAVES DE FUNCIONALIDADE */}
      {activeTab === 'feature_flags' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-white font-display flex items-center gap-2">
                <Flag className="w-5 h-5 text-purple-400" />
                Feature Flags & Chaves de Controle
              </h3>
              <p className="text-xs text-slate-400">Habilite ou desabilite recursos experimentais e módulos globais em tempo real.</p>
            </div>
          </div>

          {featureFlags.length === 0 ? (
            <div className="glass-panel p-10 rounded-3xl border border-slate-800 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto">
                <Flag className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-black text-white">Nenhuma Feature Flag Cadastrada</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Todas as chaves de controle globais estão ativas no ambiente padrão.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {featureFlags.map((flag) => (
                <div key={flag.id} className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black text-white font-display">{flag.name}</span>
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[9px] font-mono font-bold border border-purple-500/30">
                        {flag.key}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{flag.description}</p>
                  </div>

                  <button
                    onClick={() => handleToggleFlag(flag.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition shrink-0 ${
                      flag.isEnabledGlobally
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {flag.isEnabledGlobally ? '🟢 ATIVO GLOBALMENTE' : '⚪ DESATIVADO'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: NOVO TEMPLATE GLOBAL */}
      {isNewTemplateModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateTemplate} className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white">Criar Novo Template Global</h3>
              <button type="button" onClick={() => setIsNewTemplateModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Nome do Template</label>
                <input required type="text" value={newTemplateForm.name} onChange={e => setNewTemplateForm(p => ({ ...p, name: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" placeholder="Ex: Varejo Impacto Neon Red" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Categoria</label>
                  <select value={newTemplateForm.category} onChange={e => setNewTemplateForm(p => ({ ...p, category: e.target.value as any }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white">
                    <option value="SUPERMERCADO">SUPERMERCADO</option>
                    <option value="HORTIFRUTI">HORTIFRUTI</option>
                    <option value="ACOUQUE">AÇOUGUE</option>
                    <option value="FARMACIA">FARMÁCIA</option>
                    <option value="PADARIA">PADARIA</option>
                    <option value="BEBIDAS">BEBIDAS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Formato Mídia</label>
                  <select value={newTemplateForm.format} onChange={e => setNewTemplateForm(p => ({ ...p, format: e.target.value as any }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white">
                    <option value="STORIES_9_16">STORIES (9:16)</option>
                    <option value="FEED_1_1">FEED (1:1)</option>
                    <option value="TV_16_9">TV DA LOJA (16:9)</option>
                    <option value="FLYER_A4">FOLHETO PDF A4</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button type="button" onClick={() => setIsNewTemplateModalOpen(false)} className="px-4 py-2 bg-slate-800 text-xs text-slate-300 rounded-xl">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-purple-600 text-xs font-bold text-white rounded-xl">Publicar Template Global</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 1: NOVA EMPRESA (TENANT) */}
      {isNewTenantModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateTenant} className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white">Cadastrar Nova Empresa (Tenant)</h3>
              <button type="button" onClick={() => setIsNewTenantModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Nome da Empresa</label>
                <input required type="text" value={newTenantForm.name} onChange={e => setNewTenantForm(p => ({ ...p, name: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" placeholder="Ex: Supermercado Viva Bem" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Slug URL</label>
                <input required type="text" value={newTenantForm.slug} onChange={e => setNewTenantForm(p => ({ ...p, slug: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" placeholder="ex: supermercado-viva-bem" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Plano Inicial</label>
                <select value={newTenantForm.planId} onChange={e => setNewTenantForm(p => ({ ...p, planId: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white">
                  <option value="plan_free">Gratuito</option>
                  <option value="plan_basic">Básico</option>
                  <option value="plan_pro">Profissional</option>
                  <option value="plan_premium">Enterprise</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">E-mail do Proprietário</label>
                <input required type="email" value={newTenantForm.ownerEmail} onChange={e => setNewTenantForm(p => ({ ...p, ownerEmail: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" placeholder="proprietario@empresa.com.br" />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button type="button" onClick={() => setIsNewTenantModalOpen(false)} className="px-4 py-2 bg-slate-800 text-xs text-slate-300 rounded-xl">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-purple-600 text-xs font-bold text-white rounded-xl">Cadastrar Empresa</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: EDITAR TENANT */}
      {editingTenant && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveTenantEdit} className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white">Editar Empresa & Plano</h3>
              <button type="button" onClick={() => setEditingTenant(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Nome da Empresa</label>
                <input required type="text" value={editingTenant.name} onChange={e => setEditingTenant({ ...editingTenant, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Plano Assinado</label>
                <select value={editingTenant.planId} onChange={e => setEditingTenant({ ...editingTenant, planId: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white">
                  <option value="plan_free">Gratuito</option>
                  <option value="plan_basic">Básico</option>
                  <option value="plan_pro">Profissional</option>
                  <option value="plan_premium">Enterprise</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Status</label>
                <select value={editingTenant.status} onChange={e => setEditingTenant({ ...editingTenant, status: e.target.value as any })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white">
                  <option value="ACTIVE">ATIVO</option>
                  <option value="SUSPENDED">SUSPENSO</option>
                  <option value="TRIAL">TRIAL</option>
                  <option value="EXPIRED">EXPIRADO</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button type="button" onClick={() => setEditingTenant(null)} className="px-4 py-2 bg-slate-800 text-xs text-slate-300 rounded-xl">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-purple-600 text-xs font-bold text-white rounded-xl">Salvar Alterações</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: NOVO USUÁRIO (RBAC) */}
      {isNewUserModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateUser} className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white">Cadastrar Novo Usuário</h3>
              <button type="button" onClick={() => setIsNewUserModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Nome Completo</label>
                <input required type="text" value={newUserForm.name} onChange={e => setNewUserForm(p => ({ ...p, name: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">E-mail</label>
                <input required type="email" value={newUserForm.email} onChange={e => setNewUserForm(p => ({ ...p, email: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Cargo / Role</label>
                <select value={newUserForm.role} onChange={e => setNewUserForm(p => ({ ...p, role: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white">
                  <option value="SUPER_ADMIN">Super Admin (Global)</option>
                  <option value="ADMIN">Admin da Empresa</option>
                  <option value="SUPPORT">Suporte Técnico</option>
                  <option value="FINANCIAL">Financeiro</option>
                  <option value="OPERATIONAL">Operacional</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Empresa Associada</label>
                <select value={newUserForm.tenantId} onChange={e => setNewUserForm(p => ({ ...p, tenantId: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white">
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button type="button" onClick={() => setIsNewUserModalOpen(false)} className="px-4 py-2 bg-slate-800 text-xs text-slate-300 rounded-xl">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-purple-600 text-xs font-bold text-white rounded-xl">Cadastrar Usuário</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 4: NOVO PLANO */}
      {isNewPlanModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreatePlan} className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white">Criar Novo Plano SaaS</h3>
              <button type="button" onClick={() => setIsNewPlanModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Nome do Plano</label>
                <input required type="text" value={newPlanForm.name} onChange={e => setNewPlanForm(p => ({ ...p, name: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" placeholder="Ex: Plano Intermediário" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Preço Mensal (R$)</label>
                  <input required type="number" step="0.01" value={newPlanForm.priceMonthly} onChange={e => setNewPlanForm(p => ({ ...p, priceMonthly: parseFloat(e.target.value) || 0 }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Limite Artes/Mês</label>
                  <input required type="number" value={newPlanForm.artsLimitMonth} onChange={e => setNewPlanForm(p => ({ ...p, artsLimitMonth: parseInt(e.target.value) || 100 }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button type="button" onClick={() => setIsNewPlanModalOpen(false)} className="px-4 py-2 bg-slate-800 text-xs text-slate-300 rounded-xl">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-purple-600 text-xs font-bold text-white rounded-xl">Salvar Plano</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 5: NOVO CUPOM */}
      {isNewCouponModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateCoupon} className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white">Criar Cupom de Desconto</h3>
              <button type="button" onClick={() => setIsNewCouponModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Código do Cupom</label>
                <input required type="text" value={newCouponForm.code} onChange={e => setNewCouponForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono" placeholder="Ex: OFERTA50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Tipo de Desconto</label>
                  <select value={newCouponForm.discountType} onChange={e => setNewCouponForm(p => ({ ...p, discountType: e.target.value as any }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white">
                    <option value="PERCENTAGE">Porcentagem (%)</option>
                    <option value="FIXED">Valor Fixo (R$)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Valor do Desconto</label>
                  <input required type="number" value={newCouponForm.discountValue} onChange={e => setNewCouponForm(p => ({ ...p, discountValue: parseFloat(e.target.value) || 0 }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button type="button" onClick={() => setIsNewCouponModalOpen(false)} className="px-4 py-2 bg-slate-800 text-xs text-slate-300 rounded-xl">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-purple-600 text-xs font-bold text-white rounded-xl">Criar Cupom</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 6: RESPONDER TICKET DE SUPORTE */}
      {replyingTicket && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form onSubmit={handleReplyTicket} className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white">Responder Ticket #{replyingTicket.id}</h3>
              <button type="button" onClick={() => setReplyingTicket(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <p className="text-xs text-slate-300">Cliente: <strong>{replyingTicket.tenantName}</strong> • {replyingTicket.subject}</p>

            <div className="space-y-2">
              <label className="block text-xs text-slate-400">Sua Resposta de Suporte</label>
              <textarea required rows={4} value={ticketReplyText} onChange={e => setTicketReplyText(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white" placeholder="Digite a resposta que será enviada ao lojista..." />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button type="button" onClick={() => setReplyingTicket(null)} className="px-4 py-2 bg-slate-800 text-xs text-slate-300 rounded-xl">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-purple-600 text-xs font-bold text-white rounded-xl flex items-center gap-1.5"><Send className="w-4 h-4" /> Enviar Resposta</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 7: NOVO AVISO DA PLATAFORMA */}
      {isNewAnnouncementModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateAnnouncement} className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white">Publicar Novo Aviso na Plataforma</h3>
              <button type="button" onClick={() => setIsNewAnnouncementModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Título do Aviso</label>
                <input required type="text" value={newAnnouncementForm.title} onChange={e => setNewAnnouncementForm(p => ({ ...p, title: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" placeholder="Ex: Manutenção Programada das 02h às 04h" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Mensagem Completa</label>
                <textarea required rows={3} value={newAnnouncementForm.message} onChange={e => setNewAnnouncementForm(p => ({ ...p, message: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" placeholder="Digite os detalhes para os comerciantes..." />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button type="button" onClick={() => setIsNewAnnouncementModalOpen(false)} className="px-4 py-2 bg-slate-800 text-xs text-slate-300 rounded-xl">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-purple-600 text-xs font-bold text-white rounded-xl">Publicar Aviso</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL DE IMPERSONATION (ACESSO SUPORTE SEGURANÇA) */}
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
