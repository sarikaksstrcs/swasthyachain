import { useState, useEffect } from "react";
import { Lightbulb } from "lucide-react";
import { aiService } from "@/services/ai.service";
import { Card } from "@/components/common/Card";
import { Spinner } from "@/components/common/Spinner";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

export const Recommendations = ({ patientId = null }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Use provided patientId or default to current user
  const targetPatientId = patientId || user.id;

  useEffect(() => {
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetPatientId]); // Refetch when patient changes

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const data = await aiService.getRecommendations(targetPatientId);
      setRecommendations(data.recommendations || []);
    } catch (error) {
      toast.error("Failed to load recommendations", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Personalized Health Recommendations">
      {loading ? (
        <Spinner className="my-8" />
      ) : recommendations.length > 0 ? (
        <ul className="space-y-3">
          {recommendations.map((rec, index) => (
            <li
              key={index}
              className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg"
            >
              <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{rec}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600 text-center py-8">
          No recommendations available yet. Upload more medical records to get
          personalized insights.
        </p>
      )}
    </Card>
  );
};
