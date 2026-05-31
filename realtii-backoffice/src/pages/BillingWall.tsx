// src/pages/BillingWall.tsx
import React, { useState } from 'react';
import { 
  Check, ShieldCheck, Zap, Server, Building2, Search, 
  FileText, AlertTriangle, UploadCloud, Building, CheckCircle2, X 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/Logo.png';  

type BillingCycle = 'monthly' | 'quarterly' | 'yearly';
type FormStep = 'pricing' | 'basic-info' | 'compliance' | 'success';

export const BillingWall: React.FC = () => {
  const navigate = useNavigate();
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<FormStep>('pricing');
  
  // KYC Form State
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    phone: '',
    cacNumber: '', 
    companyAddress: '',
  });

  // State to hold the actual uploaded files
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const cycleMultiplier = { monthly: 1, quarterly: 3 * 0.9, yearly: 12 * 0.8 };

  const pricingTiers = [
    {
      id: 'STARTER', name: 'Sandbox', basePrice: 0,
      description: 'Test the endpoints in a safe, simulated environment.',
      icon: <Server className="text-slate-400 mb-4" size={32} />,
      features: ['100 Simulated Calls / month', 'Mock Data Only (No Live DB Access)', 'Community Support'],
      buttonText: 'Create Sandbox Account',
    },
    {
      id: 'PROFESSIONAL', name: 'Professional', basePrice: 50000,
      description: 'Live API access for real estate firms and startups.',
      icon: <Zap className="text-blue-400 mb-4" size={32} />,
      features: ['10,000 Live Calls / month', 'Live Production Keys', 'Email Support', '99.9% Uptime SLA'],
      buttonText: 'Apply for Professional', popular: true,
    },
    {
      id: 'ENTERPRISE', name: 'Enterprise', basePrice: 200000,
      description: 'Unlimited access for commercial banks and institutions.',
      icon: <Building2 className="text-emerald-400 mb-4" size={32} />,
      features: ['Unlimited API Calls', 'Dedicated Account Manager', 'Custom Webhooks', 'Priority SLA'],
      buttonText: 'Apply for Enterprise',
    }
  ];

  const handlePlanClick = (plan: any) => {
    setSelectedPlan(plan);
    setCurrentStep('basic-info');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- REAL FILE UPLOAD HANDLERS ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setUploadedFiles((prevFiles) => [...prevFiles, ...filesArray]);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
  };

