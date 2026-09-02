import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
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

const MainContent: React.FC = () => {
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
