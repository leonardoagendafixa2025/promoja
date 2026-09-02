import React, { useState } from 'react';
import { isSupabaseConfigured, saveSupabaseCredentials } from '../../lib/supabase';
import { Database, X, Check, Copy, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';

interface SupabaseConnectModalProps {
  onClose: () => void;
}

export const SupabaseConnectModal: React.FC<SupabaseConnectModalProps> = ({ onClose }) => {
  const [supabaseUrl, setSupabaseUrl] = useState(localStorage.getItem('PROMOJA_SUPABASE_URL') || '');
  const [supabaseKey, setSupabaseKey] = useState(localStorage.getItem('PROMOJA_SUPABASE_ANON_KEY') || '');
  const [copiedSql, setCopiedSql] = useState(false);

  const isConnected = isSupabaseConfigured();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl || !supabaseKey) {
      alert('Por favor, informe a URL e a Chave Anon do Supabase.');
      return;
    }
    saveSupabaseCredentials(supabaseUrl, supabaseKey);
  };

  const sqlCode = `-- ESQUEMA DE TABELAS PROMOJÁ NO SUPABASE
CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY DEFAULT 'tenant_' || gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    plan_id TEXT NOT NULL DEFAULT 'plan_pro',
    brand_kit JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY DEFAULT 'prod_' || gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    price_normal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    price_promotional NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    unit TEXT NOT NULL DEFAULT 'UN',
    category_name TEXT DEFAULT 'Geral'
);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1">
              <Database className="w-3.5 h-3.5" /> Banco de Dados em Nuvem
            </span>
            <h3 className="text-xl font-black text-white font-display">Conectar ao Supabase PostgreSQL</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Status da Conexão */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between ${
          isConnected
            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
            : 'bg-amber-950/40 border-amber-500/50 text-amber-300'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full animate-ping ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">
                {isConnected ? 'Supabase Conectado & Ativo' : 'Supabase Não Configurado'}
              </p>
              <p className="text-[11px] text-slate-300">
                {isConnected
                  ? 'Seus produtos, tenants e campanhas estão sincronizados na nuvem Supabase PostgreSQL.'
                  : 'Insira as credenciais do seu projeto Supabase abaixo para ativar a persistência em nuvem.'}
              </p>
            </div>
          </div>

          <ShieldCheck className="w-6 h-6 shrink-0" />
        </div>

        {/* Formulário de Configuração */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 uppercase">
              URL do Projeto Supabase (Project URL)
            </label>
            <input
              type="text"
              required
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 uppercase">
              Chave Pública Anon (Anon API Key)
            </label>
            <input
              type="password"
              required
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow flex items-center gap-2 transition"
            >
              <Check className="w-4 h-4" />
              SALVAR E CONECTAR SUPABASE
            </button>
          </div>
        </form>

        {/* Bloco de Copiar SQL para Supabase Editor */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Script SQL para criar as tabelas no Supabase SQL Editor
            </span>
            <button
              onClick={handleCopySql}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold flex items-center gap-1 transition"
            >
              <Copy className="w-3.5 h-3.5" />
              {copiedSql ? 'Copiado!' : 'Copiar SQL'}
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 font-mono text-[11px] max-h-36 overflow-y-auto">
            {sqlCode}
          </pre>
        </div>
      </div>
    </div>
  );
};
