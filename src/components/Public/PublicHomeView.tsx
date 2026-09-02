import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PublicNavbar } from './PublicNavbar';
import { LoginModal } from '../Auth/LoginModal';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Tv, 
  FileText, 
  FolderSync, 
  Share2, 
  ShieldCheck, 
  Star, 
  Building2, 
  Users, 
  ShoppingBag,
  Palette,
  Layout,
  Check,
  ChevronRight
} from 'lucide-react';

export const PublicHomeView: React.FC = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-rose-500 selection:text-white relative overflow-hidden">
      {/* Luzes de Fundo Cenas 3D */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-rose-600/20 via-purple-600/20 to-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* CABEÇALHO PÚBLICO */}
      <PublicNavbar
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenRegister={() => setIsLoginModalOpen(true)}
      />

      {/* 1. HERO SECTION */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-500/20 via-purple-500/20 to-amber-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold shadow-lg"
        >
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          <span>A Plataforma Nº 1 de Inteligência Visual para Varejo e Supermercados</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight font-display text-white max-w-5xl mx-auto leading-tight"
        >
          Uma promoção cadastrada.{' '}
          <span className="bg-gradient-to-r from-rose-500 via-purple-400 to-amber-400 bg-clip-text text-transparent">
            Uma campanha completa gerada em segundos.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-xl text-slate-400 max-w-3xl mx-auto font-normal leading-relaxed"
        >
          Crie automaticamente encartes digitais para Stories (9:16), Feed (1:1), Encarte Impresso A4 em alta definição, mídias para TV de Ofertas 4K e catálogo online integrado ao WhatsApp.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-black text-sm uppercase tracking-wider shadow-2xl shadow-rose-950/80 flex items-center justify-center gap-3 transition transform hover:-translate-y-0.5 active:scale-95"
          >
            <span>EXPERIMENTAR GRATUITAMENTE</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <a
            href="#recursos"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition"
          >
            Conhecer Recursos
          </a>
        </motion.div>

        {/* DEMONSTRAÇÃO VISUAL / MOCKUP DO SISTEMA */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="pt-12 relative max-w-5xl mx-auto"
        >
          <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-slate-800 shadow-2xl bg-slate-900/90 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center space-x-2 pb-4 border-b border-slate-800/80">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs text-slate-400 font-mono ml-2">promoja.com.br/painel-de-campanhas</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 text-left">
              <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400 font-bold">1</div>
                <h4 className="text-sm font-bold text-white">1. Seleção de Ofertas</h4>
                <p className="text-xs text-slate-400">Escolha os produtos do seu catálogo ou sincronize direto do Google Drive.</p>
              </div>

              <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">2</div>
                <h4 className="text-sm font-bold text-white">2. Geração em Lote</h4>
                <p className="text-xs text-slate-400">Nosso motor gráfico ajusta fontes, molduras, cores e preços automaticamente.</p>
              </div>

              <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">3</div>
                <h4 className="text-sm font-bold text-white">3. Publicação Multicanal</h4>
                <p className="text-xs text-slate-400">Baixe o ZIP de mídias, gere o PDF A4 e transmita direto para as TVs da loja.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 2. RECURSOS E BENEFÍCIOS */}
      <section id="recursos" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-black uppercase text-purple-400 tracking-widest">Tudo Que Seu Varejo Precisa</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white font-display">
            A Solução Definitiva de Marketing Promocional
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Chega de perder horas criando encartes no Photoshop ou dependendo de agências externas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4 hover:border-rose-500/50 transition">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-400">
              <FolderSync className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Sincronização com Google Drive</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Arraste suas fotos para pastas no Google Drive e o PROMOJÁ importa e recorta as imagens automaticamente.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4 hover:border-purple-500/50 transition">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Encarte PDF A4 em Alta Definição</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Gere folhetos tablóide práticos para impressão em gráfica ou na própria impressora da loja.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4 hover:border-amber-500/50 transition">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Tv className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">TV de Ofertas 4K para a Loja</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transmita um carrossel animado de produtos em TVs nas gôndolas e caixas via link direto sem instalar nada.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4 hover:border-emerald-500/50 transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Catálogo Online no WhatsApp</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dispare um link exclusivo da sua loja para os clientes navegarem pelas ofertas do final de semana.
            </p>
          </div>
        </div>
      </section>

      {/* 3. TABELA DE PLANOS E PREÇOS (PRICING) */}
      <section id="planos" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-black uppercase text-rose-400 tracking-widest">Preços Transparentes</span>
          <h2 className="text-3xl sm:text-5xl font-black text-white font-display">
            Planos para Todo Tamanho de Negócio
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Escolha o plano ideal e comece a gerar campanhas completas hoje mesmo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* GRATUITO */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase text-slate-400">TESTE GRATUITO</span>
              <h3 className="text-xl font-black text-white font-display">Gratuito</h3>
              <div className="text-3xl font-black text-white">R$ 0 <span className="text-xs text-slate-400 font-normal">/mês</span></div>
              <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 05 artes/mês</li>
                <li className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Templates Feed & Stories</li>
              </ul>
            </div>
            <button onClick={() => setIsLoginModalOpen(true)} className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs">Criar Conta Grátis</button>
          </div>

          {/* BÁSICO */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase text-purple-400">PARA PEQUENAS LOJAS</span>
              <h3 className="text-xl font-black text-white font-display">Básico</h3>
              <div className="text-3xl font-black text-white">R$ 99,90 <span className="text-xs text-slate-400 font-normal">/mês</span></div>
              <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 100 artes/mês</li>
                <li className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Gerador em Lote Drive</li>
                <li className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Folheto PDF A4</li>
              </ul>
            </div>
            <button onClick={() => setIsLoginModalOpen(true)} className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs">Assinar Plano Básico</button>
          </div>

          {/* PROFISSIONAL (DESTAQUE) */}
          <div className="glass-card p-6 rounded-3xl border-2 border-rose-500 bg-gradient-to-b from-rose-950/40 via-slate-900 to-slate-950 space-y-6 flex flex-col justify-between shadow-2xl shadow-rose-950/60 relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shadow">
              MAIS POPULAR
            </div>
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase text-rose-300">SUPERMERCADOS & VAREJO</span>
              <h3 className="text-2xl font-black text-white font-display">Profissional</h3>
              <div className="text-3xl font-black text-rose-400">R$ 149,90 <span className="text-xs text-slate-400 font-normal">/mês</span></div>
              <ul className="text-xs text-slate-200 space-y-2 pt-2 border-t border-rose-900/60">
                <li className="flex items-center gap-1.5"><Check className="w-4 h-4 text-rose-400 shrink-0" /> 500 artes/mês</li>
                <li className="flex items-center gap-1.5"><Check className="w-4 h-4 text-rose-400 shrink-0" /> Modo TV 4K de Loja</li>
                <li className="flex items-center gap-1.5"><Check className="w-4 h-4 text-rose-400 shrink-0" /> Catálogo Web WhatsApp</li>
                <li className="flex items-center gap-1.5"><Check className="w-4 h-4 text-rose-400 shrink-0" /> Suporte Prioritário</li>
              </ul>
            </div>
            <button onClick={() => setIsLoginModalOpen(true)} className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider shadow-lg">Começar Agora</button>
          </div>

          {/* ENTERPRISE */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase text-amber-400">REDE DE LOJAS</span>
              <h3 className="text-xl font-black text-white font-display">Enterprise</h3>
              <div className="text-3xl font-black text-white">R$ 299,90 <span className="text-xs text-slate-400 font-normal">/mês</span></div>
              <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Artes ILIMITADAS</li>
                <li className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Multi-Lojas e Filiais</li>
                <li className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Gerente de Conta Dedicado</li>
              </ul>
            </div>
            <button onClick={() => setIsLoginModalOpen(true)} className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs">Falar com Consultor</button>
          </div>
        </div>
      </section>

      {/* RODAPÉ INSTITUCIONAL */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-lg bg-rose-600 flex items-center justify-center text-white font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-300 font-display">PROMOJÁ © 2026</span>
          </div>

          <div className="flex items-center space-x-6">
            <a href="#recursos" className="hover:text-slate-300 transition">Recursos</a>
            <a href="#planos" className="hover:text-slate-300 transition">Planos</a>
            <span className="hover:text-slate-300 cursor-pointer" onClick={() => setIsLoginModalOpen(true)}>Área do Cliente</span>
          </div>

          <p>© 2026 PROMOJÁ Tecnologias para Varejo Ltda. Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* MODAL DE LOGIN / CADASTRO */}
      {isLoginModalOpen && (
        <LoginModal onClose={() => setIsLoginModalOpen(false)} />
      )}
    </div>
  );
};
