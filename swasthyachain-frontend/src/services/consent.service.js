import api from './api';

export const consentService = {
  requestConsent: async (data) => {
    const response = await api.post('/consent/request', data);
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

  approveConsent: async (id) => {
    const response = await api.put(`/consent/${id}/approve`);
    return response.data;
  },

  denyConsent: async (id) => {
    const response = await api.put(`/consent/${id}/deny`);
    return response.data;
  },

  revokeConsent: async (id) => {
    await api.delete(`/consent/${id}/revoke`);
  },
};