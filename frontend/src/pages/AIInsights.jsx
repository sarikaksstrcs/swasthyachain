import { HealthSummary } from '@/components/ai/HealthSummary';
import { RiskPrediction } from '@/components/ai/RiskPrediction';
import { Recommendations } from '@/components/ai/Recommendations';

export const AIInsights = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI Health Insights</h1>
        <p className="text-gray-600 mt-2">
          Get personalized health insights powered by artificial intelligence
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <HealthSummary />
          <Recommendations />
        </div>
        <div>
          <RiskPrediction />
        </div>
      </div>
    </div>
  );
};
