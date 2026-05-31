// src/pages/ExecutiveDashboard.tsx
import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, FolderOpen, CalendarDays, CheckCircle, 
  XCircle, Building, ExternalLink, X, FileText
} from 'lucide-react';

// Make sure your logo is in the src/assets folder!
import logo from '../assets/logo.png'; 

export default function ExecutiveDashboard() {
  const [activeTab, setActiveTab] = useState<'property-vault' | 'api-approvals'>('api-approvals');

  // Live Data State
  const [pendingApplications, setPendingApplications] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  
  // NEW: Loading State for Instant UI Feedback
  const [isProcessing, setIsProcessing] = useState(false);

  // Simulated data for Phase 4 (Citizen Portal)
  const [citizenFilings, setCitizenFilings] = useState([
    {
      id: 'FIL-2026-891', applicantName: 'Ogunleye Jide', nin: '82947104821',
      propertyLocation: 'Plot 14, GRA Extension, Ado-Ekiti',
      submittedDocs: ['Deed of Assignment', 'Registered Survey'],
      date: 'Today, 09:14 AM'
    }
  ]);

  // FETCH REAL DATA ON LOAD
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch('http://127.0.0.1:3000/api/v1/billing/applications/pending');
      const data = await res.json();
      
      const formattedData = data.map((app: any) => ({
        id: app.id,
        companyName: app.companyName, 
        email: app.email,
        phone: app.phone,
        tier: app.tier,
        cacNumber: app.cacNumber,
        documents: app.documents || [],
        date: new Date(app.createdAt).toLocaleDateString()
      }));
      
      setPendingApplications(formattedData);
    } catch (err) {
      console.error("Error fetching live applications:", err);
    }
  };

  // --- THE UPGRADED ACTIONS WITH SPINNERS ---
  const handleApproveAPI = async (id: string, company: string) => {
    setIsProcessing(true); // Trigger the loading state instantly
    try {
      const res = await fetch(`http://127.0.0.1:3000/api/v1/billing/applications/${id}/approve`, {
        method: 'PATCH',
      });
      if (res.ok) {
        alert(`Approved! A secure checkout link has been emailed to ${company}.`);
        setSelectedApp(null);
        fetchApplications(); // Refresh the list
      } else {
        alert("Server responded, but approval failed.");
      }
    } catch (err) {
      alert("Network Error while approving.");
    } finally {
      setIsProcessing(false); // Turn off the loading state
    }
  };

  const handleRejectAPI = async (id: string, company: string) => {
    const reason = prompt(`Please provide a reason for declining ${company}:`);
    if (!reason) return; // Cancel if they clicked away

    setIsProcessing(true); // Trigger the loading state instantly
    try {
      const res = await fetch(`http://127.0.0.1:3000/api/v1/billing/applications/${id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        alert(`Declined ${company}. A notification has been sent.`);
        setSelectedApp(null);
        fetchApplications(); // Refresh the list
      } else {
        alert("Server responded, but rejection failed.");
      }
    } catch (err) {
      alert("Network Error while rejecting.");
    } finally {
      setIsProcessing(false); // Turn off the loading state
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex text-slate-900">
      
      {/* SIDEBAR */}
      <div className="w-72 bg-[#064e3b] text-white min-h-screen p-6 flex flex-col shadow-2xl z-10">
        <div className="flex items-center space-x-3 mb-12">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg p-1">
            <img src={logo} alt="Realtii Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">Realtii<span className="text-amber-400">Admin</span></h2>
            <p className="text-xs text-emerald-200/70 font-medium">Ekiti State Hub</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          <button onClick={() => setActiveTab('property-vault')} className={`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'property-vault' ? 'bg-emerald-600 text-white shadow-lg' : 'text-emerald-100/70 hover:bg-[#047857]'}`}>
            <FolderOpen size={20} className="mr-3" /><span>Citizen Vault</span>
          </button>
          
          <button onClick={() => setActiveTab('api-approvals')} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'api-approvals' ? 'bg-emerald-600 text-white shadow-lg' : 'text-emerald-100/70 hover:bg-[#047857]'}`}>
             <div className="flex items-center space-x-3"><Building size={20} /><span>API Approvals</span></div>
            {pendingApplications.length > 0 && <span className="bg-amber-400 text-[#064e3b] text-xs px-2 py-0.5 rounded-full">{pendingApplications.length}</span>}
          </button>
        </nav>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 p-10 h-screen overflow-y-auto bg-slate-50 relative">
        
        {/* TAB 1: CITIZEN VAULT */}
        {activeTab === 'property-vault' && (
          <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold mb-2 text-[#064e3b]">Document Verification Hub</h1>
              <p className="text-slate-500 font-medium">Review citizen property submissions, verify authenticity, and archive to Vault.</p>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-emerald-50 border-b border-emerald-100 text-xs uppercase text-emerald-800 font-extrabold tracking-wider">
                    <th className="p-4 pl-6">Applicant Info</th>
                    <th className="p-4">Property Location</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {citizenFilings.map((filing) => (
                    <tr key={filing.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 pl-6">
                        <p className="font-bold text-slate-900 text-base">{filing.applicantName}</p>
                        <p className="text-sm text-slate-500 mt-1">NIN: {filing.nin}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-bold text-slate-700">{filing.propertyLocation}</p>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <button className="bg-[#064e3b] hover:bg-[#047857] text-white px-4 py-2 rounded-lg text-sm font-bold w-48 shadow-md transition-all">
                          Verify & Vault
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: B2B API APPROVALS */}
        {activeTab === 'api-approvals' && (
          <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
             <div className="mb-8">
              <h1 className="text-3xl font-extrabold mb-2 text-[#064e3b]">B2B API Approvals</h1>
              <p className="text-slate-500 font-medium">Review KYB documents and approve API keys for institutional partners.</p>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-emerald-50 border-b border-emerald-100 text-xs uppercase text-emerald-800 font-extrabold tracking-wider">
                    <th className="p-4 pl-6">Company Info</th>
                    <th className="p-4">Requested Tier</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingApplications.length === 0 ? (
                    <tr><td colSpan={3} className="text-center py-12 text-slate-400 font-medium">No pending applications. Queue is empty.</td></tr>
                  ) : pendingApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 pl-6">
                        <p className="font-bold text-slate-900">{app.companyName}</p>
                        <p className="text-sm text-slate-500">{app.email}</p>
                      </td>
                      <td className="p-4">
                        <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold">{app.tier}</span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <button 
                          onClick={() => setSelectedApp(app)} 
                          className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-6 py-2 rounded-lg text-sm font-bold shadow-sm transition-all"
                        >
                          Review File
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* REVIEW MODAL OVERLAY */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative">
            
            <button onClick={() => !isProcessing && setSelectedApp(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700">
              <X size={24} />
            </button>

            <h2 className="text-2xl font-extrabold text-[#064e3b] mb-1">Application Review</h2>
            <p className="text-slate-500 text-sm mb-8">Ref: {selectedApp.id}</p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Company Name</p>
                <p className="font-bold text-slate-800">{selectedApp.companyName}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">CAC Registration</p>
                <p className="font-bold text-slate-800 flex items-center">
                  {selectedApp.cacNumber} <ExternalLink size={14} className="ml-2 text-blue-500 cursor-pointer" />
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Contact Details</p>
                <p className="font-bold text-slate-800">{selectedApp.email}</p>
                <p className="text-sm text-slate-500">{selectedApp.phone}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Requested Tier</p>
                <span className="inline-block mt-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold">{selectedApp.tier} API Access</span>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-xs font-bold text-slate-400 uppercase mb-3">Uploaded Corporate Documents</p>
              <div className="space-y-2">
                {selectedApp.documents?.length > 0 ? (
                  selectedApp.documents.map((url: string, idx: number) => (
                    <a 
                      key={idx} 
                      href={url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      <FileText size={16} className="text-blue-500 mr-2 shrink-0" /> 
                      <span className="truncate">View Attached Document {idx + 1}</span>
                      <ExternalLink size={14} className="ml-auto text-slate-400" />
                    </a>
                  ))
                ) : (
                  <div className="p-3 bg-red-50 text-red-500 text-sm rounded-lg border border-red-100 font-bold">
                    No documents uploaded.
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-4">
              <button 
                onClick={() => handleRejectAPI(selectedApp.id, selectedApp.companyName)}
                disabled={isProcessing}
                className="flex-1 py-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl flex justify-center items-center transition-all border border-red-200 disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : <><XCircle size={18} className="mr-2" /> Decline Request</>}
              </button>
              <button 
                onClick={() => handleApproveAPI(selectedApp.id, selectedApp.companyName)}
                disabled={isProcessing}
                className="flex-1 py-4 bg-[#064e3b] hover:bg-[#047857] text-white font-bold rounded-xl flex justify-center items-center transition-all shadow-lg shadow-emerald-900/30 disabled:opacity-50"
              >
                {isProcessing ? "Sending Payment Link..." : <><CheckCircle size={18} className="mr-2 text-amber-400" /> Approve & Send Payment Link</>}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}