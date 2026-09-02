import React, { useEffect, useState } from 'react';
import { RenderJob } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { RefreshCw, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';

interface JobProgressModalProps {
  jobId: string;
  onComplete: () => void;
}

export const JobProgressModal: React.FC<JobProgressModalProps> = ({ jobId, onComplete }) => {
  const { currentTenant } = useAuth();
  const [job, setJob] = useState<RenderJob | null>(null);

  useEffect(() => {
    if (!currentTenant) return;
    let interval: any = null;

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}?tenantId=${currentTenant.id}`);
        if (!res.ok) return;

        const data: RenderJob = await res.json();
        setJob(data);

        if (data.status === 'PENDING') {
          await fetch(`/api/jobs/${jobId}/progress?tenantId=${currentTenant.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              processedItems: 1,
              failedItems: 0,
              status: 'PROCESSING',
              logMessage: 'Iniciando renderização gráfica dos formatos...',
            })
          });
        } else if (data.status === 'PROCESSING') {
          const nextProcessed = Math.min(data.totalItems, data.processedItems + Math.floor(Math.random() * 3) + 1);
          const isDone = nextProcessed >= data.totalItems;

          await fetch(`/api/jobs/${jobId}/progress?tenantId=${currentTenant.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              processedItems: nextProcessed,
              status: isDone ? 'COMPLETED' : 'PROCESSING',
              logMessage: isDone 
                ? 'Campanha concluída! Pacotes de mídias e artes prontas.' 
                : `Gerando arte ${nextProcessed} de ${data.totalItems}...`,
            })
          });

          if (isDone) {
            clearInterval(interval);
            setTimeout(() => {
              onComplete();
            }, 1200);
          }
        }
      } catch (err) {
        console.error('Erro ao verificar status do job:', err);
      }
    };

    checkStatus();
    interval = setInterval(checkStatus, 700);

    return () => clearInterval(interval);
  }, [jobId, currentTenant]);

  const percentage = job ? Math.min(100, Math.round(((job.processedItems + job.failedItems) / job.totalItems) * 100)) : 0;

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-8 space-y-6 text-center shadow-2xl relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center mx-auto shadow-lg shadow-rose-950/50">
          {percentage === 100 ? (
            <CheckCircle2 className="w-8 h-8 text-white" />
          ) : (
            <RefreshCw className="w-8 h-8 text-white animate-spin" />
          )}
        </div>

        <div>
          <span className="text-[10px] font-black uppercase text-rose-400 tracking-wider">
            Fila de Renderização & Jobs
          </span>
          <h3 className="text-2xl font-black text-white font-display mt-1">
            {percentage === 100 ? 'CAMPANHA GERADA COM SUCESSO!' : 'GERANDO CAMPANHA COMPLETA'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {job?.campaignName || 'Processando mídias e arquivos em massa'}
          </p>
        </div>

        {/* Barra de Progresso Animada */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-300">
            <span>Progresso da Geração</span>
            <span className="text-rose-400 font-mono">{percentage}%</span>
          </div>

          <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-rose-600 via-rose-500 to-amber-400 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <p className="text-xs text-slate-400 text-right font-medium">
            {job?.processedItems || 0} de {job?.totalItems || 0} artes concluídas
          </p>
        </div>

        {/* Log de Processamento */}
        <div className="bg-slate-950 p-4 rounded-xl text-left border border-slate-800 font-mono text-[11px] text-slate-400 space-y-1 max-h-32 overflow-y-auto">
          {job?.logs?.slice(-4).map((log, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-rose-400 shrink-0" />
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
