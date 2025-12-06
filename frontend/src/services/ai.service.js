import api from './api';

export const aiService = {
  getHealthSummary: async (patientId) => {
    const response = await api.post('/ai/summarize', { patient_id: patientId });
    return response.data;
  },

  predictRisks: async (patientId, predictionType = 'disease_risk') => {
    const response = await api.post('/ai/predict', {
      patient_id: patientId,
      prediction_type: predictionType,
    });
    return response.data;
  },

  getRecommendations: async () => {
    const response = await api.get('/ai/recommendations');
    return response.data;
  },
};