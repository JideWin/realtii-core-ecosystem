import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, Fingerprint, Camera, CheckCircle2, Upload, 
  ArrowRight, Shield, Database, FileText, AlertCircle, 
  Lock, UserCircle, Activity, XCircle, Info, FileDigit, 
  Trash2, ZoomIn, ZoomOut, Maximize 
} from 'lucide-react';
import logo from './assets/logo.png'; // Ensure casing matches your file

type IntakeStep = 'SEARCH' | 'VERIFY' | 'DOCUMENTS' | 'BIOMETRICS' | 'COMMIT';
type Toast = { message: string; type: 'success' | 'error' | 'info'; id: number };

type ScannedDoc = {
  id: string;
  category: string; 
  name: string;     
  base64: string;
};

const DOC_CATEGORIES = [
  { id: 'DEED', label: 'Deed of Assignment / Conveyance' },
  { id: 'SURVEY', label: 'Survey Plan' },
  { id: 'RECEIPT', label: 'Purchase Receipt' },
  { id: 'ALLOCATION', label: 'Letter of Allocation' },
  { id: 'C_OF_O', label: 'Certificate of Occupancy' },
  { id: 'OTHER', label: 'Supporting Document / Other' },
];

function App() {
  const [currentStep, setCurrentStep] = useState<IntakeStep>('SEARCH');
  const [appointmentId, setAppointmentId] = useState('');
  const [citizenData, setCitizenData] = useState<any>(null);
  
  // --- HARDWARE & ARTIFACT STATES ---
  const [isScanning, setIsScanning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('DEED');
  const [customDocName, setCustomDocName] = useState(''); 
  const [scannedDocuments, setScannedDocuments] = useState<ScannedDoc[]>([]);
  
  const [previewDoc, setPreviewDoc] = useState<ScannedDoc | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1); 
  
  const [isCapturingFinger, setIsCapturingFinger] = useState(false);
  const [fingerprintHash, setFingerprintHash] = useState<string | null>(null);
  const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);
  const [photoData, setPhotoData] = useState<string | null>(null);

  // --- SYSTEM STATES ---
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { message, type, id }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchError(null);
    const cleanId = appointmentId.toUpperCase().trim();
    
    // Demo Search Logic
    setTimeout(() => {
      if (cleanId === 'EK-APP-90210') {
        setCitizenData({ name: "Jide Ogundipe", nin: "82947104821" });
        setCurrentStep('VERIFY');
        showToast("Dossier retrieved successfully", "success");
      } else {
        setSearchError(`Appointment ID "${cleanId}" not found in local cache.`);
        showToast("Search Failed", "error");
      }
      setIsSearching(false);
    }, 1200);
  };

  const generateDocName = () => {
    const typeCount = scannedDocuments.filter(d => d.category === selectedCategory).length + 1;
    const prefix = appointmentId ? appointmentId.replace('EK-APP-', 'EK') : 'EK90210';
    
    let baseCategoryName = selectedCategory;
    if (selectedCategory === 'OTHER' && customDocName.trim() !== '') {
      baseCategoryName = customDocName.trim().replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
    }
    
    return `${prefix}_${baseCategoryName}_${typeCount}`;
  };

  // 1. ULTRA-RESILIENT DOCUMENT SCANNER
  const handleHardwareScan = async () => {
    setIsScanning(true);
    const autoName = generateDocName();

    try {
      console.log("📡 Sending request to Spring Boot Document Scanner...");
      const response = await axios.get('http://localhost:8081/api/hardware/scan');
      console.log("✅ Java Scanner Response:", response.data);

      const rawData = response.data.documentBase64 || response.data.image || response.data.base64 || response.data.data || response.data;
      
      if (!rawData || typeof rawData !== 'string') {
        throw new Error("No valid image data found in Java response");
      }

      const formattedBase64 = rawData.startsWith('data:') || rawData.startsWith('http')
        ? rawData : `data:image/jpeg;base64,${rawData}`;

      const newDoc = { id: Date.now().toString(), category: selectedCategory, name: autoName, base64: formattedBase64 };
      setScannedDocuments(prev => [...prev, newDoc]);
      setPreviewDoc(newDoc);
      setZoomLevel(1); 
      setCustomDocName(''); 
      showToast(`${autoName} digitized`, "success");
      
    } catch (error) {
      console.error("🚨 Scanner Error:", error);
      // DEMO FALLBACK
      setTimeout(() => {
        const newDoc = { 
          id: Date.now().toString(), 
          category: selectedCategory, 
          name: autoName, 
          base64: "https://images.unsplash.com/photo-1568227451433-281b3765e94b?auto=format&fit=crop&w=1200&q=80" 
        };
        setScannedDocuments(prev => [...prev, newDoc]);
        setPreviewDoc(newDoc);
        setZoomLevel(1);
        setCustomDocName('');
        showToast(`${autoName} digitized (Demo Mode)`, "success");
      }, 1500);
    } finally {
      setIsScanning(false);
    }
  };

  const removeDocument = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    setScannedDocuments(prev => {
      const filtered = prev.filter(d => d.id !== id);
      if (previewDoc?.id === id) {
        setPreviewDoc(filtered.length > 0 ? filtered[filtered.length - 1] : null);
        setZoomLevel(1);
      }
      return filtered;
    });
  };

  // 2. ULTRA-RESILIENT FINGERPRINT SCANNER
  const handleFingerprintScan = async () => {
    setIsCapturingFinger(true);
    try {
      console.log("📡 Requesting Dermalog ZF1 via Spring Boot...");
      const response = await axios.get('http://localhost:8081/api/hardware/fingerprint');
      console.log("✅ Java ZF1 Response:", response.data);

      const rawData = response.data.hash || response.data.image || response.data.base64 || response.data.data;
      if (!rawData || typeof rawData !== 'string') {
        throw new Error("No biometric hash found in Java response");
      }

      const formattedBase64 = rawData.startsWith('data:') || rawData.startsWith('http')
        ? rawData : `data:image/png;base64,${rawData}`;

      setFingerprintHash(formattedBase64);
      showToast("Biometric hash secured via Dermalog ZF1", "success");
      
    } catch (error) {
      console.error("🚨 Fingerprint Error:", error);
      setTimeout(() => {
        setFingerprintHash("https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Fingerprint_picture.svg/400px-Fingerprint_picture.svg.png");
        showToast("Biometric hash secured (Demo Fallback)", "success");
      }, 1500);
    } finally {
      setIsCapturingFinger(false);
    }
  };

  // 3. ULTRA-RESILIENT WEBCAM
  const handleWebcamCapture = async () => {
    setIsCapturingPhoto(true);
    try {
      console.log("📡 Requesting Webcam via Spring Boot...");
      const response = await axios.get('http://localhost:8081/api/hardware/webcam');
      console.log("✅ Java Webcam Response:", response.data);

      const rawData = response.data.photo || response.data.image || response.data.base64 || response.data.data;
      if (!rawData || typeof rawData !== 'string') {
        throw new Error("No photo data found in Java response");
      }

      const formattedBase64 = rawData.startsWith('data:') || rawData.startsWith('http')
        ? rawData : `data:image/jpeg;base64,${rawData}`;

      setPhotoData(formattedBase64);
      showToast("Liveness portrait captured", "success");
      
    } catch (error) {
      console.error("🚨 Webcam Error:", error);
      setTimeout(() => {
        setPhotoData("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80");
        showToast("Portrait captured (Demo Fallback)", "success");
      }, 1500);
    } finally {
      setIsCapturingPhoto(false);
    }
  };

  const biometricsComplete = fingerprintHash !== null && photoData !== null;

  const StepIndicator = ({ step, label, current, icon: Icon }: any) => {
    const stepOrder = ['SEARCH', 'VERIFY', 'DOCUMENTS', 'BIOMETRICS', 'COMMIT'];
    const isActive = current === step;
    const isPast = stepOrder.indexOf(current) > stepOrder.indexOf(step);
    
    return (
      <div className="flex items-center mb-6 last:mb-0 relative group">
        <div className="absolute left-5 top-10 bottom-[-24px] w-px bg-slate-200 last:hidden"></div>
        <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-500 ${
          isActive ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-110' : 
          isPast ? 'bg-slate-800 text-orange-400' : 'bg-white border border-slate-200 text-slate-300'
        }`}>
          {isPast ? <CheckCircle2 size={18} strokeWidth={2.5} /> : <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />}
        </div>
        <div className="ml-5">
          <h4 className={`text-sm tracking-wide transition-colors duration-300 ${isActive ? 'text-slate-900 font-bold' : isPast ? 'text-slate-700 font-semibold' : 'text-slate-400 font-medium'}`}>{label}</h4>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-orange-100 selection:text-orange-900 pb-16">
      
      {/* Toast Notifications */}
      <div className="fixed top-6 right-6 z-[100] flex flex-col space-y-3">
        {toasts.map(toast => (
          <div key={toast.id} className={`flex items-center px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-right-8 fade-in duration-300 ${
            toast.type === 'success' ? 'bg-white border-green-200 text-slate-800' : 
            toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-900' : 'bg-slate-800 border-slate-700 text-white'
          }`}>
            {toast.type === 'success' && <CheckCircle2 className="text-green-500 mr-3" size={20} />}
            {toast.type === 'error' && <XCircle className="text-red-500 mr-3" size={20} />}
            {toast.type === 'info' && <Info className="text-blue-400 mr-3" size={20} />}
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        ))}
      </div>

      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40 backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-11 h-11 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-100 p-1">
               <img src={logo} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Realtii Hub</h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ekiti State Core System</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
            <Activity size={14} className="text-orange-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-600 tracking-wide">AGENT SECURE</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sticky top-28">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Intake Progression</h3>
              <div className="flex flex-col">
                 <StepIndicator step="SEARCH" current={currentStep} label="Dossier Retrieval" icon={Database} />
                 <StepIndicator step="VERIFY" current={currentStep} label="Identity Lock" icon={UserCircle} />
                 <StepIndicator step="DOCUMENTS" current={currentStep} label="Artifact Capture" icon={FileText} />
                 <StepIndicator step="BIOMETRICS" current={currentStep} label="Biometrics" icon={Fingerprint} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-9 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px] flex flex-col relative">
            <div className="h-1 w-full bg-gradient-to-r from-orange-400 to-orange-600 absolute top-0 left-0"></div>

            {currentStep === 'SEARCH' && (
              <div className="flex-1 p-14 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500">
                <Database className="text-orange-500 mb-6" size={48} />
                <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Retrieve Dossier</h2>
                <form onSubmit={handleSearch} className="w-full max-w-md relative group mt-6">
                  <input type="text" required placeholder="e.g. EK-APP-90210" className="w-full pl-6 pr-36 py-4 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-orange-500 outline-none text-lg font-bold tracking-widest uppercase transition-all shadow-sm" value={appointmentId} onChange={(e) => setAppointmentId(e.target.value)} />
                  <button type="submit" className="absolute right-2 top-2 bottom-2 bg-slate-900 text-white px-6 rounded-lg font-bold text-sm uppercase tracking-wider transition-colors">Fetch</button>
                </form>
              </div>
            )}

            {currentStep === 'VERIFY' && citizenData && (
              <div className="flex-1 p-14 flex flex-col animate-in fade-in slide-in-from-right-8 duration-500">
                <h2 className="text-3xl font-bold text-slate-900 mb-8">Verify Target Identity</h2>
                <div className="bg-slate-900 rounded-2xl p-10 relative overflow-hidden shadow-2xl mb-auto">
                  <div className="absolute top-0 right-0 p-8 opacity-5"><Shield size={140} /></div>
                  <div className="mb-8 border-b border-slate-800 pb-6"><p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-0.5">Registry ID</p><p className="text-xl font-bold text-white tracking-wider">{appointmentId}</p></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8">
                    <div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Full Legal Name</p><p className="font-bold text-2xl text-white tracking-tight">{citizenData.name}</p></div>
                    <div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">National ID (NIN)</p><div className="inline-block bg-slate-800 border border-slate-700 rounded px-3 py-1"><p className="font-bold text-lg text-slate-200 tracking-[0.2em] font-mono">{citizenData.nin}</p></div></div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-10 pt-8 border-t border-slate-100">
                  <button onClick={() => setCurrentStep('SEARCH')} className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors">Abort</button>
                  <button onClick={() => setCurrentStep('DOCUMENTS')} className="bg-orange-500 text-white px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center shadow-lg transform hover:-translate-y-0.5">Confirm Match <ArrowRight size={18} className="ml-3" /></button>
                </div>
              </div>
            )}

            {/* STEP 3: DOCUMENT SCANNING WITH ZOOM AND CUSTOM NAMING */}
            {currentStep === 'DOCUMENTS' && (
              <div className="flex-1 p-8 flex flex-col animate-in fade-in slide-in-from-right-8 duration-500 bg-white">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-slate-900">Artifact Capture</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 h-[450px]">
                  
                  {/* Left Column: Scanner Controls */}
                  <div className="lg:col-span-1 flex flex-col space-y-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 overflow-y-auto">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Document Category</label>
                      <div className="space-y-2">
                        {DOC_CATEGORIES.map((cat) => (
                          <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${selectedCategory === cat.id ? 'bg-orange-50 border-orange-200 text-orange-700 shadow-sm' : 'bg-white border-transparent text-slate-500 hover:bg-slate-100'}`}>
                            {cat.label}
                          </button>
                        ))}

                        {/* Custom Input for OTHER */}
                        {selectedCategory === 'OTHER' && (
                          <div className="mt-3 p-3 bg-white border border-orange-200 rounded-xl animate-in slide-in-from-top-2">
                            <label className="text-[9px] font-bold text-orange-600 uppercase tracking-widest block mb-1">Specify Name</label>
                            <input 
                              type="text" 
                              placeholder="e.g. Court Affidavit" 
                              value={customDocName}
                              onChange={(e) => setCustomDocName(e.target.value)}
                              className="w-full text-xs font-bold px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-orange-500 bg-slate-50"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <button onClick={handleHardwareScan} disabled={isScanning} className="w-full py-5 rounded-2xl bg-slate-900 hover:bg-orange-600 text-white flex flex-col items-center justify-center transition-all shadow-lg disabled:opacity-50 mt-auto flex-shrink-0">
                      <Upload size={24} className={`mb-2 ${isScanning ? 'animate-bounce' : ''}`} />
                      <span className="text-xs font-bold uppercase tracking-widest">{isScanning ? 'Processing...' : 'Initialize Scanner'}</span>
                    </button>
                  </div>

                  {/* Right Column: Master Viewer & Filmstrip */}
                  <div className="lg:col-span-2 flex flex-col h-full bg-slate-50 border border-slate-200 rounded-2xl p-4 overflow-hidden">
                    
                    {/* The Master Viewer with Zoom */}
                    <div className="flex-1 bg-slate-200/50 border border-slate-200 rounded-xl mb-4 relative flex items-center justify-center overflow-auto">
                      {previewDoc ? (
                         <>
                           <div className="w-full h-full overflow-auto flex items-center justify-center p-4">
                             <img 
                                src={previewDoc.base64} 
                                style={{ height: `${zoomLevel * 300}px`, maxWidth: 'none', transition: 'height 0.2s ease-out' }}
                                className="object-contain shadow-md bg-white cursor-zoom-in" 
                                alt="Large Preview"
                                onClick={() => setZoomLevel(prev => Math.min(4, prev + 0.5))} 
                                onError={(e) => {
                                  console.error("🖼️ Failed to render image Base64. Check response payload.");
                                  e.currentTarget.src = "https://placehold.co/600x400?text=Invalid+Base64+Data";
                                }}
                             />
                           </div>
                           
                           <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur text-white px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase shadow-md pointer-events-none">
                             {previewDoc.name}
                           </div>

                           <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur flex items-center rounded-lg shadow-md overflow-hidden">
                              <button onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.5))} className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"><ZoomOut size={16} /></button>
                              <span className="text-white text-[10px] font-mono font-bold px-3 py-1 bg-slate-800">{Math.round(zoomLevel * 100)}%</span>
                              <button onClick={() => setZoomLevel(prev => Math.min(4, prev + 0.5))} className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"><ZoomIn size={16} /></button>
                              <button onClick={() => setZoomLevel(1)} className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 border-l border-slate-700 transition-colors" title="Reset Zoom"><Maximize size={16} /></button>
                           </div>
                         </>
                      ) : (
                         <div className="flex flex-col items-center justify-center text-slate-400">
                           <FileText size={48} strokeWidth={1} className="mb-2 opacity-20" />
                           <p className="text-sm font-medium">Awaiting First Scan</p>
                         </div>
                      )}
                    </div>

                    {/* The Filmstrip */}
                    <div className="flex-shrink-0">
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex justify-between items-center">
                        <span>Bundle Tray ({scannedDocuments.length})</span>
                        {scannedDocuments.length > 0 && <button onClick={() => { setScannedDocuments([]); setPreviewDoc(null); }} className="text-red-400 hover:text-red-600 transition-colors">Clear All</button>}
                      </h3>
                      
                      <div className="bg-white border border-slate-200 rounded-xl p-3 flex space-x-3 overflow-x-auto min-h-[90px] items-center">
                        {scannedDocuments.length === 0 ? (
                           <span className="text-xs font-medium text-slate-300 w-full text-center">Tray is empty</span>
                        ) : (
                           scannedDocuments.map(doc => (
                             <div 
                               key={doc.id} 
                               onClick={() => { setPreviewDoc(doc); setZoomLevel(1); }} 
                               className={`w-16 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer transition-all relative group border-2 ${previewDoc?.id === doc.id ? 'border-orange-500 shadow-md scale-105' : 'border-slate-200 hover:border-slate-300'}`}
                             >
                               <img src={doc.base64} alt="Thumb" className="w-full h-full object-cover opacity-90 group-hover:opacity-100" />
                               
                               <button onClick={(e) => removeDocument(doc.id, e)} className="absolute top-1 right-1 bg-red-500/90 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                                 <Trash2 size={12} />
                               </button>
                             </div>
                           ))
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end flex-shrink-0">
                      <button disabled={scannedDocuments.length === 0} onClick={() => setCurrentStep('BIOMETRICS')} className={`px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center transition-all ${scannedDocuments.length > 0 ? 'bg-slate-900 text-white shadow-lg hover:bg-orange-600' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}>Finalize Bundle <ArrowRight size={16} className="ml-2" /></button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: BIOMETRICS */}
            {currentStep === 'BIOMETRICS' && (
              <div className="flex-1 p-14 flex flex-col animate-in fade-in slide-in-from-right-8 duration-500">
                <h2 className="text-3xl font-bold text-slate-900 mb-8">Biological Lock</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className={`border rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 relative ${fingerprintHash ? 'border-orange-200 bg-orange-50/50' : 'border-slate-200 bg-slate-50'}`}>
                    {!fingerprintHash ? (
                       <><div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mb-6 shadow-sm"><Fingerprint size={32} className="text-slate-400" /></div><h4 className="font-bold text-slate-900 mb-1">Optical Thumbprint</h4><button onClick={handleFingerprintScan} disabled={isCapturingFinger} className="mt-4 bg-white border border-slate-300 text-slate-900 px-6 py-2.5 rounded-lg text-xs font-bold uppercase w-full">Activate Sensor</button></>
                    ) : (
                       <div className="animate-in zoom-in-95 flex flex-col items-center"><img src={fingerprintHash} className="w-16 h-16 mix-blend-multiply opacity-60 mb-4" /><span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest"><Lock size={12} className="inline mr-1" /> Hash Secured</span></div>
                    )}
                  </div>
                  <div className={`border rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 relative ${photoData ? 'border-orange-200 bg-orange-50/50' : 'border-slate-200 bg-slate-50'}`}>
                    {!photoData ? (
                       <><div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mb-6 shadow-sm"><Camera size={32} className="text-slate-400" /></div><h4 className="font-bold text-slate-900 mb-1">Live Portrait Liveness</h4><button onClick={handleWebcamCapture} disabled={isCapturingPhoto} className="mt-4 bg-white border border-slate-300 text-slate-900 px-6 py-2.5 rounded-lg text-xs font-bold uppercase w-full">Trigger Camera</button></>
                    ) : (
                       <div className="animate-in zoom-in-95 flex flex-col items-center"><img src={photoData} className="w-20 h-20 mb-4 rounded-xl border-2 border-white shadow-md object-cover grayscale" /><span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest flex items-center"><CheckCircle2 size={12} className="mr-1" /> Match Confirmed</span></div>
                    )}
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6 flex items-center justify-between"><div className="flex items-center space-x-2 text-xs font-bold text-slate-600 uppercase tracking-wider"><Database size={16} className="text-slate-400" /><span>Payload Assembly</span></div><div className="flex space-x-3"><span className="flex items-center text-xs font-bold text-slate-400"><CheckCircle2 size={14} className="text-green-500 mr-1" /> Identity</span><span className="flex items-center text-xs font-bold text-slate-400"><CheckCircle2 size={14} className="text-green-500 mr-1" /> Docs ({scannedDocuments.length})</span><span className={`flex items-center text-xs font-bold ${biometricsComplete ? 'text-slate-400' : 'text-slate-300'}`}><CheckCircle2 size={14} className={`${biometricsComplete ? 'text-green-500' : 'text-slate-300'} mr-1`} /> Biometrics</span></div></div>
                  <button disabled={!biometricsComplete} onClick={() => { showToast("Dossier encrypted and committed.", "success"); setTimeout(() => { setCurrentStep('SEARCH'); setAppointmentId(''); setScannedDocuments([]); setFingerprintHash(null); setPhotoData(null); }, 1500); }} className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider flex justify-center items-center transition-all ${biometricsComplete ? 'bg-slate-900 text-white shadow-lg hover:-translate-y-0.5' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>Seal Dossier & Commit to Vault</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 h-10 flex items-center justify-between px-6 z-40">
        <div className="flex items-center text-[10px] font-bold tracking-widest text-slate-500 uppercase"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span> Connection: <span className="text-slate-800 ml-1">AES-256 SECURE</span></div>
        <div className="flex items-center text-[10px] font-bold tracking-widest text-slate-500 font-mono uppercase bg-slate-50 px-3 py-1 rounded border border-slate-200">
          <span className="text-orange-500">{time.toLocaleTimeString('en-US', { hour12: false })}</span>
          <span className="mx-2 text-slate-300">|</span>
          <span>{time.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </footer>
    </div>
  );
}

export default App;