import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, Phone, Shield } from 'lucide-react';
import './Pages.css';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Profile</h1>
        <p className="page-subtitle">Manage your account information</p>
      </div>

      <div className="profile-grid">
        <div className="card">
          <div className="profile-avatar-large">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <h2 className="profile-name">{user?.full_name}</h2>
          <span className="profile-role-badge">{user?.role}</span>
        </div>

        <div className="card">
          <h3 className="card-title">Account Information</h3>
          <div className="info-list">
            <div className="info-item">
              <div className="info-icon">
                <Mail size={20} />
              </div>
              <div>
                <p className="info-label">Email</p>
                <p className="info-value">{user?.email}</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <Phone size={20} />
              </div>
              <div>
                <p className="info-label">Phone</p>
                <p className="info-value">{user?.phone || 'Not provided'}</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <Shield size={20} />
              </div>
              <div>
                <p className="info-label">Blockchain Address</p>
                <p className="info-value blockchain-address">
                  {user?.blockchain_address || 'Not generated'}
                </p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <User size={20} />
              </div>
              <div>
                <p className="info-label">Member Since</p>
                <p className="info-value">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;