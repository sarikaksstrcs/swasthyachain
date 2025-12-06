import api from './api';

export const recordsService = {
  uploadRecord: async (file, recordData) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('record', JSON.stringify(recordData));

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
};