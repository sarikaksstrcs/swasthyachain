import { useState } from 'react';
import { Brain, Activity, Pill, AlertCircle } from 'lucide-react';
import { aiService } from '@/services/ai.service';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Spinner } from '@/components/common/Spinner';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export const HealthSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const data = await aiService.getHealthSummary(user.id);
      setSummary(data);
    } catch (error) {
      toast.error('Failed to generate health summary');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="AI Health Summary">
      {!summary ? (
        <div className="text-center py-8">
          <Brain className="h-16 w-16 text-primary-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            Generate an AI-powered summary of your health records
          </p>
          <Button onClick={fetchSummary} loading={loading}>
            Generate Summary
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary-600" />
              Overview
            </h3>
            <p className="text-gray-700">{summary.summary}</p>
          </div>

          {summary.key_conditions && summary.key_conditions.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Key Conditions
              </h3>
              <ul className="list-disc list-inside space-y-1">
                {summary.key_conditions.map((condition, index) => (
                  <li key={index} className="text-gray-700">{condition}</li>
                ))}
              </ul>
            </div>
          )}

          {summary.medications && summary.medications.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Pill className="h-5 w-5 text-blue-600" />
                Current Medications
              </h3>
              <ul className="list-disc list-inside space-y-1">
                {summary.medications.map((med, index) => (
                  <li key={index} className="text-gray-700">{med}</li>
                ))}
              </ul>
            </div>
          )}

          {summary.recommendations && summary.recommendations.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Recommendations</h3>
              <ul className="space-y-2">
                {summary.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button onClick={fetchSummary} loading={loading} variant="secondary" className="w-full">
            Refresh Summary
          </Button>
        </div>
      )}
    </Card>
  );
};
