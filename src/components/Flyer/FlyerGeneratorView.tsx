import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Product, Campaign } from '../../types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { FileText, Download, Printer, Share2, Sparkles, LayoutGrid, CheckCircle2 } from 'lucide-react';

export const FlyerGeneratorView: React.FC = () => {
  const { currentTenant } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [itemsPerPage, setItemsPerPage] = useState<number>(6);
  const [modelStyle, setModelStyle] = useState<'classic' | 'modern' | 'green'>('classic');
  const [flyerTitle, setFlyerTitle] = useState('ENCARTE DE OFERTAS DA SEMANA');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const flyerContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!currentTenant) return;
    fetch(`/api/products?tenantId=${currentTenant.id}`)
      .then(res => res.json())
      .then(data => setProducts(data));
  }, [currentTenant]);

  // Dividir produtos em páginas
  const pages: Product[][] = [];
  for (let i = 0; i < products.length; i += itemsPerPage) {
    pages.push(products.slice(i, i + itemsPerPage));
  }

  // Exportar como PDF A4 em alta definição
  const handleDownloadPDF = async () => {
    if (!flyerContainerRef.current) return;
    try {
      setIsGeneratingPdf(true);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageElements = flyerContainerRef.current.querySelectorAll('.flyer-page-render');

      for (let i = 0; i < pageElements.length; i++) {
        const el = pageElements[i] as HTMLElement;
        const canvas = await html2canvas(el, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      }

      pdf.save(`folheto-${currentTenant?.slug || 'ofertas'}.pdf`);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white font-display flex items-center gap-2">
            <FileText className="w-7 h-7 text-emerald-500" />
            Gerador de Folheto Digital & PDF
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Diagramação automática multi-páginas de encartes de ofertas para impressão em A4 e envio no WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-2 transition no-print"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            Imprimir A4
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg flex items-center gap-2 transition disabled:opacity-50 no-print"
          >
            <Download className="w-4 h-4" />
            {isGeneratingPdf ? 'GERANDO PDF...' : 'BAIXAR FOLHETO PDF (A4)'}
          </button>
        </div>
      </div>

      {/* Opções de Customização do Folheto */}
      <div className="glass-panel p-6 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-6 no-print">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300 uppercase">Título do Encarte</label>
          <input
            type="text"
            value={flyerTitle}
            onChange={(e) => setFlyerTitle(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-bold focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300 uppercase">Produtos por Página</label>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
            className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-bold focus:outline-none focus:border-rose-500"
          >
            <option value={4}>4 Produtos (Grid Grande)</option>
            <option value={6}>6 Produtos (Recomendado)</option>
            <option value={8}>8 Produtos (Compacto)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300 uppercase">Estilo Visual do Encarte</label>
          <select
            value={modelStyle}
            onChange={(e) => setModelStyle(e.target.value as any)}
            className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-bold focus:outline-none focus:border-rose-500"
          >
            <option value="classic">Clássico Supermercado (Vermelho/Amarelo)</option>
            <option value="modern">Moderno Dark / Sleek</option>
            <option value="green">Hortifruti & Feira Verde</option>
          </select>
        </div>
      </div>

      {/* ÁREA DE PREVIEW DO FOLHETO A4 (DIAGRAMAÇÃO REAL) */}
      <div ref={flyerContainerRef} className="space-y-8 flex flex-col items-center">
        {pages.map((pageProducts, pageIdx) => (
          <div
            key={pageIdx}
            className="flyer-page-render w-[210mm] min-h-[297mm] bg-white text-slate-900 p-8 shadow-2xl rounded-sm flex flex-col justify-between relative overflow-hidden"
            style={{
              fontFamily: currentTenant?.brandKit.fontFamily || 'Outfit, sans-serif'
            }}
          >
            {/* CABEÇALHO DO ENCARTE */}
            <div
              className={`p-6 rounded-2xl text-white flex items-center justify-between shadow-lg ${
                modelStyle === 'green'
                  ? 'bg-gradient-to-r from-emerald-700 to-green-600'
                  : modelStyle === 'modern'
                  ? 'bg-gradient-to-r from-slate-900 to-slate-800'
                  : 'bg-gradient-to-r from-rose-700 via-rose-600 to-amber-500'
              }`}
            >
              <div className="flex items-center space-x-4">
                {currentTenant?.brandKit.logoUrl ? (
                  <img src={currentTenant.brandKit.logoUrl} alt="Logo" className="h-14 object-contain bg-white p-1 rounded-xl shadow" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-amber-400 text-rose-900 font-black text-2xl flex items-center justify-center shadow">
                    {currentTenant?.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-black uppercase tracking-tight font-display">{currentTenant?.name}</h1>
                  <p className="text-xs text-amber-200 font-semibold">{currentTenant?.brandKit.slogan}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="px-3 py-1 bg-amber-400 text-rose-950 rounded-full font-black text-xs uppercase tracking-wider shadow">
                  PÁGINA {pageIdx + 1} DE {pages.length}
                </span>
                <h2 className="text-lg font-black mt-1 uppercase tracking-tight">{flyerTitle}</h2>
              </div>
            </div>

            {/* GRADE DE PRODUTOS */}
            <div className={`grid gap-4 my-6 flex-1 ${
              itemsPerPage === 4 ? 'grid-cols-2 grid-rows-2' : itemsPerPage === 6 ? 'grid-cols-3 grid-rows-2' : 'grid-cols-4 grid-rows-2'
            }`}>
              {pageProducts.map(p => {
                const discount = p.priceNormal > p.pricePromotional
                  ? Math.round(((p.priceNormal - p.pricePromotional) / p.priceNormal) * 100)
                  : 0;

                return (
                  <div key={p.id} className="border-2 border-slate-200 rounded-2xl p-4 flex flex-col justify-between relative bg-slate-50 shadow-sm hover:border-rose-500 transition">
                    {discount > 0 && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black">
                        -{discount}% OFF
                      </span>
                    )}

                    {p.highlightTag && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-400 text-rose-950 text-[9px] font-black uppercase">
                        {p.highlightTag}
                      </span>
                    )}

                    <div className="h-32 flex items-center justify-center my-2">
                      <img src={p.imageUrl} alt={p.name} className="max-h-full max-w-full object-contain" />
                    </div>

                    <div className="text-center space-y-1">
                      <h3 className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight">{p.name}</h3>
                      
                      <div className="pt-2">
                        {p.priceNormal > 0 && (
                          <span className="text-[11px] text-slate-400 line-through block">
                            De R$ {p.priceNormal.toFixed(2).replace('.', ',')}
                          </span>
                        )}
                        <span className="text-xl font-black text-rose-600 font-display block">
                          R$ {p.pricePromotional.toFixed(2).replace('.', ',')} <span className="text-[10px] font-bold text-slate-500">/ {p.unit}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RODAPÉ DO ENCARTE */}
            <div className="pt-4 border-t-2 border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div>
                <p className="font-bold text-slate-800">{currentTenant?.brandKit.address}</p>
                <p>{currentTenant?.brandKit.customFooter}</p>
              </div>

              <div className="text-right">
                <p className="font-bold text-rose-600">WhatsApp: {currentTenant?.brandKit.phone}</p>
                <p>Instagram: {currentTenant?.brandKit.instagram}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
