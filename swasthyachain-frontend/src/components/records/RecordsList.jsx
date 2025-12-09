import { useState, useEffect } from "react";
import { recordsService } from "@/services/records.service";
import { RecordCard } from "./RecordCard";
import { Spinner } from "@/components/common/Spinner";
import { Alert } from "@/components/common/Alert";
import toast from "react-hot-toast";

export const RecordsList = ({ onViewRecord, patientId = null }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecords();
  }, [patientId]);

  const fetchRecords = async () => {
    try {
      setLoading(true);

      // If patientId is provided, fetch that patient's records (doctor view)
      // Otherwise fetch current user's records
      const data = patientId
        ? await recordsService.getPatientRecords(patientId)
        : await recordsService.getMyRecords();

      setRecords(data);
      setError(null);
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail || "Failed to fetch medical records";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
      await recordsService.deleteRecord(id);
      setRecords(records.filter((r) => r.id !== id));
      toast.success("Record deleted successfully");
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail || "Failed to delete record";
      toast.error(errorMessage);
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
        <span className="ml-3 text-gray-600">Loading records...</span>
      </div>
    );
  }

  if (error) {
    return <Alert type="error" title="Error Loading Records" message={error} />;
  }

  if (records.length === 0) {
    return (
      <Alert
        type="info"
        title="No Records Found"
        message={
          patientId
            ? "This patient doesn't have any medical records yet."
            : "You haven't uploaded any medical records yet. Click the upload button to add your first record."
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {records.map((record) => (
        <RecordCard
          key={record.id}
          record={record}
          onView={onViewRecord}
          onDelete={handleDelete}
          hideDelete={!!patientId}
        />
      ))}
    </div>
  );
};
