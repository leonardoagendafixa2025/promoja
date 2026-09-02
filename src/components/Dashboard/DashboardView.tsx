import React from 'react';
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
  Zap
} from 'lucide-react';
import { NavTab } from '../Layout/Sidebar';

interface DashboardViewProps {
  setActiveTab: (tab: NavTab) => void;
  onOpenCampaignWizard: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab, onOpenCampaignWizard }) => {
  const { currentTenant } = useAuth();

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

          <h2 className="text-3xl sm:text-5xl font-black text-white font-display leading-tight tracking-tight">
            Bem-vindo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-amber-400">{currentTenant?.name || 'Empresa'}</span>!
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Cadastre os seus produtos e preços uma única vez. O PROMOJÁ transforma essas informações automaticamente em Posts para Instagram, Stories, WhatsApp Status, Folhetos PDF, Catálogo Online e Mídias para TV.
          </p>

          <div className="pt-3 flex flex-wrap gap-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenCampaignWizard}
              className="px-7 py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black text-sm shadow-xl shadow-rose-950/60 flex items-center gap-2 transition"
            >
              <PlusCircle className="w-5 h-5 text-white" />
              CRIAR CAMPANHA COMPLETA
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('flyer')}
              className="px-6 py-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-100 font-bold text-sm border border-slate-700/80 flex items-center gap-2 transition backdrop-blur shadow"
            >
              <FileText className="w-5 h-5 text-rose-400" />
              GERAR FOLHETO DIGITAL PDF
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Cards de Métricas com Stagger */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={idx}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="glass-card p-6 rounded-2xl relative overflow-hidden group cursor-pointer border border-slate-800/80"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{m.title}</p>
                  <p className="text-3xl font-black text-white mt-2 font-display">{m.value}</p>
                  <p className="text-xs text-emerald-400 mt-1 font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {m.change}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Ações Rápidas em Grid Interativo */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-rose-400" />
          Ações Rápidas de Criação
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <motion.button
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenCampaignWizard}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/50 transition text-left space-y-3 group shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center group-hover:scale-110 transition">
              <Megaphone className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-white group-hover:text-rose-400 transition">Criar Campanha</p>
            <p className="text-xs text-slate-400">Gere todas as mídias juntas</p>
          </motion.button>

          <motion.button
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('products')}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 transition text-left space-y-3 group shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-white group-hover:text-amber-400 transition">Cadastrar Produtos</p>
            <p className="text-xs text-slate-400">Insira itens ou CSV</p>
          </motion.button>

          <motion.button
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('flyer')}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 transition text-left space-y-3 group shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition">
              <FileText className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition">Folheto PDF</p>
            <p className="text-xs text-slate-400">Gere encarte impresso</p>
          </motion.button>

          <motion.button
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('templates')}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 transition text-left space-y-3 group shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition">
              <Layers className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-white group-hover:text-blue-400 transition">Templates Prontos</p>
            <p className="text-xs text-slate-400">Modelos para seu setor</p>
          </motion.button>

          <motion.button
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('tv')}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 transition text-left space-y-3 group shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition">
              <Tv className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-white group-hover:text-purple-400 transition">TV da Loja</p>
            <p className="text-xs text-slate-400">Slides 16:9 em tela cheia</p>
          </motion.button>
        </div>
      </motion.div>

      {/* Campanhas Ativas Recentes */}
      <motion.div variants={itemVariants} className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white font-display">Campanhas Recentes em Andamento</h3>
            <p className="text-xs text-slate-400">Gerencie e faça download das suas campanhas promocionais</p>
          </div>
          <button
            onClick={() => setActiveTab('campaigns')}
            className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
          >
            Ver Central <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-slate-800">
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white font-black text-xl shadow">
                🔥
              </div>
              <div>
                <h4 className="text-base font-bold text-white">OFERTAS DO FINAL DE SEMANA</h4>
                <p className="text-xs text-slate-400">6 Produtos • Validade: 04/09 até 07/09/2026</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-1 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                30 Artes Geradas
              </span>
              <button
                onClick={() => setActiveTab('campaigns')}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow"
              >
                Abrir Central
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
