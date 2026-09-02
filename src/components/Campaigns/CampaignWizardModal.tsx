import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Product, TemplateFormat } from '../../types';
import { X, Check, Megaphone, Sparkles, ShoppingBag, Layers, Calendar } from 'lucide-react';

interface CampaignWizardModalProps {
  onClose: () => void;
  onCampaignCreated: (campaignId: string, jobId: string) => void;
}

export const CampaignWizardModal: React.FC<CampaignWizardModalProps> = ({ onClose, onCampaignCreated }) => {
  const { currentTenant } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [name, setName] = useState('OFERTAS DA SEMANA');
  const [startDate, setStartDate] = useState('2026-09-05');
  const [endDate, setEndDate] = useState('2026-09-08');

  // Formatos selecionados
  const [selectedFormats, setSelectedFormats] = useState<TemplateFormat[]>([
    'STORIES_9_16',
    'FEED_1_1',
    'TV_16_9',
    'FLYER_A4'
  ]);

  useEffect(() => {
    if (!currentTenant) return;
    fetch(`/api/products?tenantId=${currentTenant.id}`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setSelectedProductIds(data.map((p: Product) => p.id)); // selecionar todos por padrão
      });
  }, [currentTenant]);

  const toggleProduct = (id: string) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(selectedProductIds.filter(item => item !== id));
    } else {
      setSelectedProductIds([...selectedProductIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedProductIds.length === products.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(products.map(p => p.id));
    }
  };

  const handleGenerateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant || selectedProductIds.length === 0) return;

    try {
      // 1. Criar Campanha
      const campRes = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: currentTenant.id,
          name,
          startDate,
          endDate,
          productIds: selectedProductIds,
          formats: selectedFormats,
          templateId: 'tpl_story_supermercado_vermelho',
        })
      });
      const campaign = await campRes.json();

      // 2. Criar Job de Renderização
      const totalItems = selectedProductIds.length * selectedFormats.length;
      const jobRes = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: currentTenant.id,
          campaignId: campaign.id,
          totalItems,
        })
      });
      const job = await jobRes.json();

      onCampaignCreated(campaign.id, job.id);
    } catch (err) {
      console.error('Erro ao gerar campanha:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase text-rose-400 tracking-wider">
              Central de Campanhas PROMOJÁ
            </span>
            <h3 className="text-2xl font-black text-white font-display flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-rose-500" />
              Criar Nova Campanha Promocional
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleGenerateCampaign} className="space-y-6">
          {/* Dados da Campanha */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase">Nome da Campanha</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: OFERTAS DO FINAL DE SEMANA"
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-bold focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-rose-400" /> Validade Até
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-bold focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Seleção de Produtos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                Produtos Incluídos ({selectedProductIds.length} de {products.length})
              </label>

              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-xs font-bold text-rose-400 hover:text-rose-300"
              >
                {selectedProductIds.length === products.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-3 rounded-2xl bg-slate-950 border border-slate-800">
              {products.map(p => {
                const isSelected = selectedProductIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleProduct(p.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center space-x-3 transition ${
                      isSelected
                        ? 'bg-rose-950/40 border-rose-500/60 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-rose-600 border-rose-500 text-white' : 'border-slate-700'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <img src={p.imageUrl} alt={p.name} className="w-8 h-8 rounded-lg object-contain bg-slate-800" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{p.name}</p>
                      <p className="text-[11px] text-amber-400 font-semibold">R$ {p.pricePromotional.toFixed(2)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Formatos a Gerar */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              Formatos Gerados Automática e Simultaneamente
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'STORIES_9_16', label: 'Stories (9:16)', badge: 'Instagram/Status' },
                { id: 'FEED_1_1', label: 'Feed (1:1)', badge: 'Instagram/FB' },
                { id: 'TV_16_9', label: 'TV da Loja (16:9)', badge: 'Vídeo Slide' },
                { id: 'FLYER_A4', label: 'Folheto PDF (A4)', badge: 'Digital/Impresso' },
              ].map(fmt => (
                <div key={fmt.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase">{fmt.badge}</span>
                    <p className="text-xs font-bold text-white mt-0.5">{fmt.label}</p>
                  </div>
                  <div className="mt-2 text-[10px] text-slate-500 font-semibold">✓ Gerado Auto</div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={selectedProductIds.length === 0}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-black text-sm shadow-xl shadow-rose-950/60 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              GERAR CAMPANHA COMPLETA
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
