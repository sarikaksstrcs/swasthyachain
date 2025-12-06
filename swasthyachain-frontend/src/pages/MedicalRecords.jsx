import { useState } from 'react';
import { Plus } from 'lucide-react';
import { RecordsList } from '../components/records/RecordsList';
import { Modal } from '../components/common/Modal';
import { UploadRecord } from '../components/records/UploadRecord';
import { Button } from '../components/common/Button';
import { RecordDetails } from '../components/records/RecordDetails';


export const MedicalRecords = () => {
  const [showUpload, setShowUpload] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const handleUploadSuccess = () => {
    setShowUpload(false);
    window.location.reload();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
          <p className="text-gray-600 mt-2">
            Manage your encrypted health records securely
          </p>
        </div>
        <Button onClick={() => setShowUpload(true)}>
          <Plus className="h-5 w-5" />
          Upload Record
        </Button>
      </div>

      <RecordsList onViewRecord={setSelectedRecord} />

      <Modal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        title="Upload Medical Record"
        size="lg"
      >
        <UploadRecord
          onSuccess={handleUploadSuccess}
          onCancel={() => setShowUpload(false)}
        />
      </Modal>

      <Modal
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title="Record Details"
        size="lg"
      >
        <RecordDetails
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      </Modal>
    </div>
  );
};
