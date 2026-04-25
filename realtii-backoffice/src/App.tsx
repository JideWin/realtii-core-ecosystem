import React, { useState, useEffect } from 'react';
import { 
  Search, Shield, Activity, Clock, CheckCircle2, XCircle, 
  FileText, User, MapPin, Calendar, Database, ShieldAlert, 
  Check, Filter
} from 'lucide-react';
import logo from './assets/logo.png'; // Make sure the logo is still in your assets folder!

type Application = {
  id: string; // The database ID from NestJS
  title: string;
  description: string;
  location: string;
  propertyType: string;
  status: string;
  createdAt: string;
  hubAppointmentId?: string;
};

type Toast = { message: string; type: 'success' | 'error' | 'info'; id: number };

// CHANGE THIS to your live production URL when you deploy
const API_BASE_URL = 'http://localhost:3000'; 

function App() {
  const [queue, setQueue] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED'>('PENDING');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Telemetry
  const [time, setTime] = useState(new Date());
  const [toasts, setToasts] = useState<Toast[]>([]);

  // 1. LIVE DATA FETCH: Pull from NestJS Database on load
  const fetchLiveQueue = async () => {
    setIsLoading(true);
    try {
      // NOTE: If your NestJS route is protected, you must add your JWT token to the headers here
      const response = await fetch(`${API_BASE_URL}/properties`, {
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer YOUR_JWT_TOKEN` 
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setQueue(data);
        
        // Auto-select the first pending item if one exists
        const pendingItems = data.filter((item: any) => item.status === 'PENDING');
        if (pendingItems.length > 0 && !selectedApp) {
          setSelectedApp(pendingItems[0]);
        }
      } else {
        showToast("Database Access Denied (Check JWT Auth)", "error");
      }
    } catch (error) {
      showToast("System Error: Cannot reach Cloud Gateway", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveQueue();
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { message, type, id }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const filteredQueue = queue.filter(app => app.status === filter);

  // 2. LIVE APPROVE ACTION: Push update to NestJS
  const handleApprove = async () => {
    if (!selectedApp) return;
    setIsProcessing(true);
    
    // Generate the Hub ID locally before saving
    const generatedAppId = `EK-APP-${Math.floor(10000 + Math.random() * 90000)}`;
    
    try {
      const response = await fetch(`${API_BASE_URL}/properties/${selectedApp.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer YOUR_JWT_TOKEN`
        },
        body: JSON.stringify({ 
          status: 'APPROVED',
          // Assuming you add a field in your NestJS Property entity to store this ID
          // hubAppointmentId: generatedAppId 
        })
      });

      if (response.ok) {
        showToast(`Approved! Generated ID: ${generatedAppId}`, "success");
        await fetchLiveQueue(); // Refresh the list from the database
        setSelectedApp(null);
      } else {
        showToast("Database Update Failed", "error");
      }
    } catch (error) {
      showToast("Network Error during Approval", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper to safely parse descriptions (NIN | Phone)
  const parseDescription = (desc: string) => {
    if (!desc) return { nin: 'N/A', phone: 'N/A' };
    const parts = desc.split('|');
    return {
      nin: parts[0]?.replace('NIN:', '').trim() || 'N/A',
      phone: parts[1]?.replace('Phone:', '').trim() || 'N/A'
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-orange-100 selection:text-orange-900 pb-12">
      
      {/* Toast System */}
      <div className="fixed top-6 right-6 z-[100] flex flex-col space-y-3">
        {toasts.map(toast => (
          <div key={toast.id} className={`flex items-center px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-right-8 fade-in duration-300 ${
            toast.type === 'success' ? 'bg-white border-green-200 text-slate-800' : 'bg-red-50 border-red-200 text-red-900'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 className="text-green-500 mr-3" size={20} /> : <XCircle className="text-red-500 mr-3" size={20} />}
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40 backdrop-blur-md bg-white/90">
        <div className="mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded border border-slate-100 p-1">
               <img src={logo} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">Realtii Intranet</h1>
              <p className="text-[9px] font-bold text-orange-500 uppercase tracking-widest">Back-Office Review Console</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
               <input type="text" placeholder="Search Database..." className="pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 w-64 transition-all" />
             </div>
             <div className="flex items-center space-x-2 border-l border-slate-200 pl-6">
                <div className="w-7 h-7 bg-slate-900 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">OP</div>
                <span className="text-xs font-semibold text-slate-700">Official</span>
             </div>
          </div>
        </div>
      </header>

      {/* Main Triage Workspace */}
      <main className="flex-1 w-full mx-auto px-6 py-6 h-[calc(100vh-64px-40px)] flex overflow-hidden gap-6">
        
        {/* Left Nav Menu */}
        <div className="w-48 flex flex-col space-y-2">
           <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-3">Review Queues</h3>
           <button onClick={() => setFilter('PENDING')} className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${filter === 'PENDING' ? 'bg-orange-50 text-orange-700 font-bold' : 'text-slate-600 hover:bg-slate-100 font-semibold'}`}>
             <span className="flex items-center text-sm"><Clock size={16} className="mr-2" /> Pending</span>
             {filter === 'PENDING' && <span className="bg-orange-200 text-orange-800 text-[10px] px-2 py-0.5 rounded-full">{filteredQueue.length}</span>}
           </button>
           <button onClick={() => setFilter('APPROVED')} className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${filter === 'APPROVED' ? 'bg-green-50 text-green-700 font-bold' : 'text-slate-600 hover:bg-slate-100 font-semibold'}`}>
             <span className="flex items-center text-sm"><CheckCircle2 size={16} className="mr-2" /> Approved</span>
             {filter === 'APPROVED' && <span className="bg-green-200 text-green-800 text-[10px] px-2 py-0.5 rounded-full">{filteredQueue.length}</span>}
           </button>
        </div>

        {/* Middle Queue List */}
        <div className="w-96 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
           <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
             <h2 className="text-sm font-bold text-slate-800">Live Database Synced</h2>
             <Filter size={14} className="text-slate-400" />
           </div>
           
           <div className="flex-1 overflow-y-auto">
             {isLoading ? (
                <div className="p-8 text-center text-slate-400 text-sm font-medium animate-pulse">Syncing with State Registry...</div>
             ) : filteredQueue.length === 0 ? (
               <div className="p-8 text-center text-slate-400 text-sm font-medium">Queue is currently empty.</div>
             ) : (
               filteredQueue.map(app => (
                 <div 
                   key={app.id} 
                   onClick={() => setSelectedApp(app)}
                   className={`p-4 border-b border-slate-100 cursor-pointer transition-all ${selectedApp?.id === app.id ? 'bg-orange-50/50 border-l-4 border-l-orange-500' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}`}
                 >
                   <div className="flex justify-between items-start mb-1">
                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">DB-ID: {app.id.substring(0, 8)}...</span>
                     <span className="text-[10px] font-semibold text-slate-400">
                       {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'New'}
                     </span>
                   </div>
                   <h4 className="font-bold text-slate-900 text-sm mb-1 truncate">{app.title.replace('New Application: ', '')}</h4>
                   <p className="text-xs text-slate-500 flex items-center"><MapPin size={12} className="mr-1" /> {app.location} • {app.propertyType}</p>
                 </div>
               ))
             )}
           </div>
        </div>

        {/* Right Dossier Inspector */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden relative">
           {selectedApp ? (
             <>
               <div className="h-1 w-full bg-gradient-to-r from-orange-400 to-orange-600"></div>
               
               <div className="p-8 border-b border-slate-100 flex justify-between items-start">
                 <div>
                   <h2 className="text-2xl font-bold text-slate-900 mb-1">{selectedApp.title.replace('New Application: ', '')}</h2>
                   <div className="flex items-center space-x-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                     <span className="flex items-center"><User size={14} className="mr-1" /> NIN: {parseDescription(selectedApp.description).nin}</span>
                   </div>
                 </div>
                 
                 {selectedApp.status === 'APPROVED' && (
                   <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-lg text-right">
                     <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5">Status</p>
                     <p className="font-bold text-lg">CLEARED FOR HUB</p>
                   </div>
                 )}
               </div>

               <div className="flex-1 p-8 overflow-y-auto bg-slate-50/30">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Application Details</h3>
                 
                 <div className="grid grid-cols-2 gap-6 mb-8">
                   <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Land Location (LGA)</p>
                     <p className="font-semibold text-slate-900">{selectedApp.location || 'Not Provided'}</p>
                   </div>
                   <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Registration Type</p>
                     <p className="font-semibold text-slate-900">{selectedApp.propertyType || 'Standard'}</p>
                   </div>
                   <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contact Phone</p>
                     <p className="font-semibold text-slate-900">{parseDescription(selectedApp.description).phone}</p>
                   </div>
                   <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                     <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">State Registry Record</p>
                       <p className="font-mono text-slate-500 text-xs mt-1">{selectedApp.id}</p>
                     </div>
                     <Database size={18} className="text-slate-300" />
                   </div>
                 </div>

                 {selectedApp.status === 'PENDING' && (
                   <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start mt-auto">
                     <ShieldAlert size={20} className="text-blue-500 mr-3 mt-0.5" />
                     <p className="text-xs font-medium text-blue-900 leading-relaxed">
                       <strong>Reviewer Instruction:</strong> Verify the NIN matches the provided name via the Federal API check. If verified, approve this request to push it to the Physical Hub system.
                     </p>
                   </div>
                 )}
               </div>

               {/* Action Bar */}
               {selectedApp.status === 'PENDING' && (
                 <div className="p-6 border-t border-slate-200 bg-white flex justify-end space-x-4">
                   <button 
                     onClick={() => showToast("Feature locked by Admin", "info")} 
                     className="px-6 py-2.5 rounded-lg font-bold text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
                     Reject Application
                   </button>
                   <button 
                     onClick={handleApprove}
                     disabled={isProcessing}
                     className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2.5 rounded-lg font-bold text-sm flex items-center transition-all shadow-md disabled:opacity-70">
                     {isProcessing ? 'Writing to Database...' : 'Approve for Biometrics'} <Check size={18} className="ml-2" />
                   </button>
                 </div>
               )}
             </>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
               <Database size={64} strokeWidth={1} className="mb-4" />
               <p className="text-sm font-medium">Select an application from the queue to review.</p>
             </div>
           )}
        </div>

      </main>

      {/* Telemetry Footer */}
      <footer className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 h-10 flex items-center justify-between px-6 z-40">
        <div className="flex items-center space-x-6 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
          <span className="flex items-center"><Activity size={12} className="text-green-500 mr-2" /> Live Database Linked</span>
        </div>
        <div className="flex items-center text-[10px] font-bold tracking-widest text-slate-500 font-mono uppercase">
          <span className="text-orange-500">{time.toLocaleTimeString('en-US', { hour12: false })}</span>
          <span className="mx-2 text-slate-300">|</span>
          <span>{time.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </footer>
    </div>
  );
}

export default App;