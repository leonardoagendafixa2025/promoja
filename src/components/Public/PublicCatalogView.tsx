import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, Tenant, Campaign } from '../../types';
import { parseGoogleDriveUrl } from '../../utils/googleDrive';
import { 
  Search, 
  MapPin, 
  Clock, 
  ShoppingBag, 
  Plus, 
  Minus, 
  X, 
  Check, 
  Share2, 
  MessageSquare,
  Sparkles,
  ChevronRight,
  Truck,
  Store as StoreIcon,
  Utensils
} from 'lucide-react';

interface PublicCatalogViewProps {
  tenantSlug: string;
  campaignSlug: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export const PublicCatalogView: React.FC<PublicCatalogViewProps> = ({ tenantSlug, campaignSlug }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Carrinho de Compras / Drawer PROMOJÁ
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState<'DELIVERY' | 'PICKUP' | 'LOCAL'>('DELIVERY');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  useEffect(() => {
    fetch(`/api/campaigns/public/${tenantSlug}/${campaignSlug}`)
      .then(res => res.json())
      .then(data => {
        if (data.campaign) {
          setTenant(data.tenant);
          setCampaign(data.campaign);
          setProducts(data.products || []);
        }
      })
      .catch(err => console.error('Erro ao carregar catálogo público:', err))
      .finally(() => setLoading(false));
  }, [tenantSlug, campaignSlug]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const totalItemsCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cart.reduce((sum, i) => sum + i.product.pricePromotional * i.quantity, 0);

  const categories = Array.from(new Set(products.map(p => p.categoryName || 'Geral')));

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || p.categoryName === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleSendWhatsAppOrder = () => {
    if (!tenant || cart.length === 0) return;

    let text = `🛒 *NOVO PEDIDO - ${tenant.name.toUpperCase()}*\n`;
    text += `─────────────\n`;
    cart.forEach(item => {
      text += `▪ ${item.quantity}x ${item.product.name} - R$ ${(item.product.pricePromotional * item.quantity).toFixed(2)}\n`;
    });
    text += `─────────────\n`;
    text += `💰 *TOTAL: R$ ${totalPrice.toFixed(2)}*\n\n`;
    text += `📍 *Opção:* ${deliveryOption === 'DELIVERY' ? 'Entrega em Domicílio' : deliveryOption === 'PICKUP' ? 'Retirada na Loja' : 'Consumo no Local'}\n`;
    if (customerName) text += `👤 *Cliente:* ${customerName}\n`;
    if (customerAddress && deliveryOption === 'DELIVERY') text += `🏠 *Endereço:* ${customerAddress}\n`;
    if (customerNotes) text += `📝 *Observações:* ${customerNotes}\n`;

    const phoneClean = tenant.brandKit.phone.replace(/\D/g, '');
    const waUrl = `https://api.whatsapp.com/send?phone=${phoneClean}&text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-3 font-display">
        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-slate-400">Carregando catálogo de ofertas PROMOJÁ...</p>
      </div>
    );
  }

  if (!campaign || !tenant) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <ShoppingBag className="w-16 h-16 text-rose-500" />
        <h2 className="text-2xl font-black font-display">PROMOÇÃO OU CARDÁPIO NÃO ENCONTRADO</h2>
        <p className="text-sm text-slate-400 max-w-md">
          Este cardápio digital expirou ou foi alterado pelo estabelecimento.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-28 font-sans selection:bg-rose-500 selection:text-white">
      {/* CAPA DE CABEÇALHO DO ESTABELECIMENTO */}
      <div className="relative bg-slate-900 border-b border-slate-800">
        <div className="h-44 sm:h-56 w-full bg-gradient-to-r from-rose-900 via-slate-900 to-amber-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" />
          <img
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80"
            alt="Capa do Estabelecimento"
            className="w-full h-full object-cover opacity-40"
          />
        </div>

        {/* LOGO & DADOS DO ESTABELECIMENTO */}
        <div className="max-w-4xl mx-auto px-4 relative -mt-16 pb-6 flex flex-col sm:flex-row items-center sm:items-end gap-5">
          <div className="w-28 h-28 rounded-3xl bg-slate-900 border-4 border-slate-950 shadow-2xl overflow-hidden shrink-0 flex items-center justify-center relative">
            {tenant.brandKit.logoUrl ? (
              <img src={parseGoogleDriveUrl(tenant.brandKit.logoUrl)} alt={tenant.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-rose-600 to-amber-500 text-white font-black text-4xl flex items-center justify-center font-display">
                {tenant.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-black border border-emerald-500/30 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                ABERTO AGORA
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[11px] font-bold border border-rose-500/30">
                {campaign.name}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight uppercase">
              {tenant.name}
            </h1>

            <p className="text-xs text-slate-300 font-medium">
              {tenant.brandKit.slogan}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                {tenant.brandKit.address}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Válido até {campaign.endDate}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* NAVEGAÇÃO STICKY (Busca + Categorias) */}
      <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 py-3 shadow-xl">
        <div className="max-w-4xl mx-auto px-4 space-y-3">
          {/* Busca por Produto */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar no cardápio de ofertas..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500 shadow-inner"
            />
          </div>

          {/* Carrossel de Categorias Pílula */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase shrink-0 transition ${
                selectedCategory === 'ALL'
                  ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-lg shadow-rose-950/50'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              TODOS ({products.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase shrink-0 transition ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-lg shadow-rose-950/50'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* LISTA DE PRODUTOS */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredProducts.map(p => {
            const discount = p.priceNormal > p.pricePromotional
              ? Math.round(((p.priceNormal - p.pricePromotional) / p.priceNormal) * 100)
              : 0;

            const inCart = cart.find(item => item.product.id === p.id);
            const parsedImg = parseGoogleDriveUrl(p.imageUrl);

            return (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 flex gap-4 relative overflow-hidden shadow-lg hover:border-slate-700 transition group"
              >
                {/* Imagem do Produto */}
                <div className="w-28 h-28 rounded-xl bg-slate-950 overflow-hidden shrink-0 flex items-center justify-center p-2 relative">
                  {discount > 0 && (
                    <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black shadow z-10">
                      -{discount}%
                    </span>
                  )}
                  <img src={parsedImg} alt={p.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition" />
                </div>

                {/* Detalhes & Adicionar ao Carrinho */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-rose-400 tracking-wider">
                      {p.categoryName || 'Geral'}
                    </span>
                    <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug mt-0.5">
                      {p.name}
                    </h3>
                  </div>

                  <div className="flex items-end justify-between pt-2 border-t border-slate-800/60">
                    <div>
                      {p.priceNormal > 0 && (
                        <span className="text-[11px] text-slate-500 line-through block">
                          De R$ {p.priceNormal.toFixed(2).replace('.', ',')}
                        </span>
                      )}
                      <span className="text-base font-black text-amber-400 font-display">
                        R$ {p.pricePromotional.toFixed(2).replace('.', ',')} <span className="text-[10px] text-slate-400 font-medium">/ {p.unit}</span>
                      </span>
                    </div>

                    {/* Botão + / Controle de Quantidade no Cardápio */}
                    {inCart ? (
                      <div className="flex items-center space-x-1.5 bg-slate-800 rounded-xl p-1 border border-slate-700">
                        <button
                          onClick={() => updateQuantity(p.id, -1)}
                          className="w-7 h-7 rounded-lg bg-slate-700 text-white flex items-center justify-center hover:bg-slate-600 font-bold"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-black text-white px-1.5 font-mono">{inCart.quantity}</span>
                        <button
                          onClick={() => updateQuantity(p.id, 1)}
                          className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center hover:bg-rose-500 font-bold shadow"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(p)}
                        className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-950/40 transition active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* BARRA FIXA FLUTUANTE DO CARRINHO */}
      {totalItemsCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-4 left-4 right-4 max-w-xl mx-auto z-40"
        >
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white font-black text-sm shadow-2xl shadow-rose-950/80 flex items-center justify-between transition transform active:scale-98"
          >
            <div className="flex items-center space-x-3">
              <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-mono font-bold text-xs">
                {totalItemsCount}
              </span>
              <span>VER PEDIDO NO CARRINHO</span>
            </div>

            <div className="flex items-center space-x-2 font-display text-base">
              <span>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
        </motion.div>
      )}

      {/* DRAWER / MODAL DO CARRINHO DE COMPRAS E PEDIDO WHATSAPP */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Header do Carrinho */}
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="w-6 h-6 text-rose-500" />
                  <h3 className="text-lg font-black text-white font-display">Seu Pedido — {tenant.name}</h3>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* Opções de Entrega / Retirada */}
                <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-slate-950 border border-slate-800">
                  <button
                    onClick={() => setDeliveryOption('DELIVERY')}
                    className={`py-2.5 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition ${
                      deliveryOption === 'DELIVERY' ? 'bg-rose-600 text-white shadow' : 'text-slate-400'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    Entrega
                  </button>
                  <button
                    onClick={() => setDeliveryOption('PICKUP')}
                    className={`py-2.5 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition ${
                      deliveryOption === 'PICKUP' ? 'bg-rose-600 text-white shadow' : 'text-slate-400'
                    }`}
                  >
                    <StoreIcon className="w-4 h-4" />
                    Retirada
                  </button>
                  <button
                    onClick={() => setDeliveryOption('LOCAL')}
                    className={`py-2.5 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition ${
                      deliveryOption === 'LOCAL' ? 'bg-rose-600 text-white shadow' : 'text-slate-400'
                    }`}
                  >
                    <Utensils className="w-4 h-4" />
                    Mesa / Local
                  </button>
                </div>

                {/* Itens do Pedido */}
                <div className="space-y-3 divide-y divide-slate-800">
                  {cart.map(item => (
                    <div key={item.product.id} className="pt-3 flex items-center justify-between">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="text-xs font-bold text-white truncate">{item.product.name}</p>
                        <p className="text-[11px] text-amber-400 font-bold">
                          R$ {(item.product.pricePromotional * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 bg-slate-950 rounded-xl p-1 border border-slate-800 shrink-0">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="w-6 h-6 rounded-lg bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-black text-white px-1 font-mono">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center hover:bg-rose-500"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Formulário de Dados do Cliente */}
                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 uppercase">Seu Nome</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ex: João da Silva"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  {deliveryOption === 'DELIVERY' && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300 uppercase">Endereço de Entrega</label>
                      <input
                        type="text"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        placeholder="Rua, Número, Bairro, Ponto de Referência"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 uppercase">Observações do Pedido</label>
                    <input
                      type="text"
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      placeholder="Ex: Ponto da carne, sem gelo, troco para 50..."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>

              {/* Botão de Enviar no WhatsApp */}
              <div className="p-6 border-t border-slate-800 bg-slate-950 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-400">Total do Pedido:</span>
                  <span className="text-xl font-black text-amber-400 font-display">
                    R$ {totalPrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <button
                  onClick={handleSendWhatsAppOrder}
                  className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2 transition"
                >
                  <MessageSquare className="w-5 h-5" />
                  ENVIAR PEDIDO NO WHATSAPP
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RODAPÉ DO CATÁLOGO PROMOJÁ */}
      <footer className="mt-12 py-8 border-t border-slate-800/80 bg-slate-950 text-center text-xs text-slate-500 space-y-2">
        <p className="font-bold text-white uppercase tracking-wider">{tenant.name}</p>
        <p>{tenant.brandKit.address}</p>
        <p>{tenant.brandKit.customFooter}</p>
        <p className="text-[10px] text-slate-600 pt-2">
          Cardápio Digital alimentado por <strong className="text-rose-500">PROMOJÁ</strong>
        </p>
      </footer>
    </div>
  );
};
