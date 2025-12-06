import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { aiService } from '../services/aiService';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Heart,
  Activity,
  Zap,
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './Pages.css';

const AIInsights = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('summary');

  useEffect(() => {
    loadAIInsights();
  }, []);

  const loadAIInsights = async () => {
    try {
      setLoading(true);
      const [summaryData, predictionData, recommendData] = await Promise.all([
        aiService.getHealthSummary(user.id),
        aiService.predictRisks(user.id),
        aiService.getRecommendations(),
      ]);

      setSummary(summaryData);
      setPredictions(predictionData);
      setRecommendations(recommendData.recommendations || []);
    } catch (error) {
      console.error('Failed to load AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Analyzing your health data..." />;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>AI Health Insights</h1>
          <p className="page-subtitle">
            AI-powered analysis of your medical records
          </p>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeSection === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveSection('summary')}
        >
          <Brain size={18} />
          Health Summary
        </button>
        <button
          className={`tab ${activeSection === 'predictions' ? 'active' : ''}`}
          onClick={() => setActiveSection('predictions')}
        >
          <TrendingUp size={18} />
          Risk Predictions
        </button>
        <button
          className={`tab ${activeSection === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveSection('recommendations')}
        >
          <Zap size={18} />
          Recommendations
        </button>
      </div>

      {activeSection === 'summary' && summary && (
        <div className="ai-section">
          <div className="card">
            <h3 className="card-title">Your Health Summary</h3>
            <p className="ai-summary-text">{summary.summary}</p>
          </div>

          {summary.key_conditions && summary.key_conditions.length > 0 && (
            <div className="card">
              <h3 className="card-title">Key Conditions</h3>
              <div className="conditions-list">
                {summary.key_conditions.map((condition, index) => (
                  <div key={index} className="condition-item">
                    <Heart size={18} />
                    <span>{condition}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {summary.medications && summary.medications.length > 0 && (
            <div className="card">
              <h3 className="card-title">Current Medications</h3>
              <div className="medications-list">
                {summary.medications.map((medication, index) => (
                  <div key={index} className="medication-item">
                    💊 {medication}
                  </div>
                ))}
              </div>
            </div>
          )}

          {summary.risk_factors && summary.risk_factors.length > 0 && (
            <div className="card alert-card">
              <h3 className="card-title">
                <AlertTriangle size={20} />
                Risk Factors
              </h3>
              <ul className="risk-list">
                {summary.risk_factors.map((risk, index) => (
                  <li key={index}>{risk}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {activeSection === 'predictions' && predictions && (
        <div className="ai-section">
          <div className="card">
            <h3 className="card-title">Health Risk Predictions</h3>
            <p className="card-subtitle">
              AI-powered analysis based on your medical history
            </p>

            {predictions.result &&
              Object.entries(predictions.result).map(([key, value]) => (
                <div key={key} className="prediction-item">
                  <div className="prediction-header">
                    <h4>{key.replace(/_/g, ' ').toUpperCase()}</h4>
                    <span
                      className={`risk-badge risk-${value.risk_level}`}
                    >
                      {value.risk_level} risk
                    </span>
                  </div>
                  <div className="prediction-bar">
                    <div
                      className="prediction-fill"
                      style={{
                        width: `${value.probability * 100}%`,
                        background:
                          value.risk_level === 'high'
                            ? '#EF4444'
                            : value.risk_level === 'moderate'
                            ? '#F59E0B'
                            : '#10B981',
                      }}
                    />
                  </div>
                  <p className="prediction-probability">
                    {(value.probability * 100).toFixed(1)}% probability
                  </p>
                </div>
              ))}

            {predictions.confidence && (
              <div className="confidence-badge">
                <Activity size={16} />
                Confidence: {(predictions.confidence * 100).toFixed(0)}%
              </div>
            )}
          </div>

          {predictions.recommendations &&
            predictions.recommendations.length > 0 && (
              <div className="card">
                <h3 className="card-title">Preventive Actions</h3>
                <ul className="recommendations-list">
                  {predictions.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      )}

      {activeSection === 'recommendations' && (
        <div className="ai-section">
          <div className="card">
            <h3 className="card-title">Personalized Health Recommendations</h3>
            <p className="card-subtitle">
              AI-generated suggestions for better health
            </p>

            {recommendations.length > 0 ? (
              <div className="recommendations-grid">
                {recommendations.map((recommendation, index) => (
                  <div key={index} className="recommendation-card">
                    <div className="recommendation-icon">
                      <Zap size={20} />
                    </div>
                    <p>{recommendation}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">
                No recommendations available yet. Upload more medical records
                for personalized insights.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsights;