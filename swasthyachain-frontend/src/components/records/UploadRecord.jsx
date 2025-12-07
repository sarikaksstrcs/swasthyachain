import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { recordsService } from '@/services/records.service';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { RECORD_TYPES } from '@/utils/constants';
import toast from 'react-hot-toast';

export const UploadRecord = ({ onSuccess, onCancel }) => {
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    record_type: RECORD_TYPES.LAB_REPORT,
    title: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setLoading(true);
    try {
      await recordsService.uploadRecord(file, formData);
      toast.success('Record uploaded successfully!');
      onSuccess();
    } catch (error) {
      toast.error('Failed to upload record');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload File
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
          {file ? (
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded">
              <span className="text-sm text-gray-700">{file.name}</span>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <label className="cursor-pointer">
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, JPG, PNG or DICOM (Max 50MB)
              </p>
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.dcm"
              />
            </label>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Record Type
        </label>
        <select
          name="record_type"
          value={formData.record_type}
          onChange={handleChange}
          className="input-field"
          required
        >
          <option value={RECORD_TYPES.LAB_REPORT}>Lab Report</option>
          <option value={RECORD_TYPES.PRESCRIPTION}>Prescription</option>
          <option value={RECORD_TYPES.IMAGING}>Medical Imaging</option>
          <option value={RECORD_TYPES.CONSULTATION}>Consultation Notes</option>
          <option value={RECORD_TYPES.DISCHARGE_SUMMARY}>Discharge Summary</option>
        </select>
      </div>

      <Input
        label="Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="e.g., Annual Blood Test"
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="input-field"
          placeholder="Additional details about this record..."
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" className="flex-1" loading={loading}>
          Upload Record
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