// --- REAL BACKEND POST REQUEST ---
  // --- REAL BACKEND POST REQUEST (WITH FILES) ---
  const submitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlan?.id === 'STARTER') return navigate('/developer-portal');

    try {
      // 1. Pack the data into a FormData object
      const submitData = new FormData();
      submitData.append('companyName', formData.companyName);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('cacNumber', formData.cacNumber);
      submitData.append('tier', selectedPlan?.name || 'Unknown');
      
      // 2. Loop through uploadedFiles state and attach every single file!
      uploadedFiles.forEach(file => {
        submitData.append('documents', file); 
      });

      // 3. Send it! (Notice we DO NOT set Content-Type. The browser does it automatically for files)
      const response = await fetch('http://127.0.0.1:3000/api/v1/billing/apply', {
        method: 'POST',
        body: submitData
      });

      if (!response.ok) throw new Error("Backend Rejected it");
      setCurrentStep('success');
      
    } catch (error) {
      alert("Error sending files to server.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] py-12 px-6 font-sans text-white">
      
      {/* --- HEADER & LOGO --- */}
      <div className="max-w-6xl mx-auto mb-12 flex justify-between items-center">
        <div className="flex items-center space-x-3">
           <img src={logo} alt="Realtii Logo" className="h-10"/>
          <span className="text-2xl font-extrabold tracking-tight">Realtii<span className="text-blue-500">API</span></span>
        </div>
        <div className="text-sm text-slate-500 flex items-center bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800">
          <ShieldCheck size={16} className="mr-1.5 text-emerald-500" />
          Ekiti State Government Verified Gateway
        </div>
      </div>

      {/* ==========================================
          STEP 1: PRICING SCREEN
      ========================================== */}
      {currentStep === 'pricing' && (
        <div className="max-w-6xl mx-auto animate-in fade-in zoom-in-95 duration-300">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Integrate Land Data into Your App.</h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12">
              One powerful API. Instant access to real-time property verification, ownership records, and encumbrance checks.
            </p>
          </div>

          <div className="flex justify-center mb-12">
            <div className="bg-slate-800 p-1.5 rounded-2xl inline-flex shadow-xl border border-slate-700">
              {(['monthly', 'quarterly', 'yearly'] as BillingCycle[]).map((c) => (
                <button key={c} onClick={() => setCycle(c)}
                  className={`px-8 py-3 rounded-xl text-sm font-bold capitalize transition-all ${
                    cycle === c ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {c} {c === 'quarterly' && <span className="text-emerald-400 ml-1">-10%</span>}
                  {c === 'yearly' && <span className="text-emerald-400 ml-1">-20%</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier) => {
              const currentPrice = tier.basePrice * cycleMultiplier[cycle];
              return (
                <div key={tier.id} className={`relative bg-slate-800 rounded-3xl p-8 border ${tier.popular ? 'border-blue-500 shadow-2xl shadow-blue-900/20' : 'border-slate-700 flex flex-col'}`}>
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold uppercase py-1 px-4 rounded-full">Most Popular</div>
                  )}
                  {tier.icon}
                  <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                  <p className="text-slate-400 text-sm mb-6 h-10">{tier.description}</p>
                  
                  <div className="mb-8">
                    <span className="text-4xl font-extrabold">₦{currentPrice.toLocaleString()}</span>
                    {tier.basePrice > 0 && <span className="text-slate-500 font-medium"> / {cycle === 'monthly' ? 'mo' : cycle === 'quarterly' ? '3 mos' : 'yr'}</span>}
                  </div>

                  <ul className="space-y-4 mb-8 flex-1 text-sm text-slate-300">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Check size={18} className={`mr-3 shrink-0 ${tier.popular ? 'text-blue-400' : 'text-emerald-400'}`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button onClick={() => handlePlanClick(tier)}
                    className={`w-full py-4 rounded-xl font-bold transition-all mt-auto ${
                      tier.popular ? 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/50' : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    {tier.buttonText}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==========================================
          STEP 2: BASIC INFO FORM
      ========================================== */}
      {currentStep === 'basic-info' && (
        <div className="max-w-md mx-auto animate-in slide-in-from-right-8 duration-300">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center space-x-2 text-blue-400 mb-6 text-sm font-bold">
              <span className="bg-blue-600/20 px-2 py-1 rounded">Step 1 of 2</span>
              <span>Account Details</span>
            </div>
            
            <h2 className="text-2xl font-bold mb-2">Create your account</h2>
            <p className="text-slate-400 text-sm mb-8">Register your details for the {selectedPlan.name} plan.</p>
            
            <form onSubmit={(e) => { e.preventDefault(); setCurrentStep('compliance'); }}>
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Admin Email</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white mt-1 outline-none focus:border-blue-500 transition-colors" placeholder="cto@company.com" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                  <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white mt-1 outline-none focus:border-blue-500 transition-colors" placeholder="+234 800 000 0000" />
                </div>
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl mt-8 shadow-lg transition-all">
                Continue to Verification
              </button>
              <button type="button" onClick={() => setCurrentStep('pricing')} className="w-full mt-4 text-slate-400 hover:text-white text-sm font-medium transition-colors">
                Back to Pricing
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          STEP 3: KYB COMPLIANCE (CAC)
      ========================================== */}
      {currentStep === 'compliance' && (
        <div className="max-w-md mx-auto animate-in slide-in-from-right-8 duration-300">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center space-x-2 text-emerald-400 mb-6 text-sm font-bold">
              <span className="bg-emerald-600/20 px-2 py-1 rounded">Step 2 of 2</span>
              <span>KYB Verification</span>
            </div>
            
            <h2 className="text-2xl font-bold mb-2">Verify your Business</h2>
            <p className="text-slate-400 text-sm mb-8">Government API access requires standard compliance.</p>
            
            <form onSubmit={submitApplication}>
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Registered Company Name</label>
                  <input required type="text" name="companyName" value={formData.companyName} onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white mt-1 outline-none focus:border-emerald-500 transition-colors" placeholder="e.g. Zenith Bank PLC" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">CAC RC Number</label>
                  <input required type="text" name="cacNumber" value={formData.cacNumber} onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white mt-1 outline-none focus:border-emerald-500 transition-colors" placeholder="RC-123456" />
                </div>
                
                {/* --- REAL MULTI-FILE UPLOAD SYSTEM --- */}
                <div className="mt-6">
                   <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Corporate Documents (CAC, TIN, ID)</label>
                   
                   <label className="border-2 border-dashed border-slate-700 hover:border-slate-500 hover:bg-slate-800/50 bg-slate-900/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all group">
                     <UploadCloud className="text-slate-400 group-hover:text-blue-400 mb-2 transition-colors" size={24} />
                     <span className="text-sm font-medium text-slate-300 text-center">Click to browse or drag documents here</span>
                     <span className="text-xs text-slate-500 mt-1">Upload PDFs or JPGs</span>
                     
                     {/* The hidden actual HTML input */}
                     <input 
                        type="file" 
                        multiple 
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden" 
                        onChange={handleFileUpload} 
                     />
                   </label>
                </div>

                {/* --- DISPLAY SELECTED FILES --- */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-slate-900/80 border border-slate-700 p-3 rounded-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center space-x-3 overflow-hidden">
                          <FileText className="text-blue-400 shrink-0" size={16} />
                          <div className="flex flex-col truncate">
                            <span className="text-sm font-medium text-slate-300 truncate">{file.name}</span>
                            <span className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeFile(index)} 
                          className="text-slate-500 hover:text-red-400 p-2 hover:bg-red-400/10 rounded-md transition-all shrink-0"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-slate-900/80 border border-amber-900/50 p-4 rounded-xl mt-8 flex items-start space-x-3">
                <ShieldCheck className="text-amber-500 shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-slate-400 leading-relaxed">
                  By submitting this application, you authorize the Ekiti State Ministry of Lands to verify these details with the Corporate Affairs Commission.
                </p>
              </div>

              <button 
                type="submit" 
                disabled={uploadedFiles.length === 0 && selectedPlan.id !== 'STARTER'}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl mt-6 shadow-lg transition-all"
              >
                Submit Application for Review
              </button>
              <button type="button" onClick={() => setCurrentStep('basic-info')} className="w-full mt-4 text-slate-400 hover:text-white text-sm font-medium transition-colors">
                Back
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          STEP 4: SUCCESS / PENDING SCREEN
      ========================================== */}
      {currentStep === 'success' && (
        <div className="max-w-lg mx-auto animate-in zoom-in-95 duration-500 text-center">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-12 shadow-2xl">
            <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="text-emerald-500" size={48} />
            </div>
            <h2 className="text-3xl font-extrabold mb-4">Application Submitted!</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Thank you, <strong className="text-white">{formData.companyName || 'Partner'}</strong>. Your application for the <strong>{selectedPlan?.name}</strong> API Tier is currently under review by our compliance team.
            </p>
            
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 text-left mb-8">
              <h4 className="font-bold text-sm text-white mb-2 uppercase tracking-wide flex items-center">
                <Building size={16} className="mr-2 text-blue-400" /> What happens next?
              </h4>
              <ul className="text-sm text-slate-400 space-y-4">
                <li className="flex items-start">
                  <Check size={16} className="text-emerald-500 mr-3 shrink-0 mt-0.5" /> 
                  <span>We verify your submitted documents.</span>
                </li>
                <li className="flex items-start">
                  <Check size={16} className="text-emerald-500 mr-3 shrink-0 mt-0.5" /> 
                  <span>
                    Upon approval (usually 24 hours), we will email a secure link to <strong className="text-white break-all ml-1">{formData.email || 'your email'}</strong>.
                  </span>
                </li>
                <li className="flex items-start">
                  <Check size={16} className="text-emerald-500 mr-3 shrink-0 mt-0.5" /> 
                  <span>Once verified and active, your API keys will become available.</span>
                </li>
              </ul>
            </div>

            <button onClick={() => navigate('/')} className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
              Return to Realtii Homepage
            </button>
          </div>
        </div>
      )}

    </div>
  );
};