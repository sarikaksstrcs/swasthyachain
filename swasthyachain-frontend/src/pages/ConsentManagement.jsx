import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/constants';
import { ConsentList } from '../components/consent/ConsentList';
import { ConsentRequest } from '../components/consent/ConsentRequest';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';

export const ConsentManagement = () => {
  const [showRequest, setShowRequest] = useState(false);
  const { user } = useAuth();

  const isDoctor = user?.role === ROLES.DOCTOR;

  const handleRequestSuccess = () => {
    setShowRequest(false);
    window.location.reload();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consent Management</h1>
          <p className="text-gray-600 mt-2">
            {isDoctor 
              ? 'Request and manage patient consent for medical records'
              : 'Manage who can access your medical records'}
          </p>
        </div>
        {isDoctor && (
          <Button onClick={() => setShowRequest(true)} variant='primary' className='bg-blue-500'>
            <Plus className="h-5 w-5" />
            Request Consent
          </Button>
        )}
      </div>

      <ConsentList />

      {isDoctor && (
        <Modal
          isOpen={showRequest}
          onClose={() => setShowRequest(false)}
          title="Request Patient Consent"
          size="lg"
        >
          <ConsentRequest
            onSuccess={handleRequestSuccess}
            onCancel={() => setShowRequest(false)}
          />
        </Modal>
      )}
    </div>
  );
};