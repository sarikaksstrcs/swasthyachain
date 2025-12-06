import React, { useState, useEffect } from 'react';
import { recordService } from '../services/recordService';
import { Upload, FileText, Trash2, Eye, Search } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import ConfirmDialog from '../components/common/ConfirmDialog';
import './Pages.css';

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [uploadForm, setUploadForm] = useState({
    file: null,
    record_type: 'lab_report',
    title: '',
    description: '',
  });

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await recordService.getMyRecords();
      setRecords(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      await recordService.uploadRecord(uploadForm.file, {
        record_type: uploadForm.record_type,
        title: uploadForm.title,
        description: uploadForm.description,
      });
      setUploadModalOpen(false);
      loadRecords();
      setUploadForm({
        file: null,
        record_type: 'lab_report',
        title: '',
        description: '',
      });
    } catch (err) {
      alert('Upload failed: ' + err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await recordService.deleteRecord(selectedRecord.id);
      setDeleteModalOpen(false);
      loadRecords();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const filteredRecords = records.filter(
    (record) =>
      record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.record_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner message="Loading medical records..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadRecords} />;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Medical Records</h1>
          <p className="page-subtitle">Manage your health documents securely</p>
        </div>
        <button onClick={() => setUploadModalOpen(true)} className="btn btn-primary">
          <Upload size={18} />
          Upload Record
        </button>
      </div>

      <div className="search-bar">
        <Search size={20} />
        <input
          type="text"
          placeholder="Search records..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="records-grid">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record) => (
            <div key={record.id} className="record-card">
              <div className="record-header">
                <div className="record-icon">
                  <FileText size={24} />
                </div>
                <div className="record-type-badge">{record.record_type}</div>
              </div>
              <h3 className="record-title">{record.title}</h3>
              <p className="record-description">{record.description}</p>
              <div className="record-meta">
                <span>{new Date(record.created_at).toLocaleDateString()}</span>
                {record.encrypted && <span className="encrypted-badge">🔒 Encrypted</span>}
              </div>
              <div className="record-actions">
                <button className="btn-icon" title="View">
                  <Eye size={18} />
                </button>
                <button
                  className="btn-icon btn-danger"
                  onClick={() => {
                    setSelectedRecord(record);
                    setDeleteModalOpen(true);
                  }}
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state-large">
            <FileText size={64} />
            <h3>No records found</h3>
            <p>Upload your first medical record to get started</p>
            <button onClick={() => setUploadModalOpen(true)} className="btn btn-primary">
              <Upload size={18} />
              Upload Record
            </button>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="modal-overlay" onClick={() => setUploadModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Upload Medical Record</h3>
            </div>
            <form onSubmit={handleUpload} className="modal-body">
              <div className="form-group">
                <label className="form-label">Record Type</label>
                <select
                  className="form-input"
                  value={uploadForm.record_type}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, record_type: e.target.value })
                  }
                >
                  <option value="lab_report">Lab Report</option>
                  <option value="prescription">Prescription</option>
                  <option value="imaging">Medical Imaging</option>
                  <option value="diagnosis">Diagnosis</option>
                  <option value="vaccination">Vaccination Record</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={uploadForm.title}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, title: e.target.value })
                  }
                  placeholder="e.g., Blood Test Results"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  value={uploadForm.description}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, description: e.target.value })
                  }
                  placeholder="Additional details..."
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label className="form-label">File</label>
                <input
                  type="file"
                  className="form-input"
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, file: e.target.files[0] })
                  }
                  required
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete Record"
        message={`Are you sure you want to delete "${selectedRecord?.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
        confirmText="Delete"
        danger
      />
    </div>
  );
};

export default MedicalRecords;