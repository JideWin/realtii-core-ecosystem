import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Fingerprint, Camera, CheckCircle2, Upload, ArrowRight, Shield, Database, FileText, AlertCircle, Lock, UserCircle, Activity, XCircle, Info, FileDigit } from 'lucide-react';
import logo from './assets/logo.png';

type IntakeStep = 'SEARCH' | 'VERIFY' | 'DOCUMENTS' | 'BIOMETRICS' | 'COMMIT';
type Toast = { message: string; type: 'success' | 'error' | 'info'; id: number };

function App() {
  const [currentStep, setCurrentStep] = useState<IntakeStep>('SEARCH');
  const [appointmentId, setAppointmentId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [citizenData, setCitizenData] = useState<any>(null);

  // Hardware States
  const [isScanning, setIsScanning] = useState(false);
  const [scannedDocumentPreview, setScannedDocumentPreview] = useState<string | null>(null);
  const [isCapturingFinger, setIsCapturingFinger] = useState(false);
  const [fingerprintHash, setFingerprintHash] = useState<string | null>(null);
  const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);
  const [photoData, setPhotoData] = useState<string | null>(null);

  // Modern Features: Toasts & Live Time
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { message, type, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000); // Auto-dismiss after 4 seconds
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchError(null);
    const cleanId = appointmentId.toUpperCase().trim();
    
    try {
      const response = await axios.get(`http://localhost:8081/api/reception/fetch/${cleanId}`);
      if (response.data.status === 'success') {
        setCitizenData(response.data.data);
        setCurrentStep('VERIFY');
        showToast("Dossier retrieved successfully", "success");
      }
    } catch (error: any) {
      if (error.response?.status === 404) setSearchError(`Appointment ID "${cleanId}" could not be found.`);
      else setSearchError("Connection Error: Unable to reach the secure vault.");
      showToast("Data retrieval failed", "error");
    } finally {
      setIsSearching(false);
    }
  };

  const handleHardwareScan = async () => {
    setIsScanning(true);
    try {
      const response = await axios.get('http://localhost:8081/api/hardware/scan');
      if (response.data.status === 'success') {
        setScannedDocumentPreview(response.data.documentBase64);
        showToast("Document digitized securely", "success");
      }
    } catch (error) {
      showToast("Scanner hardware disconnected", "error");
    } finally {
      setIsScanning(false);
    }
  };

  const handleFingerprintScan = async () => {
    setIsCapturingFinger(true);
    try {
      const response = await axios.get('http://localhost:8081/api/hardware/fingerprint');
      if (response.data.status === 'success') {
        setFingerprintHash(response.data.hash);
        showToast("Biometric hash secured", "success");
      }
    } catch (error) {
      showToast("Fingerprint sensor offline", "error");
    } finally {
      setIsCapturingFinger(false);
    }
  };

  const handleWebcamCapture = async () => {
    setIsCapturingPhoto(true);
    try {
      const response = await axios.get('http://localhost:8081/api/hardware/webcam');
      if (response.data.status === 'success') {
        setPhotoData(response.data.photo);
        showToast("Liveness portrait captured", "success");
      }
    } catch (error) {
      showToast("Secure camera disconnected", "error");
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
        {/* Connecting line */}
        <div className="absolute left-5 top-10 bottom-[-24px] w-px bg-slate-200 last:hidden"></div>
        <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-500 ${
          isActive ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-110' : 
          isPast ? 'bg-slate-800 text-orange-400' : 'bg-white border border-slate-200 text-slate-300'
        }`}>
          {isPast ? <CheckCircle2 size={18} strokeWidth={2.5} /> : <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />}
        </div>
        <div className="ml-5">
          <h4 className={`text-sm tracking-wide transition-colors duration-300 ${isActive ? 'text-slate-900 font-bold' : isPast ? 'text-slate-700 font-semibold' : 'text-slate-400 font-medium'}`}>
            {label}
          </h4>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-orange-100 selection:text-orange-900 pb-16">
      
      {/* Toast Notification Container */}
      <div className="fixed top-6 right-6 z-[100] flex flex-col space-y-3">
        {toasts.map(toast => (
          <div key={toast.id} className={`flex items-center px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-right-8 fade-in duration-300 ${
            toast.type === 'success' ? 'bg-white border-green-200 text-slate-800' : 
            toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-900' : 
            'bg-slate-800 border-slate-700 text-white'
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
               <img src={logo} alt="Realtii Logo" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
               <Shield className="hidden text-orange-500" size={24} />
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
          
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sticky top-28">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Intake Progression</h3>
              <div className="flex flex-col">
                 <StepIndicator step="SEARCH" current={currentStep} label="Dossier Retrieval" icon={Database} />
                 <StepIndicator step="VERIFY" current={currentStep} label="Identity Lock" icon={UserCircle} />
                 <StepIndicator step="DOCUMENTS" current={currentStep} label="Document Scan" icon={FileText} />
                 <StepIndicator step="BIOMETRICS" current={currentStep} label="Biometrics" icon={Fingerprint} />
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px] flex flex-col relative">
            <div className="h-1 w-full bg-gradient-to-r from-orange-400 to-orange-600 absolute top-0 left-0"></div>

            {currentStep === 'SEARCH' && (
              <div className="flex-1 p-14 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center mb-8 border border-orange-100 relative">
                  {isSearching && <div className="absolute inset-0 rounded-2xl border-2 border-orange-500 border-t-transparent animate-spin"></div>}
                  <Database className="text-orange-500" size={32} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Retrieve Dossier</h2>
                <p className="text-slate-500 mb-10 max-w-md leading-relaxed text-sm">
                  Initialize connection with the State Registry to pull the encrypted land registration packet.
                </p>
                
                <form onSubmit={handleSearch} className="w-full max-w-md relative group">
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. EK-APP-90210" 
                    className="w-full pl-6 pr-36 py-4 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-orange-500 outline-none text-lg font-bold tracking-widest uppercase transition-all shadow-sm"
                    value={appointmentId} 
                    onChange={(e) => { setAppointmentId(e.target.value); setSearchError(null); }} 
                  />
                  <button 
                    type="submit" 
                    disabled={isSearching} 
                    className="absolute right-2 top-2 bottom-2 bg-slate-900 hover:bg-orange-600 text-white px-6 rounded-lg font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-70 flex items-center shadow-sm">
                    {isSearching ? 'Syncing...' : 'Fetch'}
                  </button>
                </form>

                {searchError && (
                  <div className="mt-6 flex items-center space-x-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100 animate-in slide-in-from-bottom-2">
                    <AlertCircle size={18} />
                    <span className="text-sm font-semibold">{searchError}</span>
                  </div>
                )}
              </div>
            )}

            {currentStep === 'VERIFY' && citizenData && (
              <div className="flex-1 p-14 flex flex-col animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="mb-10">
                  <h2 className="text-3xl font-bold text-slate-900">Verify Target Identity</h2>
                  <p className="text-slate-500 mt-2 text-sm">Confirm the physical citizen matches the decrypted cloud record.</p>
                </div>
                
                <div className="bg-slate-900 rounded-2xl p-10 relative overflow-hidden shadow-2xl mb-auto group transition-transform hover:-translate-y-1 duration-500">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Shield size={140} />
                  </div>
                  
                  <div className="flex justify-between items-start mb-10 border-b border-slate-800 pb-6 relative z-10">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                        <FileDigit className="text-orange-400" size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-orange-400 tracking-widest uppercase mb-0.5">Registry ID</p>
                        <p className="text-xl font-bold text-white tracking-wider">{appointmentId}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 relative z-10">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Full Legal Name</p>
                      <p className="font-bold text-2xl text-white tracking-tight">{citizenData.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">National ID (NIN)</p>
                      <div className="inline-block bg-slate-800 border border-slate-700 rounded px-3 py-1">
                        <p className="font-bold text-lg text-slate-200 tracking-[0.2em] font-mono">{citizenData.nin}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-10 pt-8 border-t border-slate-100">
                  <button onClick={() => setCurrentStep('SEARCH')} className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors">Abort Execution</button>
                  <button onClick={() => setCurrentStep('DOCUMENTS')} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center transition-all shadow-lg shadow-orange-500/20 transform hover:-translate-y-0.5">
                    Confirm Match <ArrowRight size={18} className="ml-3" />
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'DOCUMENTS' && (
               <div className="flex-1 p-14 flex flex-col animate-in fade-in slide-in-from-right-8 duration-500">
                 <div className="mb-8">
                   <h2 className="text-3xl font-bold text-slate-900">Digitize Artifact</h2>
                   <p className="text-slate-500 mt-2 text-sm">Initialize hardware bridge to capture the physical land survey or deed.</p>
                 </div>
                 
                 {!scannedDocumentPreview ? (
                   <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 p-10 text-center relative overflow-hidden">
                      {isScanning && <div className="absolute top-0 left-0 w-full h-[3px] bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.8)] animate-[scan_1.5s_ease-in-out_infinite]"></div>}
                      
                      <div className={`w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 transition-all duration-300 border border-slate-200 ${isScanning ? 'scale-110 border-orange-300 shadow-orange-100' : ''}`}>
                        <Upload size={32} className={isScanning ? "text-orange-500" : "text-slate-400"} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 mb-2">{isScanning ? 'Hardware Engine Spooling...' : 'Awaiting Tray Loading'}</h3>
                      <p className="text-sm font-medium text-slate-500 max-w-sm mb-8">
                        Ensure physical document is securely gripped by roller mechanics.
                      </p>
                      
                      <button onClick={handleHardwareScan} disabled={isScanning} className="bg-slate-900 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-wider shadow-md transition-all disabled:opacity-70 flex items-center z-10">
                        {isScanning ? 'Awaiting Scan Data...' : 'Trigger Hardware Scanner'}
                      </button>
                   </div>
                 ) : (
                   <div className="flex-1 flex flex-col animate-in zoom-in-95 duration-500">
                      <div className="bg-slate-100 rounded-2xl border border-slate-200 flex-1 flex items-center justify-center overflow-hidden mb-8 p-6 relative shadow-inner">
                         <div className="absolute top-4 left-4 bg-slate-900 border border-slate-800 text-white text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-lg shadow-sm flex items-center">
                           <CheckCircle2 size={14} className="mr-2 text-orange-400" /> Asset Digitized
                         </div>
                         <img src={scannedDocumentPreview} alt="Preview" className="max-h-[380px] shadow-lg border border-slate-200 rounded-lg object-contain bg-white p-2" />
                      </div>
                      <div className="flex justify-between items-center mt-auto">
                        <button onClick={() => setScannedDocumentPreview(null)} className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors">Retake Scan</button>
                        <button onClick={() => setCurrentStep('BIOMETRICS')} className="bg-slate-900 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center transition-all shadow-lg transform hover:-translate-y-0.5">
                          Commit Asset <ArrowRight size={18} className="ml-3" />
                        </button>
                      </div>
                   </div>
                 )}
               </div>
            )}

            {currentStep === 'BIOMETRICS' && (
               <div className="flex-1 p-14 flex flex-col animate-in fade-in slide-in-from-right-8 duration-500">
                 <div className="mb-8">
                   <h2 className="text-3xl font-bold text-slate-900">Biological Lock</h2>
                   <p className="text-slate-500 mt-2 text-sm">Capture live physical signatures to permanently bind the digital dossier.</p>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                   {/* Fingerprint Module */}
                   <div className={`border rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 relative ${fingerprintHash ? 'border-orange-200 bg-orange-50/50' : 'border-slate-200 bg-slate-50'}`}>
                     {!fingerprintHash ? (
                       <>
                          <div className={`w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mb-6 transition-colors shadow-sm ${isCapturingFinger ? 'border-orange-400 animate-pulse' : ''}`}>
                            <Fingerprint size={32} className={isCapturingFinger ? 'text-orange-500' : 'text-slate-400'} />
                          </div>
                          <h4 className="font-bold text-slate-900 mb-1">Optical Thumbprint</h4>
                          <button onClick={handleFingerprintScan} disabled={isCapturingFinger} className="mt-4 bg-white border border-slate-300 hover:border-slate-900 text-slate-900 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest w-full transition-all disabled:opacity-70 shadow-sm">
                            {isCapturingFinger ? 'Polling...' : 'Activate Sensor'}
                          </button>
                       </>
                     ) : (
                       <div className="animate-in zoom-in-95 duration-500 flex flex-col items-center">
                          <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm mb-4">
                            <img src={fingerprintHash} className="w-16 h-16 opacity-80 mix-blend-multiply" alt="Fingerprint" />
                          </div>
                          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest flex items-center"><Lock size={12} className="mr-1" /> Hash Secured</span>
                       </div>
                     )}
                   </div>
                   
                   {/* Camera Module */}
                   <div className={`border rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 relative ${photoData ? 'border-orange-200 bg-orange-50/50' : 'border-slate-200 bg-slate-50'}`}>
                     {!photoData ? (
                       <>
                          <div className={`w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mb-6 transition-colors shadow-sm ${isCapturingPhoto ? 'border-orange-400 animate-pulse' : ''}`}>
                            <Camera size={32} className={isCapturingPhoto ? 'text-orange-500' : 'text-slate-400'} />
                          </div>
                          <h4 className="font-bold text-slate-900 mb-1">Live Portrait Liveness</h4>
                          <button onClick={handleWebcamCapture} disabled={isCapturingPhoto} className="mt-4 bg-white border border-slate-300 hover:border-slate-900 text-slate-900 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest w-full transition-all disabled:opacity-70 shadow-sm">
                             {isCapturingPhoto ? 'Analyzing...' : 'Trigger Camera'}
                          </button>
                       </>
                     ) : (
                       <div className="animate-in zoom-in-95 duration-500 flex flex-col items-center">
                          <img src={photoData} className="w-20 h-20 mb-4 rounded-xl border-2 border-white shadow-md object-cover grayscale" alt="Portrait" />
                          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest flex items-center"><CheckCircle2 size={12} className="mr-1" /> Match Confirmed</span>
                       </div>
                     )}
                   </div>
                 </div>

                 {/* New Feature: Payload Summary */}
                 <div className="mt-auto">
                   <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6 flex items-center justify-between">
                     <div className="flex items-center space-x-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
                       <Database size={16} className="text-slate-400" />
                       <span>Payload Assembly</span>
                     </div>
                     <div className="flex space-x-3">
                       <span className="flex items-center text-xs font-bold text-slate-400"><CheckCircle2 size={14} className="text-green-500 mr-1" /> Identity</span>
                       <span className="flex items-center text-xs font-bold text-slate-400"><CheckCircle2 size={14} className="text-green-500 mr-1" /> Document</span>
                       <span className={`flex items-center text-xs font-bold ${biometricsComplete ? 'text-slate-400' : 'text-slate-300'}`}><CheckCircle2 size={14} className={`${biometricsComplete ? 'text-green-500' : 'text-slate-300'} mr-1`} /> Biometrics</span>
                     </div>
                   </div>

                  <button 
                    disabled={!biometricsComplete}
                    onClick={() => {
                      showToast("Dossier encrypted and successfully committed to Local Vault.", "success");
                      setTimeout(() => {
                        setCurrentStep('SEARCH');
                        setAppointmentId('');
                        setScannedDocumentPreview(null);
                        setFingerprintHash(null);
                        setPhotoData(null);
                      }, 1500);
                  }} className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider flex justify-center items-center transition-all duration-300 ${
                    biometricsComplete 
                      ? 'bg-slate-900 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 cursor-pointer transform hover:-translate-y-0.5' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  }`}>
                    {biometricsComplete && <Lock size={16} className="mr-2 text-orange-400" />}
                    {biometricsComplete ? 'Seal Dossier & Commit to Vault' : 'Signatures Required to Proceed'}
                  </button>
                 </div>
               </div>
            )}
          </div>
        </div>
      </main>

      {/* New Feature: Live Telemetry Footer */}
      <footer className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 h-10 flex items-center justify-between px-6 z-40 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
        <div className="flex items-center space-x-6">
          <div className="flex items-center text-[10px] font-bold tracking-widest text-slate-500 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span> Connection: <span className="text-slate-800 ml-1">AES-256 SECURE</span>
          </div>
          <div className="hidden md:flex items-center text-[10px] font-bold tracking-widest text-slate-400 uppercase border-l border-slate-200 pl-6">
            Agent Version: <span className="text-slate-800 ml-1">v3.1.4</span>
          </div>
        </div>
        
        {/* Live Clock Component */}
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