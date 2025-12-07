import { useState } from 'react';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { aiService } from '@/services/ai.service';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export const RiskPrediction = () => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchPrediction = async () => {
    setLoading(true);
    try {
      const data = await aiService.predictRisks(user.id);
      setPrediction(data);
    } catch (error) {
      toast.error('Failed to generate risk prediction',error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    const colors = {
      low: 'text-green-600 bg-green-100',
      moderate: 'text-yellow-600 bg-yellow-100',
      high: 'text-red-600 bg-red-100',
    };
    return colors[level] || 'text-gray-600 bg-gray-100';
  };

  return (
    <Card title="Health Risk Prediction">
      {!prediction ? (
        <div className="text-center py-8">
          <TrendingUp className="h-16 w-16 text-orange-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            Analyze your health data to predict potential risks
          </p>
          <Button onClick={fetchPrediction} loading={loading}>
            Predict Risks
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {prediction.result && Object.entries(prediction.result).map(([key, value]) => (
            <div key={key} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold capitalize">
                  {key.replace(/_/g, ' ')}
                </h4>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(value.risk_level)}`}>
                  {value.risk_level} risk
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${value.probability * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">
                Probability: {(value.probability * 100).toFixed(1)}%
              </p>
            </div>
          ))}

          {prediction.recommendations && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Recommendations
              </h4>
              <ul className="space-y-2">
                {prediction.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    • {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button onClick={fetchPrediction} loading={loading} variant="secondary" className="w-full">
            Refresh Prediction
          </Button>
        </div>
      )}
    </Card>
  );
};