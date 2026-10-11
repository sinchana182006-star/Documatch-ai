/**
 * DocuMatch AI - Public Landing Page
 * Deep midnight navy palette, electric cyan & violet accents,
 * connected document network visualization, and high-fidelity assets.
 */

import React, { useState } from 'react';
import {
  FileText,
  Search,
  GitCompare,
  Network,
  ShieldCheck,
  ArrowRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import heroImage from '../assets/images/hero_document_mesh_1791721778783.jpg';
import featureImage from '../assets/images/feature_similarity_graph_1791721792351.jpg';

interface Props {
  onNavigate: (view: 'landing' | 'login' | 'register' | 'dashboard') => void;
}

export const LandingPage: React.FC<Props> = ({ onNavigate }) => {
  const [selectedFeature, setSelectedFeature] = useState(0);

  const features = [
    {
      title: 'Cryptographic Exact Duplicate Finder',
      description:
        'Computes client-side and server-side SHA-256 cryptographic fingerprints. Instantly identifies 100% duplicate documents regardless of file renaming or folder nesting.',
      metric: '0.0ms Lookup · 100% Hash Precision',
      icon: Layers,
    },
    {
      title: 'TF-IDF & Cosine Similarity Engine',
      description:
        'Normalizes linguistic content, eliminates stop words, and creates high-dimensional vector representations to calculate mathematical similarity coefficients.',
      metric: 'Cosine Distance · N-gram Shingling',
      icon: Search,
    },
    {
      title: 'Interactive Document Similarity Map',
      description:
        'Translates similarity scores into spatial node graphs. Cluster-connected documents visually cluster together, revealing thematic relationships across entire archives.',
      metric: 'Interactive Nodes · Dynamic Spring Edges',
      icon: Network,
    },
    {
      title: 'Side-by-Side Word-Level Diff Workspace',
      description:
        'Line-by-line and token-level comparison that highlights exact matches, inserted revisions, and removed paragraphs in real time.',
      metric: 'Color-Coded Diff · Paragraph Alignment',
      icon: GitCompare,
    },
  ];

  return (
    <div className="min-h-screen bg-[#060b13] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-cyan-600/10 blur-[130px] rounded-full" />
        <div className="absolute top-[40%] -left-40 w-[600px] h-[600px] bg-violet-600/10 blur-[140px] rounded-full" />
        <div className="absolute top-[70%] -right-40 w-[600px] h-[600px] bg-cyan-500/10 blur-[140px] rounded-full" />
      </div>

      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#060b13]/85 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-4">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 group text-left cursor-pointer"
          >
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 text-slate-950 shadow-sm shadow-cyan-500/30">
              <FileText className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span>DocuMatch AI</span>
          </button>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
              Features
            </a>
            <a href="#workflow" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
              Workflow
            </a>
            <a href="#security" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
              Security & Storage
            </a>
            <button
              onClick={() => onNavigate('dashboard')}
              className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0"
            >
              Explore Workspace
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('login')}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 rounded-lg transition-all shadow-md shadow-cyan-500/20 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Editorial Headline & Actions */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-medium text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 rounded-full px-3 py-1">
                <Sparkles className="w-3 h-3" />
                <span>Next-Gen Document Intelligence & Deduplication</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12] text-balance">
                Discover What Your Documents Have in Common.
              </h1>

              <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-xl">
                DocuMatch AI extracts and normalizes textual content across PDF, DOCX, and TXT files.
                Detect exact duplicates via SHA-256 fingerprinting, calculate mathematical similarity percentages with
                TF-IDF cosine metrics, and explore document relationships on an interactive spatial map.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate('register')}
                  className="flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-teal-300 hover:from-cyan-300 hover:to-teal-200 rounded-xl transition-all shadow-lg shadow-cyan-500/25 active:scale-95 cursor-pointer"
                >
                  <span>Start Free Analysis</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('login')}
                  className="px-6 py-3.5 text-sm font-medium text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl transition-all cursor-pointer"
                >
                  Sign In to Dashboard
                </button>
              </div>

              {/* Unboxed Metadata Stats */}
              <div className="pt-6 border-t border-slate-800/80 flex items-center gap-6 text-xs text-slate-400">
                <div>
                  <span className="font-mono font-semibold text-white text-sm tabular-nums">PDF · DOCX · TXT</span>
                  <div className="text-slate-500 text-[11px] mt-0.5">Full Text Extraction</div>
                </div>
                <span className="text-slate-700">/</span>
                <div>
                  <span className="font-mono font-semibold text-cyan-400 text-sm tabular-nums">SHA-256</span>
                  <div className="text-slate-500 text-[11px] mt-0.5">Exact Duplicate Hashing</div>
                </div>
                <span className="text-slate-700">/</span>
                <div>
                  <span className="font-mono font-semibold text-violet-400 text-sm tabular-nums">TF-IDF Vector</span>
                  <div className="text-slate-500 text-[11px] mt-0.5">Cosine Similarity Engine</div>
                </div>
              </div>
            </div>

            {/* Right Column: High-Fidelity Document Visual Asset */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl shadow-cyan-950/50 group bg-slate-950">
                <img
                  src={heroImage}
                  alt="DocuMatch AI Document Network Mesh"
                  referrerPolicy="no-referrer"
                  className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060b13] via-transparent to-transparent opacity-80" />
                
                {/* Visual Overlay Card */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-[#091122]/90 border border-cyan-500/20 backdrop-blur-md">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-cyan-300">Live Similarity Analysis</span>
                    <span className="font-mono text-emerald-400 tabular-nums">98.4% Match Found</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-400 to-violet-500 h-1.5 rounded-full w-[98.4%]" />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2">
                    <span className="truncate max-w-[180px]">Mutual_NDA_Standard.txt</span>
                    <span className="text-violet-400">Near Duplicate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Similarity Network Visualization Preview */}
      <section id="features" className="py-20 px-6 border-t border-slate-900 bg-[#070e1c]/40">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">
              Comprehensive Feature Suite
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Engineered for Legal, Financial & Enterprise Repositories
            </h2>
            <p className="text-slate-400 mt-3 text-sm sm:text-base leading-relaxed">
              Eliminate redundant file sprawl, detect contract revisions, and locate overlapping intellectual property
              with scientific precision.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Left: Feature selector list */}
            <div className="lg:col-span-5 space-y-3">
              {features.map((feat, idx) => {
                const Icon = feat.icon;
                const isActive = selectedFeature === idx;
                return (
                  <button
                    key={feat.title}
                    onClick={() => setSelectedFeature(idx)}
                    className={`w-full text-left p-5 rounded-xl border transition-all text-sm cursor-pointer ${
                      isActive
                        ? 'bg-[#0f1d38] border-cyan-500/50 shadow-lg shadow-cyan-950/40 text-white'
                        : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-2 rounded-lg mt-0.5 ${
                          isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-semibold text-white">{feat.title}</div>
                        <p className="text-xs text-slate-400 leading-relaxed">{feat.description}</p>
                        <div className="text-[11px] font-mono text-cyan-400/90 pt-1">{feat.metric}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right: Feature spotlight graphic */}
            <div className="lg:col-span-7">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#091122]">
                <img
                  src={featureImage}
                  alt="DocuMatch Similarity Graph"
                  referrerPolicy="no-referrer"
                  className="w-full h-[420px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#091122] via-[#091122]/30 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 bg-cyan-950/80 border border-cyan-800/80 rounded-md px-2.5 py-1 mb-2">
                    <Network className="w-3.5 h-3.5" />
                    <span>Real-Time Graph Topology</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {features[selectedFeature].title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl">
                    Documents are projected into an interactive spatial network where line thickness and node proximity
                    map directly to mathematical cosine overlap.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Workflow */}
      <section id="workflow" className="py-20 px-6 border-t border-slate-900">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">
              Streamlined Operation
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Upload → Analyze → Discover</h2>
            <p className="text-slate-400 text-sm mt-2">
              Three clean steps from raw document ingestion to actionable duplicate insights.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-cyan-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm mb-4">
                01
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Multi-Format Document Ingestion</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Drag and drop PDF, DOCX, and TXT files in batch. Extracted in browser and securely streamed to private
                isolated storage.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-violet-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-sm mb-4">
                02
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Hashing & Vector Similarity</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Computes cryptographic SHA-256 hashes for 100% duplicate detection alongside TF-IDF term vectors and
                3-gram shingles for linguistic near-duplicates.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-emerald-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm mb-4">
                03
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Discover, Map & Compare</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Filter documents by classification (Exact, Near, Unique), explore connected graph clusters, and view
                word-level side-by-side diffs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy & Security Section */}
      <section id="security" className="py-16 px-6 border-t border-slate-900 bg-[#070e1c]/50">
        <div className="max-w-7xl mx-auto">
          <div className="p-8 rounded-2xl bg-gradient-to-r from-slate-950 via-[#0b1426] to-slate-950 border border-cyan-500/20">
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-3">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Enterprise Security by Architecture</span>
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Zero Data Leakage with Strict Row-Level Security
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                  Every document, vector calculation, and history entry is isolated by strict PostgreSQL Row Level
                  Security policies. Document binaries reside in private storage buckets, preventing unauthorized cross-tenant access.
                </p>
              </div>

              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Open Demo Workspace</span>
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
                >
                  <span>Create Free Account</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-slate-900 bg-[#05080e] text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">DocuMatch AI</span>
            <span>·</span>
            <span>Intelligent Document Similarity & Duplicate Finder</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-slate-300 transition-colors">
              Features
            </a>
            <a href="#workflow" className="hover:text-slate-300 transition-colors">
              Workflow
            </a>
            <a href="#security" className="hover:text-slate-300 transition-colors">
              Security
            </a>
            <button
              onClick={() => onNavigate('login')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Sign In
            </button>
          </div>

          <div>
            <span>© {new Date().getFullYear()} DocuMatch AI. Production-grade architecture.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
