// src/services/records.service.js
import api from './api';

export const recordsService = {
  uploadRecord: async (file, recordData) => {
    const formData = new FormData();
    formData.append('file', file);
    // Append each field individually, not as JSON string
    formData.append('record_type', recordData.record_type);
    formData.append('title', recordData.title);
    if (recordData.description) {
      formData.append('description', recordData.description);
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

  getRecordById: async (id) => {
    const response = await api.get(`/records/${id}`);
    return response.data;
  },

  deleteRecord: async (id) => {
    await api.delete(`/records/${id}`);    
  },

  downloadRecord: async (id, filename) => {
    const response = await api.get(`/records/${id}/download`, {
        responseType: 'blob', // Important!
    });

    // Create blob and trigger download
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `record_${id}`;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    }
};