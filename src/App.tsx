import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Layout/Navbar';
import { Sidebar, NavTab } from './components/Layout/Sidebar';
import { DashboardView } from './components/Dashboard/DashboardView';
import { ProductsView } from './components/Products/ProductsView';
import { BrandKitView } from './components/BrandKit/BrandKitView';
import { TemplatesView } from './components/Templates/TemplatesView';
import { CampaignHubView } from './components/Campaigns/CampaignHubView';
import { CampaignWizardModal } from './components/Campaigns/CampaignWizardModal';
import { JobProgressModal } from './components/Campaigns/JobProgressModal';
import { FlyerGeneratorView } from './components/Flyer/FlyerGeneratorView';
import { TVPlayerView } from './components/TV/TVPlayerView';
import { PublicCatalogView } from './components/Public/PublicCatalogView';
import { SuperAdminView } from './components/SuperAdmin/SuperAdminView';
import { ShieldAlert, LogOut } from 'lucide-react';

const MainContent: React.FC = () => {
  const { isImpersonating, impersonatedTenant, impersonationReason, exitImpersonation } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | undefined>(undefined);

  // Verificar se estamos acessando a rota pública do catálogo
  const pathname = window.location.pathname;
  const publicMatch = pathname.match(/^\/ofertas\/([^\/]+)\/([^\/]+)/);

  if (publicMatch) {
    const tenantSlug = publicMatch[1];
    const campaignSlug = publicMatch[2];
    return <PublicCatalogView tenantSlug={tenantSlug} campaignSlug={campaignSlug} />;
  }

  const handleCampaignCreated = (campaignId: string, jobId: string) => {
    setIsWizardOpen(false);
    setSelectedCampaignId(campaignId);
    setActiveJobId(jobId);
  };

  const handleJobComplete = () => {
    setActiveJobId(null);
    setActiveTab('campaigns');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* BANNER DO MODO IMPERSONATION / SUPORTE ADMINISTRATIVO */}
      {isImpersonating && (
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-lg sticky top-0 z-50 animate-pulse">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-200" />
            <span>
              <strong>MODO ADMINISTRADOR SUPORTE</strong> — Você está acessando a conta de <span className="underline">{impersonatedTenant?.name}</span> ({impersonationReason || 'Suporte Técnico'}).
            </span>
          </div>

          <button
            onClick={exitImpersonation}
            className="px-3 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-900 text-amber-300 border border-amber-400/40 text-[11px] font-black uppercase flex items-center gap-1.5 transition shadow"
          >
            <LogOut className="w-3.5 h-3.5" />
            SAIR DO MODO SUPORTE E VOLTAR AO SUPER ADMIN
          </button>
        </div>
      )}

      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardView
                setActiveTab={setActiveTab}
                onOpenCampaignWizard={() => setIsWizardOpen(true)}
              />
            )}

            {activeTab === 'campaigns' && (
              <CampaignHubView
                campaignId={selectedCampaignId}
                onOpenWizard={() => setIsWizardOpen(true)}
              />
            )}

            {activeTab === 'products' && <ProductsView />}

            {activeTab === 'brandkit' && <BrandKitView />}

            {activeTab === 'templates' && <TemplatesView />}

            {activeTab === 'flyer' && <FlyerGeneratorView />}

            {activeTab === 'tv' && <TVPlayerView />}

            {activeTab === 'superadmin' && <SuperAdminView />}
          </div>
        </main>
      </div>

      {/* Modais Globais */}
      {isWizardOpen && (
        <CampaignWizardModal
          onClose={() => setIsWizardOpen(false)}
          onCampaignCreated={handleCampaignCreated}
        />
      )}

      {activeJobId && (
        <JobProgressModal
          jobId={activeJobId}
          onComplete={handleJobComplete}
        />
      )}
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

export default App;
