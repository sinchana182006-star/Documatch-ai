/**
 * DocuMatch AI - Dashboard Layout & Navigation Shell
 * Collapsible sidebar, top breadcrumb bar, view routing,
 * and data synchronization with PostgreSQL and Storage.
 */

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Upload,
  Layers,
  Network,
  GitCompare,
  FolderOpen,
  History,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  StoredDocument,
  StoredHistoryItem,
  StoredAnalysisJob,
  fetchUserDocuments,
  fetchAnalysisHistory,
  fetchAnalysisJobs,
} from '../lib/documentService';
import { DashboardOverview } from './DashboardOverview';
import { UploadView } from './UploadView';
import { SimilarityAnalysisView } from './SimilarityAnalysisView';
import { ComparisonWorkspace } from './ComparisonWorkspace';
import { DocumentLibrary } from './DocumentLibrary';
import { AnalysisHistoryView } from './AnalysisHistoryView';
import { ProfileView } from './ProfileView';

interface Props {
  onLogout: () => void;
  onNavigateHome: () => void;
}

export type DashboardTab =
  | 'overview'
  | 'upload'
  | 'similarity'
  | 'compare'
  | 'library'
  | 'history'
  | 'profile';

export const DashboardLayout: React.FC<Props> = ({ onLogout, onNavigateHome }) => {
  const { user, profile } = useAuth();

  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Data states
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [history, setHistory] = useState<StoredHistoryItem[]>([]);
  const [jobs, setJobs] = useState<StoredAnalysisJob[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Comparison pair selection state
  const [compareDocAId, setCompareDocAId] = useState<string | null>(null);
  const [compareDocBId, setCompareDocBId] = useState<string | null>(null);

  const userId = user?.id || 'session-guest-user';

  const reloadAllData = async () => {
    setLoadingData(true);
    try {
      const [docs, hist, jbs] = await Promise.all([
        fetchUserDocuments(userId),
        fetchAnalysisHistory(userId),
        fetchAnalysisJobs(userId),
      ]);
      setDocuments(docs);
      setHistory(hist);
      setJobs(jbs);
    } catch (e) {
      console.warn('Error fetching workspace data:', e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    reloadAllData();
  }, [userId]);

  const handleOpenComparison = (docAId: string, docBId: string) => {
    setCompareDocAId(docAId);
    setCompareDocBId(docBId);
    setActiveTab('compare');
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload Documents', icon: Upload },
    { id: 'similarity', label: 'Similarity Analysis', icon: Network },
    { id: 'compare', label: 'Comparison Workspace', icon: GitCompare },
    { id: 'library', label: 'Document Library', icon: FolderOpen },
    { id: 'history', label: 'Analysis History', icon: History },
    { id: 'profile', label: 'Profile & Settings', icon: User },
  ];

  const currentTabLabel = navItems.find(i => i.id === activeTab)?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-[#060b13] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#060b13]/90 border-b border-slate-800/80 px-6 py-3 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={onNavigateHome}
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 font-semibold cursor-pointer"
            >
              <div className="p-1 rounded-md bg-gradient-to-br from-cyan-400 to-violet-500 text-slate-950">
                <FileText className="w-3 h-3 stroke-[2.5]" />
              </div>
              <span>DocuMatch AI</span>
            </button>
            <span className="text-slate-600">/</span>
            <span className="text-white font-medium">{currentTabLabel}</span>
          </div>
        </div>

        {/* Right Action Zone */}
        <div className="flex items-center gap-4 text-xs">
          {/* User Profile Pill */}
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-sm shadow-cyan-500/30">
              {(profile?.fullName || user?.email || 'U')[0].toUpperCase()}
            </div>
            <span className="hidden md:inline font-medium text-slate-300">
              {profile?.fullName || user?.email?.split('@')[0] || 'User'}
            </span>
          </button>
        </div>
      </header>

      {/* Main App Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`border-r border-slate-800/80 bg-[#070e1c] transition-all duration-300 flex flex-col justify-between shrink-0 ${
            sidebarCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          {/* Nav List */}
          <div className="p-3 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id as DashboardTab)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-950/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-850/60'
                  }`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>

          {/* Bottom Sidebar Action: Logout */}
          <div className="p-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-950/20 transition-all cursor-pointer"
              title={sidebarCollapsed ? 'Log out' : undefined}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && <span>Log Out</span>}
            </button>
          </div>
        </aside>

        {/* Viewport Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {activeTab === 'overview' && (
            <DashboardOverview
              documents={documents}
              history={history}
              jobs={jobs}
              onNavigate={tab => setActiveTab(tab as DashboardTab)}
              onOpenComparison={handleOpenComparison}
            />
          )}

          {activeTab === 'upload' && (
            <UploadView
              onAnalysisCompleted={reloadAllData}
              onNavigateToAnalysis={() => {
                reloadAllData();
                setActiveTab('similarity');
              }}
            />
          )}

          {activeTab === 'similarity' && (
            <SimilarityAnalysisView
              documents={documents}
              onOpenComparison={handleOpenComparison}
              onNavigateToUpload={() => setActiveTab('upload')}
            />
          )}

          {activeTab === 'compare' && (
            <ComparisonWorkspace
              documents={documents}
              initialDocAId={compareDocAId}
              initialDocBId={compareDocBId}
            />
          )}

          {activeTab === 'library' && (
            <DocumentLibrary
              documents={documents}
              onDocumentDeleted={reloadAllData}
              onOpenComparison={handleOpenComparison}
              onNavigateToUpload={() => setActiveTab('upload')}
            />
          )}

          {activeTab === 'history' && (
            <AnalysisHistoryView
              history={history}
              jobs={jobs}
              onNavigateToAnalysis={() => setActiveTab('similarity')}
              onRefresh={reloadAllData}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              documents={documents}
              onLogout={onLogout}
            />
          )}
        </main>
      </div>
    </div>
  );
};
