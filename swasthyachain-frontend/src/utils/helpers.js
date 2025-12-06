import { format } from 'date-fns';

export const formatDate = (date) => {
  return format(new Date(date), 'MMM dd, yyyy');
};

export const formatDateTime = (date) => {
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
};

export const getRecordTypeLabel = (type) => {
  const labels = {
    lab_report: 'Lab Report',
    prescription: 'Prescription',
    imaging: 'Medical Imaging',
    consultation: 'Consultation',
    discharge_summary: 'Discharge Summary',
  };
  return labels[type] || type;
};

export const getStatusBadgeColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    denied: 'bg-red-100 text-red-800',
    revoked: 'bg-gray-100 text-gray-800',
    expired: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const handleApiError = (error) => {
  if (error.response) {
    return error.response.data.detail || 'An error occurred';
  }
  return error.message || 'Network error';
};