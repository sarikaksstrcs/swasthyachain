import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { RecordsList } from '../components/records/RecordsList';
import { Modal } from '../components/common/Modal';
import { UploadRecord } from '../components/records/UploadRecord';
import { Button } from '../components/common/Button';
import { RecordDetails } from '../components/records/RecordDetails';
import { PatientList } from '../components/common/patientList';


export const MedicalRecords = () => {
  const [showUpload, setShowUpload] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [viewingPatientRecords, setViewingPatientRecords] = useState(false);


  useEffect(() => {
    // Get user role from localStorage or context
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUserRole(user.role);
  }, []);

  const handleUploadSuccess = () => {
    setShowUpload(false);
    window.location.reload();
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setShowPatientSearch(false);
    setViewingPatientRecords(true);
  };

  const handleBackToMyRecords = () => {
    setSelectedPatient(null);
    setViewingPatientRecords(false);
  };

  const handleUploadForPatient = () => {
    setShowUpload(true);
  };

  const isDoctor = userRole === 'doctor';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {viewingPatientRecords && selectedPatient
              ? `${selectedPatient.full_name}'s Medical Records`
              : 'Medical Records'}
          </h1>
          <p className="text-gray-600 mt-2">
            {viewingPatientRecords && selectedPatient
              ? `Viewing records for ${selectedPatient.email}`
              : 'Manage your encrypted health records securely'}
          </p>
        </div>
        
        <div className="flex gap-3">
          {viewingPatientRecords && selectedPatient ? (
            <>
              <Button variant="secondary" onClick={handleBackToMyRecords}>
                ← Back to My Records
              </Button>
              <Button onClick={handleUploadForPatient}>
                <Plus className="h-5 w-5" />
                Upload for Patient
              </Button>
            </>
          ) : (
            <>
              {isDoctor && (
                <Button variant="secondary" onClick={() => setShowPatientSearch(true)}>
                  <Search className="h-5 w-5" />
                  Find Patient
                </Button>
              )}
              <Button onClick={() => setShowUpload(true)}>
                <Plus className="h-5 w-5" />
                {isDoctor ? 'Upload Record' : 'Upload Record'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Records List */}
      <RecordsList 
        onViewRecord={setSelectedRecord}
        patientId={viewingPatientRecords ? selectedPatient?.id : null}
      />

      {/* Upload Modal */}
      <Modal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        title={
          viewingPatientRecords && selectedPatient
            ? `Upload Record for ${selectedPatient.full_name}`
            : 'Upload Medical Record'
        }
        size="lg"
      >
        <UploadRecord
          onSuccess={handleUploadSuccess}
          onCancel={() => setShowUpload(false)}
          patientId={viewingPatientRecords ? selectedPatient?.id : null}
        />
      </Modal>

      {/* Record Details Modal */}
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

      {/* Patient Search Modal (Doctor only) */}
      {isDoctor && (
        <Modal
          isOpen={showPatientSearch}
          onClose={() => setShowPatientSearch(false)}
          title="Select Patient"
          size="xl"
        >
          <PatientList onSelectPatient={handleSelectPatient} />
        </Modal>
      )}
    </div>
  );
};