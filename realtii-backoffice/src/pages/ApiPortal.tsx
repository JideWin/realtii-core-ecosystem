// src/pages/ApiPortal.tsx
import React, { useState, useEffect } from 'react';
import { Key, Activity } from 'lucide-react';

// Simulated API Service talking to NestJS
const ApiPortalService = {
  getPartnerMetrics: async (apiKey: string) => {
    const response = await fetch(`http://localhost:3000/api/v1/billing/metrics/${apiKey}`);
    if (!response.ok) throw new Error('Failed to fetch');
    return response.json();
  }
};

export const ApiPortal: React.FC = () => {
  const [metrics, setMetrics] = useState<any>({});
  
  useEffect(() => {
    // Fetching the REAL data from PostgreSQL using your live key!
    ApiPortalService.getPartnerMetrics("ek-live-j5z0duhh")
      .then(data => setMetrics(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1120] p-8 font-sans text-slate-300">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-12 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Developer Platform</h1>
            <p className="text-slate-400">Manage your B2B integration with the Ekiti State Land Registry.</p>
          </div>
          <div className="text-right bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Authenticated as</p>
            <div className="flex items-center space-x-3">
              <span className="font-bold text-white text-lg">{metrics.partnerName || 'Loading...'}</span>
              {metrics.tier && (
                <span className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-xs font-bold text-blue-400 uppercase">
                  {metrics.tier}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Auth Box */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 mb-8 backdrop-blur-sm">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center">
            <Key className="mr-2 text-blue-400" size={20} /> Authentication & API Key
          </h2>
          <div className="bg-[#0B1120] border border-slate-700 rounded-xl p-4 flex justify-between items-center mb-4">
            <code className="text-emerald-400 font-mono tracking-wider">
              {metrics.activeApiKey ? metrics.activeApiKey : '••••••••••••••••••••••••'}
            </code>
          </div>
          <button className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
            Rotate API Key
          </button>
        </div>

        {/* Logs Table */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center">
            <Activity className="mr-2 text-emerald-400" size={20} /> Live Request Logs
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700/50 text-xs uppercase text-slate-500 tracking-wider">
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold">Endpoint</th>
                  <th className="pb-3 font-bold">Timestamp</th>
                  <th className="pb-3 font-bold">Latency</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recentRequests?.length > 0 ? (
                  metrics.recentRequests.map((req: any, idx: number) => (
                    <tr key={idx} className="border-b border-slate-800 text-sm hover:bg-slate-800/50 transition-colors">
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${req.status === 200 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="py-4 font-mono text-slate-400">{req.endpoint}</td>
                      <td className="py-4 text-slate-500">{req.timestamp}</td>
                      <td className="py-4 text-slate-500">{req.ms}ms</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500 italic">No recent API requests logged.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}