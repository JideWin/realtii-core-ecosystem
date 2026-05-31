// src/pages/Checkout.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PaystackButton } from 'react-paystack'; // <-- USING THE COMPONENT NOW
import { ShieldCheck, Loader2 } from 'lucide-react';

// ⚠️ PASTE YOUR REAL PAYSTACK TEST PUBLIC KEY HERE:
const PAYSTACK_PUBLIC_KEY = 'pk_test_d31edaaed3394b637c648d4533a8fabcc09db9b6'; 

export const Checkout: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appDetails, setAppDetails] = useState<any>(null);
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    fetch(`http://127.0.0.1:3000/api/v1/billing/applications/${id}`)
      .then(res => res.json())
      .then(data => setAppDetails(data))
      .catch(err => console.error("Error loading app details:", err));
  }, [id]);

  // Logic: Enterprise = ₦200,000, others = ₦50,000
  const price = appDetails?.tier === 'Enterprise' ? 200000 : 50000;

  // --- THE ACTIVATION LOGIC (Runs after payment is successful) ---
  const handlePaymentSuccess = async () => {
    setIsActivating(true);
    try {
      const res = await fetch(`http://127.0.0.1:3000/api/v1/billing/applications/${id}/activate`, { 
        method: 'POST' 
      });
      
      if (res.ok) {
        alert("Payment Confirmed! Your API Keys are now active.");
        navigate('/developer-portal'); // Instantly drop them in the portal!
      } else {
        alert("Server verified payment, but failed to generate keys. Contact Support.");
      }
    } catch (error) {
      alert("Network error activating account.");
    } finally {
      setIsActivating(false);
    }
  };

  // --- PAYSTACK BUTTON CONFIGURATION ---
  const componentProps = {
    email: appDetails?.email || "customer@example.com",
    amount: price * 100, // Paystack strictly requires Kobo (Amount * 100)
    metadata: {
      name: appDetails?.companyName || "Partner",
      custom_fields: [
        {
          display_name: "Application ID",
          variable_name: "application_id",
          value: id || "Unknown"
        }
      ]
    },
    publicKey: PAYSTACK_PUBLIC_KEY,
    text: "Pay Securely with Paystack",
    onSuccess: handlePaymentSuccess,
    onClose: () => alert("Payment cancelled. You must pay to unlock API access."),
  };

  // --- LOADING SCREEN ---
  if (!appDetails) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
      <Loader2 className="animate-spin mr-3" /> Loading secure checkout...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white font-sans">
      <div className="bg-slate-800 p-10 rounded-3xl max-w-md w-full border border-slate-700 shadow-2xl text-center">
        
        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-400">
          <ShieldCheck size={32} />
        </div>
        
        <h1 className="text-2xl font-extrabold mb-2">Complete Activation</h1>
        
        <p className="text-slate-400 text-sm mb-8">
          Secure payment for <strong>{appDetails.companyName}</strong> ({appDetails.tier} Tier).
        </p>
        
        <div className="bg-slate-900 rounded-xl p-6 mb-8 border border-slate-700">
          <p className="text-slate-500 text-xs font-bold uppercase mb-1">Total Due</p>
          <p className="text-4xl font-extrabold text-emerald-400">₦{price.toLocaleString()}</p>
        </div>

        {/* --- THE REAL PAYSTACK BUTTON --- */}
        {isActivating ? (
           <button disabled className="w-full bg-slate-700 text-slate-300 py-4 rounded-xl font-bold flex items-center justify-center cursor-not-allowed">
             <Loader2 className="animate-spin mr-2" /> Generating API Keys...
           </button>
        ) : (
          <PaystackButton 
            {...componentProps} 
            className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold flex items-center justify-center transition-all shadow-lg"
          />
        )}
        
      </div>
    </div>
  );
};