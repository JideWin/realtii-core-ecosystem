// src/components/IntakeWizard.tsx
import React, { useState } from 'react';
import { LocalAgentService } from '../services/localAgentService';

// Mocked cloud data for Step 1 (Reception)
const MOCK_CITIZEN_CACHE = {
    nin: "82947104821",
    fullName: "Jide Ogundipe",
    propertyType: "Residential Deed",
    location: "Ado-Ekiti"
};

export const IntakeWizard: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Payload State
  const [citizenData, setCitizenData] = useState<any>(null);
  const [documentBase64, setDocumentBase64] = useState<string | null>(null);
  const [biometricHash, setBiometricHash] = useState<string | null>(null);

  // Step 1: Reception (The Handshake)
  const handleVerifyAppointment = () => {
      // In production, this pulls from a local daily cache of appointments
      setCitizenData(MOCK_CITIZEN_CACHE);
      setStep(2);
  };

  // Step 2: Screening (TWAIN Scanner)
  const handleScanDocument = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const base64Image = await LocalAgentService.scanDocument();
      setDocumentBase64(base64Image);
      setStep(3);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Biometrics (Dermalog Bridge)
  const handleCaptureBiometrics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const hash = await LocalAgentService.captureBiometrics();
      setBiometricHash(hash);
      setStep(4);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 4: The Vault (Commit to SQLite)
  const handleCommitToVault = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await LocalAgentService.commitToVault(citizenData, documentBase64!, biometricHash!);
      alert("Success! Transaction securely locked in Local Vault. Ready for next citizen.");
      // Reset wizard for the next person in line
      setStep(1);
      setCitizenData(null);
      setDocumentBase64(null);
      setBiometricHash(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-xl mt-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
        Ekiti State Hub: Intake Pipeline
      </h2>

      {/* Progress Indicator */}
      <div className="flex justify-between mb-8 text-sm font-medium text-gray-500">
          <span className={step >= 1 ? 'text-blue-600' : ''}>1. Reception</span>
          <span className={step >= 2 ? 'text-blue-600' : ''}>2. Screening</span>
          <span className={step >= 3 ? 'text-blue-600' : ''}>3. Biometrics</span>
          <span className={step >= 4 ? 'text-blue-600' : ''}>4. The Vault</span>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
        </div>
      )}

      {/* --- WIZARD STEPS --- */}
      {step === 1 && (
        <div className="flex flex-col items-center">
            <p className="mb-4 text-gray-600">Enter Citizen Appointment ID or Scan QR</p>
            <input type="text" placeholder="APP-2026-EK-..." className="border p-2 rounded w-64 mb-4 text-center" />
            <button onClick={handleVerifyAppointment} className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700">
                Verify & Pull Data
            </button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col items-center">
            <p className="mb-4 text-gray-600">Place Survey Plan and Deeds into the ADF Scanner</p>
            {documentBase64 ? (
                <div className="mb-4 text-green-600 font-bold">✓ Document Captured ({documentBase64.substring(0, 30)}...)</div>
            ) : (
                <button disabled={isLoading} onClick={handleScanDocument} className="bg-gray-800 text-white px-6 py-2 rounded shadow hover:bg-gray-900 disabled:opacity-50">
                    {isLoading ? 'Scanning...' : 'Trigger Ricoh/Epson Scanner'}
                </button>
            )}
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col items-center">
            <p className="mb-4 text-gray-600">Citizen must place Right Thumb on Dermalog ZF1 Sensor</p>
            {biometricHash ? (
                <div className="mb-4 text-green-600 font-bold">✓ Biometric Hash Secured</div>
            ) : (
                <button disabled={isLoading} onClick={handleCaptureBiometrics} className="bg-purple-600 text-white px-6 py-2 rounded shadow hover:bg-purple-700 disabled:opacity-50">
                    {isLoading ? 'Firing Sensor Laser...' : 'Capture Fingerprint'}
                </button>
            )}
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col items-start w-full bg-gray-50 p-6 rounded border">
            <h3 className="font-bold text-lg mb-4">Review Package</h3>
            <p><strong>Citizen:</strong> {citizenData.fullName} (NIN: {citizenData.nin})</p>
            <p><strong>Property Type:</strong> {citizenData.propertyType}</p>
            <p className="mt-2 text-green-600">✓ 1x Encrypted Document Payload Attached</p>
            <p className="text-green-600">✓ 1x WSQ Biometric Hash Attached</p>
            
            <div className="mt-6 w-full flex justify-end">
                <button disabled={isLoading} onClick={handleCommitToVault} className="bg-green-600 text-white px-8 py-3 rounded font-bold shadow-lg hover:bg-green-700 disabled:opacity-50">
                    {isLoading ? 'Locking to Vault...' : 'COMMIT TRANSACTION (OFFLINE)'}
                </button>
            </div>
        </div>
      )}
    </div>
  );
};