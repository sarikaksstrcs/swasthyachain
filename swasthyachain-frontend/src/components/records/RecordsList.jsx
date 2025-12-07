import { useState, useEffect } from 'react';
import { recordsService } from '@/services/records.service';
import { RecordCard } from './RecordCard';
import { Spinner } from '@/components/common/Spinner';
import { Alert } from '@/components/common/Alert';
import toast from 'react-hot-toast';

export const RecordsList = ({ onViewRecord }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await recordsService.getMyRecords();
      setRecords(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch medical records',err);
      toast.error('Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    try {
      await recordsService.deleteRecord(id);
      setRecords(records.filter(r => r.id !== id));
      toast.success('Record deleted successfully');
    } catch (err) {
      toast.error('Failed to delete record',err);
    }
  };

  if (loading) return <Spinner size="lg" className="my-8" />;
  
  if (error) return <Alert type="error" message={error} />;

  if (records.length === 0) {
    return (
      <Alert
        type="info"
        title="No Records Found"
        message="You haven't uploaded any medical records yet. Click the upload button to add your first record."
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
        />
      ))}
    </div>
  );
};
