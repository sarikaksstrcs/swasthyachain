// services/ai.service.js

const API_BASE_URL = "/api/v1";

class AIService {
  /**
   * Get health summary for a patient
   * @param {string} patientId - Patient ID (defaults to current user if not provided)
   */
  async getHealthSummary(patientId) {
    const response = await fetch(`${API_BASE_URL}/ai/health-summary`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({ patient_id: patientId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to generate health summary");
    }

    return response.json();
  }

  /**
   * Predict health risks for a patient
   * @param {string} patientId - Patient ID (defaults to current user if not provided)
   */
  async predictRisks(patientId) {
    const response = await fetch(`${API_BASE_URL}/ai/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({
        patient_id: patientId,
        prediction_type: "disease_risk",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to generate risk prediction");
    }

    return response.json();
  }

  /**
   * Get health recommendations for a patient
   * @param {string} patientId - Patient ID (defaults to current user if not provided)
   */
  async getRecommendations(patientId = null) {
    // If patientId provided, use the patient-specific endpoint
    const endpoint = patientId
      ? `${API_BASE_URL}/ai/recommendations/${patientId}`
      : `${API_BASE_URL}/ai/recommendations`;

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to get recommendations");
    }

    return response.json();
  }
}

export const aiService = new AIService();
