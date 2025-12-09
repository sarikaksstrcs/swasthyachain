import { useState, useEffect } from 'react';
import { consentService } from '@/services/consent.service';
import { ConsentCard } from './ConsentCard';
import { Spinner } from '@/components/common/Spinner';
import { Alert } from '@/components/common/Alert';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { ROLES } from '@/utils/constants';

export const ConsentList = () => {
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const isPatient = user?.role === ROLES.PATIENT;

  useEffect(() => {
    fetchConsents();
  }, []);

  const fetchConsents = async () => {
    try {
      setLoading(true);
      const data = await consentService.getMyConsents();
      setConsents(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch consents',err);
      toast.error('Failed to load consents');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await consentService.approveConsent(id);
      toast.success('Consent approved');
      fetchConsents();
    } catch (err) {
      toast.error('Failed to approve consent',err);
    }
  };

  const handleDeny = async (id) => {
    try {
      await consentService.denyConsent(id);
      toast.success('Consent denied');
      fetchConsents();
    } catch (err) {
      toast.error('Failed to deny consent',err);
    }
  };

  const handleRevoke = async (id) => {
    if (!confirm('Are you sure you want to revoke this consent?')) return;
    
    try {
      await consentService.revokeConsent(id);
      toast.success('Consent revoked');
      fetchConsents();
    } catch (err) {
      toast.error('Failed to revoke consent',err);
    }
  };

  if (loading) return <Spinner size="lg" className="my-8" />;
  if (error) return <Alert type="error" message={error} />;

  if (consents.length === 0) {
    return (
      <Alert
        type="info"
        title="No Consents Found"
        message={isPatient ? "You haven't received any consent requests yet." : "You haven't requested any consents yet."}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {consents.map((consent) => (
        <ConsentCard
          key={consent.id}
          consent={consent}
          onApprove={handleApprove}
          onDeny={handleDeny}
          onRevoke={handleRevoke}
          isPatient={isPatient}
        />
      ))}
    </div>
  );
};
