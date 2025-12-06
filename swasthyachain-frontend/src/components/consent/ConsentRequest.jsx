import { useState } from 'react';
import { consentService } from '@/services/consent.service';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ACCESS_TYPES } from '@/utils/constants';
import toast from 'react-hot-toast';

export const ConsentRequest = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    patient_email: '',
    access_type: ACCESS_TYPES.READ,
    duration_hours: 24,
    reason: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await consentService.requestConsent(formData);
      toast.success('Consent request sent successfully!');
      onSuccess();
    } catch (error) {
      toast.error('Failed to send consent request');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Patient Email"
        name="patient_email"
        type="email"
        value={formData.patient_email}
        onChange={handleChange}
        placeholder="patient@example.com"
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Access Type
        </label>
        <select
          name="access_type"
          value={formData.access_type}
          onChange={handleChange}
          className="input-field"
          required
        >
          <option value={ACCESS_TYPES.READ}>Read Only</option>
          <option value={ACCESS_TYPES.WRITE}>Write Access</option>
          <option value={ACCESS_TYPES.FULL}>Full Access</option>
        </select>
      </div>

      <Input
        label="Duration (hours)"
        name="duration_hours"
        type="number"
        value={formData.duration_hours}
        onChange={handleChange}
        min="1"
        max="720"
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Reason for Access
        </label>
        <textarea
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          rows={4}
          className="input-field"
          placeholder="Explain why you need access to this patient's records..."
          required
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" className="flex-1" loading={loading}>
          Send Request
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};