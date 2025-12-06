import api from './api';

export const consentService = {
  requestConsent: async (consentData) => {
    const response = await api.post('/consent/request', consentData);
    return response.data;
  },

  getPendingConsents: async () => {
    const response = await api.get('/consent/pending');
    return response.data;
  },

  getMyConsents: async () => {
    const response = await api.get('/consent/my-consents');
    return response.data;
  },

  approveConsent: async (consentId) => {
    const response = await api.put(`/consent/${consentId}/approve`);
    return response.data;
  },

  denyConsent: async (consentId) => {
    const response = await api.put(`/consent/${consentId}/deny`);
    return response.data;
  },

  revokeConsent: async (consentId) => {
    const response = await api.delete(`/consent/${consentId}/revoke`);
    return response.data;
  },
};
