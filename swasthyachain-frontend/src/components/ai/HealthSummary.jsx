import { useState } from 'react';
import { Brain, Activity, Pill, AlertCircle, User } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Spinner } from '@/components/common/Spinner';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { aiService } from '../../services/ai.service';

export const HealthSummary = ({ patientId = null, patientName = null }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Determine which patient ID to use
  const targetPatientId = patientId || user.id;
  const isViewingOtherPatient = patientId && patientId !== user.id;

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const data = await aiService.getHealthSummary(targetPatientId);
      setSummary(data);
    } catch (error) {
      toast.error('Failed to generate health summary');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      {!summary ? (
        <div className="p-8 text-center">
          <Brain className="mx-auto w-16 h-16 text-blue-500 mb-4" />
          
          {isViewingOtherPatient && patientName && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg inline-flex items-center">
              <User className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-900">
                Viewing: {patientName}
              </span>
            </div>
          )}

          <p className="text-gray-600 mb-6">
            {isViewingOtherPatient
              ? `Generate an AI-powered summary of ${patientName}'s health records`
              : 'Generate an AI-powered summary of your health records'
            }
          </p>

          <Button onClick={fetchSummary} disabled={loading}>
            {loading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Generating...
              </>
            ) : (
              'Generate Summary'
            )}
          </Button>
        </div>
      ) : (
        <div className="p-6">
          {isViewingOtherPatient && patientName && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center">
                <User className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Patient Summary</p>
                  <p className="text-sm text-blue-700">{patientName}</p>
                </div>
              </div>
            </div>
          )}

          {/* Overview Section */}
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <Brain className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Overview</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">{summary.summary}</p>
          </div>

          {/* Key Conditions */}
          {summary.key_conditions && summary.key_conditions.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <Activity className="w-5 h-5 text-red-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Key Conditions</h3>
              </div>
              <div className="space-y-2">
                {summary.key_conditions.map((condition, index) => (
                  <div
                    key={index}
                    className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-900"
                  >
                    {condition}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Medications */}
          {summary.medications && summary.medications.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <Pill className="w-5 h-5 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Current Medications</h3>
              </div>
              <div className="space-y-2">
                {summary.medications.map((med, index) => (
                  <div
                    key={index}
                    className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-900"
                  >
                    {med}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {summary.recommendations && summary.recommendations.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h3>
              <div className="space-y-2">
                {summary.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="flex items-start p-3 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                      ✓
                    </span>
                    <span className="text-blue-900">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button onClick={fetchSummary} variant="secondary" disabled={loading}>
            {loading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Refreshing...
              </>
            ) : (
              'Refresh Summary'
            )}
          </Button>
        </div>
      )}
    </Card>
  );
};