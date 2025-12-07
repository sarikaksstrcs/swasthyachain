import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { HealthSummary } from '../components/ai/HealthSummary';
import { Recommendations } from '../components/ai/Recommendations';
import { RiskPrediction } from '../components/ai/RiskPrediction';
import { PatientList } from '../components/common/patientList';


export const AIInsights = () => {
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState(null);

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
  };

  const isDoctor = user?.role === 'doctor';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI Health Insights
        </h1>
        <p className="text-gray-600">
          {isDoctor 
            ? 'View AI-powered health insights for your patients'
            : 'Get personalized health insights powered by artificial intelligence'
          }
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Patient List (for doctors only) */}
        {isDoctor && (
          <div className="lg:col-span-1">
            <PatientList onSelectPatient={handleSelectPatient} />
          </div>
        )}

        {/* Right Column - AI Insights */}
        <div className={isDoctor ? 'lg:col-span-2 space-y-6' : 'lg:col-span-3 space-y-6'}>
          {/* Health Summary */}
          <HealthSummary 
            patientId={isDoctor ? selectedPatient?.id : null}
            patientName={isDoctor ? selectedPatient?.full_name : null}
          />

          {/* Only show recommendations and risk prediction if a patient is selected (for doctors) or for patients themselves */}
          {(!isDoctor || selectedPatient) && (
            <>
              {/* Risk Prediction */}
              <RiskPrediction 
                patientId={isDoctor ? selectedPatient?.id : null}
              />

              {/* Recommendations */}
              <Recommendations 
                patientId={isDoctor ? selectedPatient?.id : null}
              />
            </>
          )}

          {/* Empty state for doctors */}
          {isDoctor && !selectedPatient && (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <p className="text-gray-600 text-lg">
                Select a patient from the list to view their AI health insights
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};