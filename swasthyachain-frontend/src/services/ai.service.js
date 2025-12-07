// services/ai.service.js

const API_BASE_URL = '/api/v1';

class AIService {
  async getHealthSummary(patientId) {
    const response = await fetch(`${API_BASE_URL}/ai/health-summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({ patient_id: patientId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to generate health summary');
    }

    return response.json();
  }

  async getRiskPrediction(patientId, predictionType = 'disease_risk') {
    const response = await fetch(`${API_BASE_URL}/ai/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({ 
        patient_id: patientId,
        prediction_type: predictionType
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to generate risk prediction');
    }

    return response.json();
  }

  async getRecommendations(patientId) {
    const response = await fetch(`${API_BASE_URL}/ai/recommendations/${patientId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get recommendations');
    }

    return response.json();
  }
}

export const aiService = new AIService();