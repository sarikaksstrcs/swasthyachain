import api from './api';

export const recordsService = {
  uploadRecord: async (file, recordData) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('record_type', recordData.record_type);
    formData.append('title', recordData.title);
    
    if (recordData.description) {
      formData.append('description', recordData.description);
    }
    
    // NEW: Add patient_id if uploading for another patient (doctor feature)
    if (recordData.patient_id) {
      formData.append('patient_id', recordData.patient_id);
    }

    const response = await api.post('/records/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getMyRecords: async () => {
    const response = await api.get('/records/my-records');
    return response.data;
  },

  // NEW: Get records for a specific patient (doctor only)
  getPatientRecords: async (patientId) => {
    const response = await api.get(`/records/patient/${patientId}`);
    return response.data;
  },

  getRecordById: async (id) => {
    const response = await api.get(`/records/${id}`);
    return response.data;
  },

  deleteRecord: async (id) => {
    await api.delete(`/records/${id}`);    
  },

  downloadRecord: async (id, filename) => {
    const response = await api.get(`/records/${id}/download`, {
        responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `record_${id}`;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};