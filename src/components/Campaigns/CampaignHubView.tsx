import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Campaign, Product, Template } from '../../types';
import { CanvasEngine } from '../../services/canvasEngine';
import JSZip from 'jszip';
import QRCode from 'qrcode';
import { 
  Megaphone, 
  Download, 
  Share2, 
  ExternalLink, 
  CheckCircle2, 
  FileText, 
  Tv, 
  QrCode as QrCodeIcon,
  Sparkles,
  Layers,
  Calendar
} from 'lucide-react';

interface CampaignHubViewProps {
  campaignId?: string;
  onOpenWizard: () => void;
}

export const CampaignHubView: React.FC<CampaignHubViewProps> = ({ campaignId, onOpenWizard }) => {
  const { currentTenant } = useAuth();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [template, setTemplate] = useState<Template | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'stories' | 'feed' | 'flyer' | 'tv' | 'qrcode'>('stories');
  const [isZipping, setIsZipping] = useState(false);

  useEffect(() => {
    if (!currentTenant) return;

    fetch(`/api/campaigns?tenantId=${currentTenant.id}`)
      .then(res => res.json())
      .then(async (data: Campaign[]) => {
        if (data.length > 0) {
          const selected = campaignId ? data.find(c => c.id === campaignId) || data[0] : data[0];
          setCampaign(selected);

          // Buscar produtos da campanha
          const prodsRes = await fetch(`/api/products?tenantId=${currentTenant.id}`);
          const allProds: Product[] = await prodsRes.json();
          const campaignProds = allProds.filter(p => selected.productIds.includes(p.id));
          setProducts(campaignProds);

          // Buscar template
          const tplRes = await fetch('/api/templates');
          const allTpls: Template[] = await tplRes.json();
          const tpl = allTpls.find(t => t.id === selected.templateId) || allTpls[0];
          setTemplate(tpl);

          // Gerar QR Code para o catálogo público
          const publicUrl = `${window.location.origin}/ofertas/${currentTenant.slug}/${selected.slug}`;
          const qr = await QRCode.toDataURL(publicUrl, { width: 400, margin: 2 });
          setQrCodeDataUrl(qr);
        }
      });
  }, [currentTenant, campaignId]);

  // Função para Gerar e Baixar o Pacote ZIP Completo
  const handleDownloadFullZip = async () => {
    if (!campaign || !currentTenant || !template || products.length === 0) return;
    try {
      setIsZipping(true);
      const zip = new JSZip();

      // Pastas no arquivo ZIP
      const storiesFolder = zip.folder('stories');
      const feedFolder = zip.folder('feed-instagram');
      const tvFolder = zip.folder('tv-da-loja');
      const qrFolder = zip.folder('qr-code');

      // 1. Gerar Stories PNG para cada produto
      for (const prod of products) {
        const canvas = await CanvasEngine.renderToCanvas({
          template,
          product: prod,
          tenant: currentTenant,
          qrCodeDataUrl,
        });
        const pngBase64 = canvas.toDataURL('image/png').split(',')[1];
        storiesFolder?.file(`story-${prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`, pngBase64, { base64: true });

        // Feed 1:1
        const feedCanvas = await CanvasEngine.renderToCanvas({
          template: { ...template, format: 'FEED_1_1' },
          product: prod,
          tenant: currentTenant,
        });
        const feedBase64 = feedCanvas.toDataURL('image/png').split(',')[1];
        feedFolder?.file(`feed-${prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`, feedBase64, { base64: true });
      }

      // 2. Adicionar QR Code
      if (qrCodeDataUrl) {
        const qrBase64 = qrCodeDataUrl.split(',')[1];
        qrFolder?.file('qr-code-catalogo.png', qrBase64, { base64: true });
      }

      // 3. Gerar arquivo ZIP e baixar
      const blob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${campaign.slug.toUpperCase()}-CAMPANHA-COMPLETA.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Erro ao gerar pacote ZIP:', err);
    } finally {
      setIsZipping(false);
    }
  };

  if (!campaign) {
    return (
      <div className="glass-panel p-12 text-center rounded-2xl space-y-4">
        <Megaphone className="w-12 h-12 mx-auto text-slate-600" />
        <h3 className="text-lg font-bold text-white">Nenhuma campanha cadastrada</h3>
        <button
          onClick={onOpenWizard}
          className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow"
        >
          Criar Primeira Campanha
        </button>
      </div>
    );
  }

  const publicCatalogUrl = `${window.location.origin}/ofertas/${currentTenant?.slug}/${campaign.slug}`;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header & Controles da Campanha */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                CAMPANHA ATIVA
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5 text-rose-400" />
                Validade: {campaign.endDate}
              </span>
            </div>

            <h2 className="text-3xl font-black text-white font-display uppercase tracking-tight">
              {campaign.name}
            </h2>
            <p className="text-xs text-slate-400">
              {products.length} Produtos cadastrados nesta campanha • Todas as mídias prontas para uso.
            </p>
          </div>

          {/* Botões de Ação Central */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleDownloadFullZip}
              disabled={isZipping}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-black text-xs shadow-xl shadow-rose-950/60 flex items-center gap-2 transition disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isZipping ? 'GERANDO ZIP COMPLETO...' : 'BAIXAR CAMPANHA COMPLETA (ZIP)'}
            </button>

            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Confira nossas ofertas imperdíveis: ${publicCatalogUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow flex items-center gap-2 transition"
            >
              <Share2 className="w-4 h-4" />
              Enviar no WhatsApp
            </a>

            <button
              onClick={onOpenWizard}
              className="px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition"
            >
              + Nova Campanha
            </button>
          </div>
        </div>

        {/* Mídias Geradas Resumo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-6 border-t border-slate-800">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-lg font-black text-rose-400">{products.length}</span>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Stories 9:16</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-lg font-black text-amber-400">{products.length}</span>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Posts 1:1</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-lg font-black text-emerald-400">1</span>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Folheto PDF</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-lg font-black text-blue-400">1</span>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Catálogo Web</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-lg font-black text-purple-400">1</span>
            <p className="text-[11px] font-bold text-slate-400 uppercase">TV da Loja</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-lg font-black text-teal-400">1</span>
            <p className="text-[11px] font-bold text-slate-400 uppercase">QR Code</p>
          </div>
        </div>
      </div>

      {/* Abas de Mídias Geradas */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('stories')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'stories' ? 'bg-rose-600 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            Stories & WhatsApp ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'feed' ? 'bg-rose-600 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            Posts Feed Quadrado ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('qrcode')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'qrcode' ? 'bg-rose-600 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <QrCodeIcon className="w-4 h-4" />
            QR Code do Catálogo
          </button>
        </div>

        {/* Conteúdo da Aba Ativa */}
        {activeTab === 'stories' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(p => (
              <div key={p.id} className="glass-card rounded-2xl p-4 space-y-3 flex flex-col justify-between">
                <div className="flex items-center space-x-3">
                  <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-contain bg-slate-900" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{p.name}</p>
                    <p className="text-[11px] text-amber-400 font-bold">R$ {p.pricePromotional.toFixed(2)}</p>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    if (!template || !currentTenant) return;
                    const canvas = await CanvasEngine.renderToCanvas({
                      template,
                      product: p,
                      tenant: currentTenant,
                    });
                    CanvasEngine.downloadCanvas(canvas, `story-${p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  Baixar Story PNG
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'qrcode' && (
          <div className="glass-panel p-8 rounded-3xl max-w-md mx-auto text-center space-y-6">
            <h3 className="text-lg font-bold text-white font-display">QR Code da Sua Promoção</h3>
            <p className="text-xs text-slate-400">Imprima este QR Code nos caixas, cartazes e panfletos da loja física para que os clientes acessem seu catálogo digital no celular.</p>

            {qrCodeDataUrl && (
              <div className="p-4 bg-white rounded-2xl inline-block shadow-2xl">
                <img src={qrCodeDataUrl} alt="QR Code da Promoção" className="w-56 h-56 mx-auto" />
              </div>
            )}

            <div className="flex justify-center gap-3">
              <a
                href={qrCodeDataUrl}
                download="qr-code-promocao.png"
                className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow"
              >
                <Download className="w-4 h-4" />
                Baixar QR Code PNG
              </a>
              <a
                href={publicCatalogUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Testar Link
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
