import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Palette, Check, Save, Image as ImageIcon, Instagram, Phone, MapPin, Type, Sparkles } from 'lucide-react';

export const BrandKitView: React.FC = () => {
  const { currentTenant, updateBrandKitState } = useAuth();
  const [formData, setFormData] = useState({
    primaryColor: currentTenant?.brandKit.primaryColor || '#e11d48',
    secondaryColor: currentTenant?.brandKit.secondaryColor || '#facc15',
    accentColor: currentTenant?.brandKit.accentColor || '#16a34a',
    fontFamily: currentTenant?.brandKit.fontFamily || 'Outfit',
    instagram: currentTenant?.brandKit.instagram || '@minhaempresa',
    phone: currentTenant?.brandKit.phone || '(11) 98765-4321',
    address: currentTenant?.brandKit.address || 'Rua Principal, 100',
    slogan: currentTenant?.brandKit.slogan || 'O menor preço da região!',
    customFooter: currentTenant?.brandKit.customFooter || 'Ofertas válidas enquanto durarem os estoques.',
    logoUrl: currentTenant?.brandKit.logoUrl || '',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant) return;

    try {
      const res = await fetch(`/api/tenants/${currentTenant.id}/brand-kit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        updateBrandKitState(formData);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Erro ao salvar Brand Kit:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white font-display flex items-center gap-2">
            <Palette className="w-7 h-7 text-rose-500" />
            Brand Kit & Identidade Visual
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Configure a identidade visual do seu comércio. Todas as artes e campanhas serão personalizadas automaticamente com estas informações.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-xl text-xs font-bold border border-emerald-500/40 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-400" />
            Brand Kit Salvo com Sucesso!
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Logos & Mídia */}
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <h3 className="text-base font-bold text-white font-display flex items-center gap-2 border-b border-slate-800 pb-3">
            <ImageIcon className="w-5 h-5 text-rose-400" />
            Logotipo da Empresa
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">URL do Logotipo (PNG Transparente)</label>
              <input
                type="url"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                placeholder="https://exemplo.com/logo.png"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-rose-500 transition"
              />
              <p className="text-[11px] text-slate-500">Recomendado: Imagem PNG em alta resolução com fundo transparente.</p>
            </div>

            <div className="flex items-center justify-center p-6 bg-slate-900/80 rounded-xl border border-dashed border-slate-700 min-h-[120px]">
              {formData.logoUrl ? (
                <img src={formData.logoUrl} alt="Logo Preview" className="max-h-20 object-contain" />
              ) : (
                <div className="text-center text-slate-500 space-y-1">
                  <ImageIcon className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-xs font-medium">Pré-visualização do Logo</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cores & Tipografia */}
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <h3 className="text-base font-bold text-white font-display flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Cores da Marca & Tipografia
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Cor Primária</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-12 h-12 rounded-xl bg-transparent cursor-pointer border border-slate-700 p-1"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm uppercase font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Cor Secundária</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="w-12 h-12 rounded-xl bg-transparent cursor-pointer border border-slate-700 p-1"
                />
                <input
                  type="text"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm uppercase font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Fonte das Artes</label>
              <div className="flex items-center gap-2">
                <Type className="w-5 h-5 text-slate-400 ml-1" />
                <select
                  value={formData.fontFamily}
                  onChange={(e) => setFormData({ ...formData, fontFamily: e.target.value })}
                  className="w-full px-3 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm font-semibold focus:outline-none focus:border-rose-500"
                >
                  <option value="Outfit">Outfit (Moderna & Impactante)</option>
                  <option value="Inter">Inter (Limpa & Legível)</option>
                  <option value="Roboto">Roboto (Clássica)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Informações Comerciais */}
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <h3 className="text-base font-bold text-white font-display flex items-center gap-2 border-b border-slate-800 pb-3">
            <Instagram className="w-5 h-5 text-emerald-400" />
            Redes Sociais & Contato Comercial
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-rose-400" /> Instagram
              </label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="@seucomercio"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" /> Telefone / WhatsApp
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(00) 00000-0000"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" /> Endereço da Loja
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Rua, Número, Bairro, Cidade - UF"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Slogan / Frase de Impacto</label>
              <input
                type="text"
                value={formData.slogan}
                onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                placeholder="Ex: O menor preço da cidade todo dia!"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>
        </div>

        {/* Botão de Salvar */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-base shadow-xl shadow-rose-950/60 flex items-center gap-2 transition transform active:scale-95"
          >
            <Save className="w-5 h-5" />
            Salvar Brand Kit
          </button>
        </div>
      </form>
    </div>
  );
};
