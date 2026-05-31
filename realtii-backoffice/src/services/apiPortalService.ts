// src/services/apiPortalService.ts

export const ApiPortalService = {
  getPartnerMetrics: async (partnerId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/billing/metrics/${partnerId}`);
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch billing metrics:", error);
      return null;
    }
  },

  rotateApiKey: async (partnerId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/billing/rotate-key/${partnerId}`, {
        method: 'POST'
      });
      const data = await response.json();
      return data.newApiKey;
    } catch (error) {
      console.error("Failed to rotate API key:", error);
      throw error;
    }
  }
};