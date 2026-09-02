import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Template, RetailCategory, TemplateFormat } from '../../types';
import { LayoutTemplate, Sparkles, Filter, Eye, Edit3 } from 'lucide-react';
import { SimpleEditorModal } from '../Editor/SimpleEditorModal';

export const TemplatesView: React.FC = () => {
  const { currentTenant } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<RetailCategory | 'ALL'>('ALL');
  const [selectedFormat, setSelectedFormat] = useState<TemplateFormat | 'ALL'>('ALL');
  const [activeEditorTemplate, setActiveEditorTemplate] = useState<Template | null>(null);

  useEffect(() => {
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => {
        const localSaved = JSON.parse(localStorage.getItem('promoja_custom_templates') || '[]');
        const mergedMap = new Map<string, Template>();
        (data || []).forEach((t: Template) => mergedMap.set(t.id, t));
        localSaved.forEach((t: Template) => mergedMap.set(t.id, t));
        setTemplates(Array.from(mergedMap.values()));
      })
      .catch(() => {
        const localSaved = JSON.parse(localStorage.getItem('promoja_custom_templates') || '[]');
        setTemplates(localSaved);
      });
  }, []);

  const categories: { id: RetailCategory | 'ALL'; label: string }[] = [
    { id: 'ALL', label: 'Todos os Segmentos' },
    { id: 'SUPERMERCADO', label: 'Supermercado' },
    { id: 'ACOUQUE', label: 'Açougue & Carnes' },
    { id: 'HORTIFRUTI', label: 'Hortifruti & Feira' },
    { id: 'FARMACIA', label: 'Farmácia & Drogaria' },
    { id: 'GENERICO', label: 'Promoções Genéricas' },
  ];

  const formats: { id: TemplateFormat | 'ALL'; label: string }[] = [
    { id: 'ALL', label: 'Todos os Formatos' },
    { id: 'STORIES_9_16', label: 'Stories / Status (9:16)' },
    { id: 'FEED_1_1', label: 'Feed Quadrado (1:1)' },
    { id: 'TV_16_9', label: 'TV da Loja (16:9)' },
  ];

  const filteredTemplates = templates.filter(t => {
    const matchCat = selectedCategory === 'ALL' || t.category === selectedCategory;
    const matchFmt = selectedFormat === 'ALL' || t.format === selectedFormat;
    return matchCat && matchFmt;
  });

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-black text-white font-display flex items-center gap-2">
          <LayoutTemplate className="w-7 h-7 text-rose-500" />
          Biblioteca de Templates Promocionais
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Escolha um template profissional pronto para seu segmento e edite em tempo real sem precisar de conhecimento técnico.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                selectedCategory === c.id
                  ? 'bg-rose-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-bold focus:outline-none"
          >
            {formats.map(f => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid de Templates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTemplates.map((t) => (
          <div key={t.id} className="glass-card rounded-2xl overflow-hidden group flex flex-col justify-between p-4 relative">
            <div className="space-y-3">
              <div className="aspect-[9/14] rounded-xl bg-slate-900 overflow-hidden relative group">
                <img
                  src={t.thumbnailUrl}
                  alt={t.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  <button
                    onClick={() => setActiveEditorTemplate(t)}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 transition transform scale-90 group-hover:scale-100"
                  >
                    <Edit3 className="w-4 h-4" />
                    Editar Arte
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                  {t.category} • {t.format}
                </span>
                <h3 className="text-sm font-bold text-white line-clamp-1 mt-0.5">{t.name}</h3>
              </div>
            </div>

            <button
              onClick={() => setActiveEditorTemplate(t)}
              className="mt-4 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Usar Este Template
            </button>
          </div>
        ))}
      </div>

      {/* Modal do Editor Simplificado */}
      {activeEditorTemplate && (
        <SimpleEditorModal
          template={activeEditorTemplate}
          onClose={() => setActiveEditorTemplate(null)}
        />
      )}
    </div>
  );
};
