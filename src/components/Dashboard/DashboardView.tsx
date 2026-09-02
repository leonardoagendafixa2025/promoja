import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { 
  Sparkles, 
  Megaphone, 
  ShoppingBag, 
  Download, 
  PlusCircle, 
  FileText, 
  Layers, 
  ArrowUpRight,
  Tv,
  CheckCircle2,
  TrendingUp,
  Zap,
  Database,
  ExternalLink
} from 'lucide-react';
import { NavTab } from '../Layout/Sidebar';
import { isSupabaseConfigured } from '../../lib/supabase';
import { SupabaseConnectModal } from '../SuperAdmin/SupabaseConnectModal';

interface DashboardViewProps {
  setActiveTab: (tab: NavTab) => void;
  onOpenCampaignWizard: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab, onOpenCampaignWizard }) => {
  const { currentTenant } = useAuth();
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  const supabaseActive = isSupabaseConfigured();

  const metrics = [
    { title: 'Artes Geradas este Mês', value: '148', change: '+24% este mês', icon: Layers, color: 'from-rose-500 to-rose-600' },
    { title: 'Campanhas Ativas', value: '3', change: '2 ativas no WhatsApp', icon: Megaphone, color: 'from-amber-500 to-orange-600' },
    { title: 'Produtos no Catálogo', value: '42', change: '8 em promoção hoje', icon: ShoppingBag, color: 'from-emerald-500 to-teal-600' },
    { title: 'Downloads & Pacotes ZIP', value: '312', change: 'Mídias em alta res', icon: Download, color: 'from-indigo-500 to-blue-600' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 pb-12"
    >
      {/* CARD DESTACADO DE BANCO DE DADOS SUPABASE */}
      <motion.div 
        variants={itemVariants}
        className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl transition ${
          supabaseActive
            ? 'bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border-emerald-500/50'
            : 'bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-950 border-amber-500/60'
        }`}
      >
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white shrink-0 shadow-lg ${
            supabaseActive ? 'bg-emerald-600' : 'bg-amber-600'
          }`}>
            <Database className="w-6 h-6 text-white" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className={`w-2.5 h-2.5 rounded-full ${supabaseActive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400 animate-pulse'}`} />
              <h3 className="text-sm font-black text-white font-display uppercase tracking-wider">
                {supabaseActive ? 'Banco de Dados Supabase PostgreSQL Conectado' : '⚡ Conexão Supabase PostgreSQL'}
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Projeto Ref: <strong className="text-emerald-400 font-mono">ajndysndfrnsgkkknguy</strong> • {supabaseActive ? 'Dados sincronizados na nuvem em tempo real.' : 'Insira sua chave API para ativar consultas em nuvem.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsSupabaseModalOpen(true)}
          className={`px-5 py-2.5 rounded-xl text-xs font-black shadow-lg flex items-center gap-2 shrink-0 transition ${
            supabaseActive
              ? 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40'
              : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-950/50'
          }`}
        >
          <Database className="w-4 h-4" />
          {supabaseActive ? 'Gerenciar Supabase' : 'CONFIGURAR SUPABASE AGORA'}
        </button>
      </motion.div>

      {/* Banner Principal Futurista / Neon Retail */}
      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-950 via-slate-900 to-slate-950 border border-rose-500/30 p-8 sm:p-10 shadow-2xl"
      >
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-black border border-rose-500/30 shadow">
            <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
            CENTRAL DE CAMPANHAS PROMOCIONAIS
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white font-display tracking-tight leading-tight">
            Transforme seus produtos e preços em <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-emerald-400">campanhas completas em segundos</span>.
          </h2>

          <p className="text-slate-300 text-sm leading-relaxed">
            Bem-vindo ao <strong>PROMOJÁ</strong> de <span className="text-white font-bold">{currentTenant?.name}</span>. Gere artes para Feed, Stories, Status do WhatsApp, Folhetos PDF e TV da Loja de uma só vez.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={onOpenCampaignWizard}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-rose-950/60 flex items-center gap-2 transition transform active:scale-95"
            >
              <PlusCircle className="w-5 h-5" />
              CRIAR NOVA CAMPANHA AGORA
            </button>

            <button
              onClick={() => setActiveTab('campaigns')}
              className="px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold text-xs flex items-center gap-2 transition"
            >
              <Megaphone className="w-4 h-4 text-amber-400" />
              Ver Minhas Campanhas
            </button>
          </div>
        </div>
      </motion.div>

      {/* Grid de Métricas do Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metrics.map((m, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="glass-card rounded-2xl p-5 relative overflow-hidden group border border-slate-800/80 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">{m.title}</span>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center text-white shadow-md`}>
                <m.icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4 space-y-1">
              <span className="text-3xl font-black text-white font-display tracking-tight">{m.value}</span>
              <p className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {m.change}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Ações Rápidas */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="text-lg font-black text-white font-display flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-rose-500" />
          Ações Rápidas & Módulos do Sistema
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div 
            onClick={() => setActiveTab('products')}
            className="glass-panel p-6 rounded-2xl hover:border-rose-500/50 cursor-pointer transition group space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-110 transition">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white group-hover:text-rose-400 transition flex items-center justify-between">
              Catálogo & Google Drive
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400" />
            </h4>
            <p className="text-xs text-slate-400">
              Cadastre seus produtos com upload automático de fotos para a nuvem do Google Drive.
            </p>
          </div>

          <div 
            onClick={() => setActiveTab('flyer')}
            className="glass-panel p-6 rounded-2xl hover:border-emerald-500/50 cursor-pointer transition group space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white group-hover:text-emerald-400 transition flex items-center justify-between">
              Folheto Digital PDF (A4)
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
            </h4>
            <p className="text-xs text-slate-400">
              Diagramação multi-páginas de encartes de ofertas em PDF pronto para impressão.
            </p>
          </div>

          <div 
            onClick={() => setActiveTab('tv')}
            className="glass-panel p-6 rounded-2xl hover:border-amber-500/50 cursor-pointer transition group space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
              <Tv className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition flex items-center justify-between">
              TV de Ofertas (16:9 4K)
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
            </h4>
            <p className="text-xs text-slate-400">
              Apresentador de slides promocionais em tela cheia com letreiro contínuo para TVs da loja.
            </p>
          </div>
        </div>
      </motion.div>

      {isSupabaseModalOpen && (
        <SupabaseConnectModal onClose={() => setIsSupabaseModalOpen(false)} />
      )}
    </motion.div>
  );
};
