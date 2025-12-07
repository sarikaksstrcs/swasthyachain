import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { PatientList } from '../components/common/patientList';
import { HealthSummary } from '../components/ai/HealthSummary';
import { RiskPrediction } from '../components/ai/RiskPrediction';
import { Recommendations } from '../components/ai/Recommendations';


export const AIInsights = () => {
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState(null);

  const isDoctor = user?.role === 'doctor';

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
  };

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
      <div className={`grid grid-cols-1 ${isDoctor ? 'lg:grid-cols-3' : ''} gap-6`}>
        {/* Patient List - Only for Doctors */}
        {isDoctor && (
          <div className="lg:col-span-1">
            <PatientList onSelectPatient={handleSelectPatient} />
          </div>
        )}

        {/* AI Insights */}
        <div className={`${isDoctor ? 'lg:col-span-2' : ''} space-y-6`}>
          {/* Show insights only if patient is selected (for doctors) or always (for patients) */}
          {(!isDoctor || selectedPatient) ? (
            <>
              <HealthSummary 
                patientId={isDoctor ? selectedPatient?.id : null}
                patientName={isDoctor ? selectedPatient?.full_name : null}
              />
              
              <RiskPrediction 
                patientId={isDoctor ? selectedPatient?.id : null}
              />
              
              <Recommendations 
                patientId={isDoctor ? selectedPatient?.id : null}
              />
            </>
          ) : (
            // Empty state for doctors who haven't selected a patient
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