import api from './api';

export const recordService = {
  uploadRecord: async (file, recordData) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('record', JSON.stringify(recordData));

    const response = await api.post('/records/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getMyRecords: async () => {
    const response = await api.get('/records/my-records');
    return response.data;
  },

  getRecord: async (recordId) => {
    const response = await api.get(`/records/${recordId}`);
    return response.data;
  },

  deleteRecord: async (recordId) => {
    const response = await api.delete(`/records/${recordId}`);
    return response.data;
  },
};