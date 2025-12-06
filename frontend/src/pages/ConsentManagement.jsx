import React, { useState, useEffect } from 'react';
import { consentService } from '../services/consentService';
import { Shield, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import './Pages.css';

const ConsentManagement = () => {
  const [consents, setConsents] = useState([]);
  const [pendingConsents, setPendingConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedConsent, setSelectedConsent] = useState(null);
  const [actionType, setActionType] = useState(null);

  useEffect(() => {
    loadConsents();
  }, []);

  const loadConsents = async () => {
    try {
      setLoading(true);
      const [allConsents, pending] = await Promise.all([
        consentService.getMyConsents(),
        consentService.getPendingConsents(),
      ]);
      setConsents(allConsents);
      setPendingConsents(pending);
    } catch (error) {
      console.error('Failed to load consents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await consentService.approveConsent(selectedConsent.id);
      loadConsents();
      setSelectedConsent(null);
    } catch (error) {
      alert('Failed to approve consent');
    }
  };

  const handleDeny = async () => {
    try {
      await consentService.denyConsent(selectedConsent.id);
      loadConsents();
      setSelectedConsent(null);
    } catch (error) {
      alert('Failed to deny consent');
    }
  };

  const handleRevoke = async () => {
    try {
      await consentService.revokeConsent(selectedConsent.id);
      loadConsents();
      setSelectedConsent(null);
    } catch (error) {
      alert('Failed to revoke consent');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={20} className="status-icon-pending" />;
      case 'approved':
        return <CheckCircle size={20} className="status-icon-approved" />;
      case 'denied':
        return <XCircle size={20} className="status-icon-denied" />;
      case 'revoked':
        return <AlertCircle size={20} className="status-icon-revoked" />;
      default:
        return null;
    }
  };

  const getStatusClass = (status) => {
    return `consent-status status-${status}`;
  };

  const filteredConsents = activeTab === 'pending' ? pendingConsents : consents;

  if (loading) {
    return <LoadingSpinner message="Loading consents..." />;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Consent Management</h1>
          <p className="page-subtitle">Control who can access your medical records</p>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Consents ({consents.length})
        </button>
        <button
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending ({pendingConsents.length})
        </button>
      </div>

      <div className="consents-list">
        {filteredConsents.length > 0 ? (
          filteredConsents.map((consent) => (
            <div key={consent.id} className="consent-card card">
              <div className="consent-header">
                <div className="consent-info">
                  <h3>{consent.doctor_name || 'Doctor'}</h3>
                  <p className="consent-reason">{consent.reason}</p>
                </div>
                <div className={getStatusClass(consent.status)}>
                  {getStatusIcon(consent.status)}
                  <span>{consent.status}</span>
                </div>
              </div>

              <div className="consent-details">
                <div className="consent-detail-item">
                  <span className="detail-label">Access Type:</span>
                  <span className="detail-value">{consent.access_type}</span>
                </div>
                <div className="consent-detail-item">
                  <span className="detail-label">Duration:</span>
                  <span className="detail-value">{consent.duration_hours} hours</span>
                </div>
                <div className="consent-detail-item">
                  <span className="detail-label">Requested:</span>
                  <span className="detail-value">
                    {new Date(consent.created_at).toLocaleDateString()}
                  </span>
                </div>
                {consent.expires_at && (
                  <div className="consent-detail-item">
                    <span className="detail-label">Expires:</span>
                    <span className="detail-value">
                      {new Date(consent.expires_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="consent-actions">
                {consent.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedConsent(consent);
                        setActionType('approve');
                      }}
                      className="btn btn-primary"
                    >
                      <CheckCircle size={16} />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedConsent(consent);
                        setActionType('deny');
                      }}
                      className="btn btn-danger"
                    >
                      <XCircle size={16} />
                      Deny
                    </button>
                  </>
                )}
                {consent.status === 'approved' && (
                  <button
                    onClick={() => {
                      setSelectedConsent(consent);
                      setActionType('revoke');
                    }}
                    className="btn btn-secondary"
                  >
                    <AlertCircle size={16} />
                    Revoke Access
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state-large">
            <Shield size={64} />
            <h3>No consents found</h3>
            <p>
              {activeTab === 'pending'
                ? 'You have no pending consent requests'
                : 'No consent requests yet'}
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={actionType === 'approve'}
        title="Approve Consent"
        message={`Allow access to your medical records for ${selectedConsent?.duration_hours} hours?`}
        onConfirm={handleApprove}
        onCancel={() => {
          setSelectedConsent(null);
          setActionType(null);
        }}
        confirmText="Approve"
      />

      <ConfirmDialog
        isOpen={actionType === 'deny'}
        title="Deny Consent"
        message="Are you sure you want to deny this consent request?"
        onConfirm={handleDeny}
        onCancel={() => {
          setSelectedConsent(null);
          setActionType(null);
        }}
        confirmText="Deny"
        danger
      />

      <ConfirmDialog
        isOpen={actionType === 'revoke'}
        title="Revoke Consent"
        message="Are you sure you want to revoke this consent? The doctor will lose access immediately."
        onConfirm={handleRevoke}
        onCancel={() => {
          setSelectedConsent(null);
          setActionType(null);
        }}
        confirmText="Revoke"
        danger
      />
    </div>
  );
};

export default ConsentManagement;