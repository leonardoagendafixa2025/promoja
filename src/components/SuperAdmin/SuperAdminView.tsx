import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Tenant, SubscriptionPlan, Template, ElementType, TemplateElement } from '../../types';
import { ShieldAlert, Building, Users, CreditCard, Plus, Layers, Check, Lock, Unlock, Sparkles } from 'lucide-react';

export const SuperAdminView: React.FC = () => {
  const { allTenants, reloadTenants } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [activeTab, setActiveTab] = useState<'tenants' | 'builder'>('tenants');

  // Modal Novo Tenant State
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantPlan, setNewTenantPlan] = useState('plan_pro');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Template Builder State
  const [builderTemplateName, setBuilderTemplateName] = useState('Template Especial Varejo');
  const [builderFormat, setBuilderFormat] = useState<'STORIES_9_16' | 'FEED_1_1' | 'TV_16_9'>('STORIES_9_16');
  const [builderElements, setBuilderElements] = useState<TemplateElement[]>([
    {
      id: 'el_title',
      type: 'text',
      label: 'Título da Promoção',
      posX: 100,
      posY: 100,
      width: 880,
      height: 80,
      fontSize: 56,
      fontColor: '#ffffff',
      content: 'OFERTA IMPERDÍVEL',
      zIndex: 1,
    },
    {
      id: 'el_price',
      type: 'price_promotional',
      label: 'Preço Promocional',
      posX: 140,
      posY: 1200,
      width: 800,
      height: 200,
      fontSize: 100,
      fontColor: '#facc15',
      dynamicField: 'R$ {{preco_promocional}}',
      zIndex: 2,
    }
  ]);

  useEffect(() => {
    fetch('/api/plans')
      .then(res => res.json())
      .then(data => setPlans(data));
  }, []);

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName.trim()) return;

    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTenantName, planId: newTenantPlan }),
      });

      if (res.ok) {
        setNewTenantName('');
        setIsModalOpen(false);
        await reloadTenants();
      }
    } catch (err) {
      console.error('Erro ao criar tenant:', err);
    }
  };

  const handleAddElementToBuilder = (type: ElementType) => {
    const newEl: TemplateElement = {
      id: `el_${Date.now()}`,
      type,
      label: `Novo ${type}`,
      posX: 100,
      posY: 500,
      width: 600,
      height: 100,
      fontSize: 48,
      fontColor: '#ffffff',
      zIndex: builderElements.length + 1,
    };
    setBuilderElements([...builderElements, newEl]);
  };

  const handleSaveBuilderTemplate = async () => {
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: builderTemplateName,
          category: 'SUPERMERCADO',
          format: builderFormat,
          elements: builderElements,
          isGlobal: true,
        })
      });

      if (res.ok) {
        alert('Novo Template Global publicado com sucesso para todos os Tenants!');
      }
    } catch (err) {
      console.error('Erro ao salvar template:', err);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header Super Admin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider">
            Painel do Fundador / CTO SaaS
          </span>
          <h2 className="text-2xl font-black text-white font-display flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-purple-500" />
            Super Admin & Gestão Global
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Gerencie empresas clientes (tenants), planos de assinatura e crie templates globais sem programação.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-950/50 transition"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Nova Empresa (Tenant)
        </button>
      </div>

      {/* Métricas Globais da Plataforma */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Empresas</p>
              <p className="text-3xl font-black text-white mt-1 font-display">{allTenants.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Tenants Ativos</p>
              <p className="text-3xl font-black text-emerald-400 mt-1 font-display">
                {allTenants.filter(t => t.status === 'ACTIVE').length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Check className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">MRR (Receita Mensal)</p>
              <p className="text-3xl font-black text-amber-400 mt-1 font-display">R$ 529,70</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Artes Geradas Hoje</p>
              <p className="text-3xl font-black text-rose-400 mt-1 font-display">1.420</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Navegação entre Tenants e Template Builder */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('tenants')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'tenants' ? 'bg-purple-600 text-white shadow' : 'bg-slate-900 text-slate-400'
          }`}
        >
          Gestão de Tenants / Empresas ({allTenants.length})
        </button>

        <button
          onClick={() => setActiveTab('builder')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'builder' ? 'bg-purple-600 text-white shadow' : 'bg-slate-900 text-slate-400'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          Template Builder para Super Admin
        </button>
      </div>

      {/* Tabela de Tenants */}
      {activeTab === 'tenants' && (
        <div className="glass-panel rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Empresa / Tenant</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Plano</th>
                <th className="p-4">Status</th>
                <th className="p-4">Data Cadastro</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {allTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-4 font-bold text-white flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white font-black">
                      {tenant.name.charAt(0)}
                    </div>
                    <span>{tenant.name}</span>
                  </td>
                  <td className="p-4 text-slate-400 font-mono">{tenant.slug}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                      Profissional
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      {tenant.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{tenant.createdAt.split('T')[0]}</td>
                  <td className="p-4 text-right space-x-2">
                    <button className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white">
                      <Lock className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TEMPLATE BUILDER PARA SUPER ADMIN */}
      {activeTab === 'builder' && (
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white font-display">Construtor Visual de Templates Globais</h3>
              <p className="text-xs text-slate-400">Adicione elementos dinâmicos para criar modelos padrões para todos os clientes do SaaS.</p>
            </div>

            <button
              onClick={handleSaveBuilderTemplate}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Publicar Template Global
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4 md:col-span-1 bg-slate-900 p-4 rounded-xl border border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 uppercase">Adicionar Elemento</h4>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleAddElementToBuilder('text')}
                  className="p-3 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-rose-600 transition"
                >
                  + Texto
                </button>
                <button
                  onClick={() => handleAddElementToBuilder('price_promotional')}
                  className="p-3 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-rose-600 transition"
                >
                  + Preço Promocional
                </button>
                <button
                  onClick={() => handleAddElementToBuilder('image')}
                  className="p-3 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-rose-600 transition"
                >
                  + Foto Produto
                </button>
                <button
                  onClick={() => handleAddElementToBuilder('discount_tag')}
                  className="p-3 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-rose-600 transition"
                >
                  + Selo % OFF
                </button>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase">Nome do Template</label>
                <input
                  type="text"
                  value={builderTemplateName}
                  onChange={(e) => setBuilderTemplateName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>
            </div>

            <div className="md:col-span-2 bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase">Camadas do Template ({builderElements.length})</h4>
              <div className="space-y-2">
                {builderElements.map((el, idx) => (
                  <div key={el.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs text-white">
                    <span className="font-bold">{el.label} ({el.type})</span>
                    <span className="text-slate-500 font-mono">X: {el.posX}px | Y: {el.posY}px</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cadastrar Tenant */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white font-display">Cadastrar Nova Empresa (Tenant)</h3>

            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase">Nome do Comércio *</label>
                <input
                  type="text"
                  required
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                  placeholder="Ex: Padaria & Confeitaria Doce Pão"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase">Plano Inicial</label>
                <select
                  value={newTenantPlan}
                  onChange={(e) => setNewTenantPlan(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="plan_basic">Plano Básico (R$ 79,90/mês)</option>
                  <option value="plan_pro">Plano Profissional (R$ 149,90/mês)</option>
                  <option value="plan_premium">Plano Enterprise (R$ 299,90/mês)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 shadow"
                >
                  Cadastrar Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
