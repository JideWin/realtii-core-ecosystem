// src/pages/LandingPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, ShieldCheck, Zap, ChevronRight, BookOpen, Terminal } from 'lucide-react';
import logo from '../assets/logo.png';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      
      {/* --- GCP-STYLE HEADER --- */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50 h-16 flex items-center">
        <div className="w-full max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 flex items-center justify-center">
              <img src={logo} alt="Realtii" className="w-full h-full object-contain" />
            </div>
            <span className="text-lg font-medium tracking-tight text-slate-900">
              Realtii <span className="text-slate-500 font-normal">API Gateway</span>
            </span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#overview" className="text-sm font-medium text-slate-600 hover:text-slate-900">Overview</a>
            <a href="#documentation" className="text-sm font-medium text-slate-600 hover:text-slate-900">Documentation</a>
            <button onClick={() => navigate('/billing')} className="text-sm font-medium text-slate-600 hover:text-slate-900">Pricing</button>
          </nav>

          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/auth')} className="text-sm font-medium text-[#d93025] hover:bg-red-50 px-3 py-1.5 rounded transition-colors">
              Sign In
            </button>
            <button onClick={() => navigate('/auth')} className="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-4 py-2 rounded text-sm font-medium transition-colors shadow-sm">
              Console
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* --- GCP-STYLE HERO --- */}
        <section className="pt-20 pb-24 border-b border-slate-200 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-3/5 pr-8">
              <h1 className="text-4xl md:text-5xl font-normal text-slate-900 mb-6 leading-tight tracking-tight">
                Build with the official <br /> Ekiti State Land API.
              </h1>
              <p className="text-base text-slate-600 mb-8 max-w-xl leading-relaxed">
                A highly available, RESTful infrastructure for institutional property verification. Integrate secure querying, KYB validation, and automated vaulting directly into your enterprise applications.
              </p>
              
              <div className="flex items-center space-x-4">
                <button onClick={() => navigate('/auth')} className="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-6 py-2.5 rounded text-sm font-medium transition-colors shadow-sm flex items-center">
                  Start Building <ChevronRight size={16} className="ml-1" />
                </button>
                <button onClick={() => navigate('/billing')} className="bg-white border border-slate-300 hover:bg-slate-50 text-[#1a73e8] px-6 py-2.5 rounded text-sm font-medium transition-colors">
                  View Quotas & Pricing
                </button>
              </div>
            </div>
            
            <div className="hidden md:block md:w-2/5">
              {/* Abstract Architecture Graphic */}
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-4 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <div className="text-xs text-slate-400 ml-2 font-mono">POST /api/v1/verify</div>
                </div>
                <pre className="text-xs text-slate-600 font-mono bg-slate-50 p-4 rounded border border-slate-100 overflow-hidden">
                  <code>
                    {`{\n  "status": "CLEARED",\n  "property": {\n    "id": "EK-8921-A",\n    "owner": "Verified",\n    "encumbrance": null\n  },\n  "latency": "42ms"\n}`}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* --- GCP-STYLE FEATURES --- */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl font-normal text-slate-900 mb-12 border-b border-slate-200 pb-4">Platform Capabilities</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 border border-slate-200 rounded-lg hover:shadow-md transition-shadow bg-white">
                <Terminal size={28} className="text-[#1a73e8] mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">RESTful Integration</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Predictable, resource-oriented endpoints returning standard JSON. Designed for rapid integration into existing Node.js, Java, and Python environments.
                </p>
                <a href="#" className="inline-flex items-center mt-4 text-[#1a73e8] text-sm font-medium hover:underline">
                  View reference <ChevronRight size={14} />
                </a>
              </div>

              <div className="p-6 border border-slate-200 rounded-lg hover:shadow-md transition-shadow bg-white">
                <ShieldCheck size={28} className="text-[#1a73e8] mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Institutional Security</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Strict KYB enforcement. API keys are only minted after successful CAC verification and administrative approval via the Executive Dashboard.
                </p>
                <a href="#" className="inline-flex items-center mt-4 text-[#1a73e8] text-sm font-medium hover:underline">
                  Read security whitepaper <ChevronRight size={14} />
                </a>
              </div>

              <div className="p-6 border border-slate-200 rounded-lg hover:shadow-md transition-shadow bg-white">
                <Zap size={28} className="text-[#1a73e8] mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">High Availability</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Backed by a scalable PostgreSQL architecture ensuring your property verification queries resolve consistently with minimal latency.
                </p>
                <a href="#" className="inline-flex items-center mt-4 text-[#1a73e8] text-sm font-medium hover:underline">
                  Check system status <ChevronRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};