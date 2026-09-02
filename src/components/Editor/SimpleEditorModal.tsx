import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Template, Product, TemplateFormat } from '../../types';
import { CanvasEngine } from '../../services/canvasEngine';
import { X, Download, RefreshCw, Sparkles, Layers, ZoomIn, ZoomOut } from 'lucide-react';

interface SimpleEditorModalProps {
  template: Template;
  onClose: () => void;
}

export const SimpleEditorModal: React.FC<SimpleEditorModalProps> = ({ template, onClose }) => {
  const { currentTenant } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentFormat, setCurrentFormat] = useState<TemplateFormat>(template.format);

  // Form Fields Overrides
  const [customPriceNormal, setCustomPriceNormal] = useState<number>(0);
  const [customPricePromotional, setCustomPricePromotional] = useState<number>(0);
  const [customHighlightTag, setCustomHighlightTag] = useState<string>('SUPER OFERTA');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  useEffect(() => {
    if (!currentTenant) return;
    fetch(`/api/products?tenantId=${currentTenant.id}`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        if (data.length > 0) {
          const first = data[0];
          setSelectedProduct(first);
          setCustomPriceNormal(first.priceNormal);
          setCustomPricePromotional(first.pricePromotional);
          setCustomHighlightTag(first.highlightTag || 'SUPER OFERTA');
        }
      });
  }, [currentTenant]);

  const updateCanvas = async () => {
    if (!canvasRef.current || !selectedProduct || !currentTenant) return;
    try {
      setIsRendering(true);

      const modifiedProduct: Product = {
        ...selectedProduct,
        priceNormal: customPriceNormal,
        pricePromotional: customPricePromotional,
        highlightTag: customHighlightTag as any,
      };

      const activeTemplate: Template = {
        ...template,
        format: currentFormat,
      };

      await CanvasEngine.renderToCanvas({
        template: activeTemplate,
        product: modifiedProduct,
        tenant: currentTenant,
      }, canvasRef.current);
    } catch (err) {
      console.error('Erro na renderização do canvas:', err);
    } finally {
      setIsRendering(false);
    }
  };

  useEffect(() => {
    updateCanvas();
  }, [selectedProduct, customPriceNormal, customPricePromotional, customHighlightTag, currentFormat, currentTenant]);

  const handleDownload = () => {
    if (!canvasRef.current || !selectedProduct) return;
    CanvasEngine.downloadCanvas(canvasRef.current, `promoja-${selectedProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
        >
          {/* Lado Esquerdo: Form de Edição */}
          <div className="w-full md:w-1/2 p-6 sm:p-8 space-y-6 border-b md:border-b-0 md:border-r border-slate-800 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-rose-400 tracking-wider">
                  Editor de Artes Sênior
                </span>
                <h3 className="text-xl font-black text-white font-display">{template.name}</h3>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-white md:hidden">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Alternador de Formato */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-rose-400" />
                Formato da Arte Gerada
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'STORIES_9_16', label: 'Stories (9:16)' },
                  { id: 'FEED_1_1', label: 'Feed (1:1)' },
                  { id: 'TV_16_9', label: 'TV (16:9)' },
                ].map(fmt => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setCurrentFormat(fmt.id as TemplateFormat)}
                    className={`py-2 rounded-xl text-xs font-bold transition ${
                      currentFormat === fmt.id
                        ? 'bg-rose-600 text-white shadow'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Seleção do Produto */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase">Selecionar Produto do Catálogo</label>
                <select
                  value={selectedProduct?.id || ''}
                  onChange={(e) => {
                    const p = products.find(prod => prod.id === e.target.value);
                    if (p) {
                      setSelectedProduct(p);
                      setCustomPriceNormal(p.priceNormal);
                      setCustomPricePromotional(p.pricePromotional);
                      setCustomHighlightTag(p.highlightTag || 'SUPER OFERTA');
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-semibold focus:outline-none focus:border-rose-500"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (R$ {p.pricePromotional.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Preços */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase">Preço Antigo (De)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={customPriceNormal}
                    onChange={(e) => setCustomPriceNormal(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-bold focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase">Preço Promocional (Por)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={customPricePromotional}
                    onChange={(e) => setCustomPricePromotional(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-bold text-amber-400 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Selo Promocional */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase">Selo Promocional de Destaque</label>
                <select
                  value={customHighlightTag}
                  onChange={(e) => setCustomHighlightTag(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-semibold focus:outline-none focus:border-rose-500"
                >
                  <option value="SUPER OFERTA">🔥 SUPER OFERTA</option>
                  <option value="OFERTA DO DIA">⚡ OFERTA DO DIA</option>
                  <option value="OFERTA IMPERDÍVEL">⭐ OFERTA IMPERDÍVEL</option>
                  <option value="CHURRASCO">🥩 CHURRASCO</option>
                  <option value="FEIRA FRESCA">🌱 FEIRA FRESCA</option>
                  <option value="MENOR PREÇO">🏷️ MENOR PREÇO</option>
                  <option value="EXCLUSIVO">✨ EXCLUSIVO</option>
                </select>
              </div>
            </div>

            {/* Ação de Download */}
            <div className="pt-6 border-t border-slate-800 space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownload}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white font-black text-sm shadow-xl shadow-rose-950/60 flex items-center justify-center gap-2 transition"
              >
                <Download className="w-5 h-5" />
                BAIXAR ARTE EM ALTA RESOLUÇÃO (PNG)
              </motion.button>
            </div>
          </div>

          {/* Lado Direito: Live Preview Canvas com Zoom */}
          <div className="w-full md:w-1/2 p-6 bg-slate-950 flex flex-col items-center justify-between relative overflow-hidden">
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white hidden md:block">
              <X className="w-6 h-6" />
            </button>

            <div className="w-full flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                Preview em Tempo Real (Canvas 2D)
              </span>

              <div className="flex items-center space-x-1 bg-slate-900 rounded-lg p-1 border border-slate-800">
                <button
                  onClick={() => setZoomScale(Math.max(0.7, zoomScale - 0.15))}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono font-bold text-white px-1">
                  {Math.round(zoomScale * 100)}%
                </span>
                <button
                  onClick={() => setZoomScale(Math.min(1.4, zoomScale + 0.15))}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex-1 w-full flex items-center justify-center relative overflow-hidden p-2">
              <div 
                className="max-h-[58vh] max-w-full flex items-center justify-center rounded-2xl shadow-2xl border border-slate-800 bg-slate-900/50 p-2 transition-all duration-300"
                style={{ transform: `scale(${zoomScale})` }}
              >
                <canvas
                  ref={canvasRef}
                  className="max-h-[52vh] w-auto h-auto object-contain rounded-xl shadow-lg"
                />
                {isRendering && (
                  <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
