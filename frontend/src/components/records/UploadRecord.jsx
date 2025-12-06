import { useState, useRef } from 'react';
import { Upload, X, FileText, Plus, Eye, Download, Trash2 } from 'lucide-react';

const RECORD_TYPES = {
  LAB_REPORT: 'lab_report',
  PRESCRIPTION: 'prescription',
  IMAGING: 'imaging',
  CONSULTATION: 'consultation',
  DISCHARGE_SUMMARY: 'discharge_summary'
};

// Modal Component
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className={`relative bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto`}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Upload Record Component
const UploadRecord = ({ onSuccess, onCancel }) => {
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    record_type: RECORD_TYPES.LAB_REPORT,
    title: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }

    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }

    setLoading(true);
    try {
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Record uploaded successfully!');
      onSuccess();
    } catch (error) {
      alert('Failed to upload record');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload File *
        </label>
        <div 
          onClick={triggerFileInput}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
        >
          {file ? (
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div>
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-base font-medium text-gray-700 mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-gray-500">
                PDF, JPG, PNG or DICOM (Max 50MB)
              </p>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept=".pdf,.jpg,.jpeg,.png,.dcm"
        />
      </div>

      {/* Record Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Record Type *
        </label>
        <select
          name="record_type"
          value={formData.record_type}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        >
          <option value={RECORD_TYPES.LAB_REPORT}>Lab Report</option>
          <option value={RECORD_TYPES.PRESCRIPTION}>Prescription</option>
          <option value={RECORD_TYPES.IMAGING}>Medical Imaging</option>
          <option value={RECORD_TYPES.CONSULTATION}>Consultation Notes</option>
          <option value={RECORD_TYPES.DISCHARGE_SUMMARY}>Discharge Summary</option>
        </select>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Annual Blood Test"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
          placeholder="Additional details about this record..."
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Uploading...' : 'Upload Record'}
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// Sample Records List
const RecordsList = ({ onViewRecord }) => {
  const sampleRecords = [
    {
      id: 1,
      title: 'Annual Blood Test 2024',
      record_type: 'Lab Report',
      date: '2024-11-15',
      description: 'Comprehensive metabolic panel and CBC'
    },
    {
      id: 2,
      title: 'Chest X-Ray',
      record_type: 'Medical Imaging',
      date: '2024-10-22',
      description: 'Routine chest radiograph'
    },
    {
      id: 3,
      title: 'Dr. Smith Consultation',
      record_type: 'Consultation Notes',
      date: '2024-09-30',
      description: 'Follow-up appointment for hypertension'
    }
  ];

  return (
    <div className="grid gap-4">
      {sampleRecords.map(record => (
        <div key={record.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{record.title}</h3>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{record.record_type}</span>
                <span>{record.date}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">{record.description}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => onViewRecord(record)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="View"
              >
                <Eye className="h-5 w-5" />
              </button>
              <button 
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Download"
              >
                <Download className="h-5 w-5" />
              </button>
              <button 
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Record Details Component
const RecordDetails = ({ record, onClose }) => {
  if (!record) return null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-500">Title</h3>
        <p className="text-lg text-gray-900 mt-1">{record.title}</p>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-500">Type</h3>
        <p className="text-lg text-gray-900 mt-1">{record.record_type}</p>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-500">Date</h3>
        <p className="text-lg text-gray-900 mt-1">{record.date}</p>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-500">Description</h3>
        <p className="text-gray-900 mt-1">{record.description}</p>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <button 
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Download className="h-5 w-5" />
          Download
        </button>
        <button 
          onClick={onClose}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// Main Medical Records Component
export default function MedicalRecords() {
  const [showUpload, setShowUpload] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const handleUploadSuccess = () => {
    setShowUpload(false);
    // In a real app, you'd refresh the records list here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
            <p className="text-gray-600 mt-2">
              Manage your encrypted health records securely
            </p>
          </div>
          <button 
            onClick={() => setShowUpload(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Upload Record
          </button>
        </div>

        <RecordsList onViewRecord={setSelectedRecord} />

        <Modal
          isOpen={showUpload}
          onClose={() => setShowUpload(false)}
          title="Upload Medical Record"
          size="lg"
        >
          <UploadRecord
            onSuccess={handleUploadSuccess}
            onCancel={() => setShowUpload(false)}
          />
        </Modal>

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
      </div>
    </div>
  );
}