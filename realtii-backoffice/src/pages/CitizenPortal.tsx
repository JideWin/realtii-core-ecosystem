// src/pages/CitizenPortal.tsx
import React from 'react';
import { Search, ShieldCheck } from 'lucide-react';

export const CitizenPortal: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans text-slate-900">
      
      <div className="text-center max-w-2xl px-6">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-2xl text-white shadow-lg">R</div>
          <span className="text-3xl font-extrabold tracking-tight">Realtii</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900">
          Ekiti State Land Registry
        </h1>
        <p className="text-lg text-slate-600 mb-10">
          The official public portal for property verification, C-of-O applications, and land title searches.
        </p>

        <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-200 flex max-w-xl mx-auto mb-8">
          <div className="flex-1 flex items-center px-4">
            <Search className="text-slate-400 mr-3" size={20} />
            <input 
              type="text" 
              placeholder="Enter Property ID or Owner NIN..." 
              className="w-full bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400"
            />
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors">
            Search
          </button>
        </div>

        <div className="flex items-center justify-center space-x-2 text-sm text-emerald-600 font-medium">
          <ShieldCheck size={18} />
          <span>Secured by the Ekiti State Government</span>
        </div>
      </div>

    </div>
  );
};