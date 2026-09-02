import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Product } from '../../types';
import { Tv, Play, Pause, Maximize2 } from 'lucide-react';

export const TVPlayerView: React.FC = () => {
  const { currentTenant } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    if (!currentTenant) return;
    fetch(`/api/products?tenantId=${currentTenant.id}`)
      .then(res => res.json())
      .then(data => setProducts(data));
  }, [currentTenant]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isPlaying || products.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, products]);

  const toggleFullscreen = () => {
    const elem = document.getElementById('tv-player-container');
    if (elem) {
      if (!document.fullscreenElement) {
        elem.requestFullscreen().catch(err => console.error(err));
      } else {
        document.exitFullscreen();
      }
    }
  };

  const currentProduct = products[currentIndex] || {
    id: 'prod_fallback',
    name: 'Cerveja Heineken 330ml',
    priceNormal: 7.49,
    pricePromotional: 5.49,
    unit: 'UN',
    imageUrl: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=500&auto=format&fit=crop&q=80',
    highlightTag: 'SUPER OFERTA',
  };

  const discount = currentProduct.priceNormal > currentProduct.pricePromotional
    ? Math.round(((currentProduct.priceNormal - currentProduct.pricePromotional) / currentProduct.priceNormal) * 100)
    : 0;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white font-display flex items-center gap-2">
            <Tv className="w-7 h-7 text-purple-500" />
            TV de Ofertas da Loja (1920x1080)
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Player de alta definição com efeitos de transição para monitores e telas físicas da sua loja.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-2 transition"
          >
            {isPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
            {isPlaying ? 'Pausar Player' : 'Continuar Slides'}
          </button>

          <button
            onClick={toggleFullscreen}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-lg flex items-center gap-2 transition"
          >
            <Maximize2 className="w-4 h-4" />
            TELA CHEIA (FULLSCREEN)
          </button>
        </div>
      </div>

      {/* CONTAINER DO PLAYER DE TV FULL HD */}
      <div
        id="tv-player-container"
        className="w-full aspect-[16/9] rounded-3xl bg-slate-950 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between border border-slate-800"
        style={{
          background: `linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #090d16 100%)`
        }}
      >
        {/* TOPBAR DA TV */}
        <div className="p-8 flex items-center justify-between z-10 border-b border-white/10 bg-slate-950/40 backdrop-blur-md">
          <div className="flex items-center space-x-4">
            {currentTenant?.brandKit.logoUrl ? (
              <img src={currentTenant.brandKit.logoUrl} alt="Logo" className="h-14 object-contain bg-white p-1 rounded-xl shadow-lg" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-rose-600 font-black text-2xl flex items-center justify-center text-white shadow-lg">
                {currentTenant?.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-black uppercase font-display tracking-tight text-white">{currentTenant?.name}</h1>
              <p className="text-sm font-semibold text-rose-400">{currentTenant?.brandKit.slogan}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-3xl font-black font-mono tracking-widest text-amber-400">{currentTime}</span>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ofertas Especiais de Hoje</p>
          </div>
        </div>

        {/* SLIDE COM ANIMAÇÃO FRAMER MOTION CROSSFADE */}
        <div className="flex-1 p-12 flex items-center justify-between gap-12 z-10 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentProduct.id + currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full flex items-center justify-between"
            >
              {/* Imagem do Produto */}
              <div className="w-1/2 h-full flex items-center justify-center relative">
                {discount > 0 && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="absolute top-4 left-4 w-28 h-28 rounded-full bg-emerald-600 text-white flex flex-col items-center justify-center shadow-2xl border-4 border-emerald-400"
                  >
                    <span className="text-2xl font-black">-{discount}%</span>
                    <span className="text-[10px] font-bold uppercase">OFF</span>
                  </motion.div>
                )}
                <img
                  src={currentProduct.imageUrl}
                  alt={currentProduct.name}
                  className="max-h-[80%] max-w-[85%] object-contain drop-shadow-[0_25px_60px_rgba(244,63,94,0.4)]"
                />
              </div>

              {/* Preço e Detalhes */}
              <div className="w-1/2 space-y-6">
                <span className="px-5 py-2 rounded-full bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg inline-block">
                  🔥 {currentProduct.highlightTag || 'SUPER OFERTA'}
                </span>

                <h2 className="text-5xl font-black font-display text-white leading-tight uppercase">
                  {currentProduct.name}
                </h2>

                <div className="space-y-2 pt-2">
                  {currentProduct.priceNormal > 0 && (
                    <span className="text-2xl text-slate-400 line-through font-bold block">
                      De R$ {currentProduct.priceNormal.toFixed(2).replace('.', ',')}
                    </span>
                  )}

                  <div className="px-8 py-5 rounded-3xl bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-2xl border border-rose-400/30 inline-block">
                    <span className="text-6xl font-black font-display tracking-tight">
                      R$ {currentProduct.pricePromotional.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-xl font-bold ml-2 text-rose-200">/ {currentProduct.unit}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* LETREIRO MARQUEE EM MOVIMENTO NO RODAPÉ */}
        <div className="bg-rose-600 text-white py-3 px-6 overflow-hidden flex items-center font-bold text-sm font-display tracking-wider border-t border-rose-500 z-10">
          <div className="whitespace-nowrap animate-marquee flex gap-8">
            <span>🚨 OFERTA VÁLIDA ENQUANTO DURAREM OS ESTOQUES</span>
            <span>•</span>
            <span>📱 FAÇA SEU PEDIDO VIA WHATSAPP: {currentTenant?.brandKit.phone}</span>
            <span>•</span>
            <span>📍 NOSSO ENDEREÇO: {currentTenant?.brandKit.address}</span>
            <span>•</span>
            <span>INSTAGRAM: {currentTenant?.brandKit.instagram}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
