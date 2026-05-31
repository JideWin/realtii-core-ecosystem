// src/services/localAgentService.ts

// The Spring Boot Java Agent is running locally on the Hub PC
const AGENT_BASE_URL = 'http://localhost:8080/api';

export const LocalAgentService = {
  /**
   * Triggers the physical TWAIN scanner (Ricoh/Epson)
   * @returns Base64 encoded JPEG of the scanned document
   */
  scanDocument: async (): Promise<string> => {
    const response = await fetch(`${AGENT_BASE_URL}/hardware/scan`);
    if (!response.ok) {
      throw new Error('Hardware scanner failed to initialize or document jammed.');
    }
    const data = await response.json();
    return data.documentBase64;
  },

  /**
   * Triggers the Dermalog ZF1 Fingerprint Scanner
   * @returns Base64 encoded WSQ biometric hash
   */
  captureBiometrics: async (): Promise<string> => {
    const response = await fetch(`${AGENT_BASE_URL}/hardware/fingerprint`);
    if (!response.ok) {
      throw new Error('Dermalog scanner offline. Please check USB connection.');
    }
    const data = await response.json();
    return data.biometricHash;
  },

  /**
   * Commits the entire package to the local SQLite vault (Shock Absorber)
   */
  commitToVault: async (citizenData: any, documentBase64: string, biometricHash: string) => {
    const finalPayload = {
        citizenData,
        biometricHash,
        timestamp: new Date().toISOString()
    };

    const response = await fetch(`${AGENT_BASE_URL}/transactions/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
          payload: JSON.stringify(finalPayload), 
          documentBase64 
      })
    });

    if (!response.ok) {
        throw new Error('Failed to secure data in local SQLite Vault.');
    }
    return response.json();
  }
};