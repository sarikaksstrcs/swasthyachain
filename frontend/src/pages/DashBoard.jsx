import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { recordService } from '../services/recordService';
import { consentService } from '../services/consentService';
import {
  FileText,
  Shield,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './Pages.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalRecords: 0,
    pendingConsents: 0,
    activeConsents: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [records, consents] = await Promise.all([
        recordService.getMyRecords(),
        consentService.getMyConsents(),
      ]);

      const pendingConsents = consents.filter((c) => c.status === 'pending').length;
      const activeConsents = consents.filter((c) => c.status === 'approved').length;

      setStats({
        totalRecords: records.length,
        pendingConsents,
        activeConsents,
        recentActivity: records.slice(0, 5),
      });
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  const statCards = [
    {
      title: 'Medical Records',
      value: stats.totalRecords,
      icon: FileText,
      color: '#4F46E5',
      bg: '#EEF2FF',
    },
    {
      title: 'Pending Consents',
      value: stats.pendingConsents,
      icon: Clock,
      color: '#F59E0B',
      bg: '#FEF3C7',
    },
    {
      title: 'Active Consents',
      value: stats.activeConsents,
      icon: CheckCircle,
      color: '#10B981',
      bg: '#D1FAE5',
    },
    {
      title: 'Health Score',
      value: '85%',
      icon: Activity,
      color: '#8B5CF6',
      bg: '#F3E8FF',
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Welcome back, {user?.full_name}!</h1>
          <p className="page-subtitle">Here's your health overview</p>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="stat-card">
              <div
                className="stat-icon"
                style={{ background: stat.bg, color: stat.color }}
              >
                <Icon size={24} />
              </div>
              <div className="stat-content">
                <p className="stat-label">{stat.title}</p>
                <h2 className="stat-value">{stat.value}</h2>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3 className="card-title">Recent Activity</h3>
          {stats.recentActivity.length > 0 ? (
            <div className="activity-list">
              {stats.recentActivity.map((record) => (
                <div key={record.id} className="activity-item">
                  <div className="activity-icon">
                    <FileText size={18} />
                  </div>
                  <div className="activity-content">
                    <p className="activity-title">{record.title}</p>
                    <p className="activity-date">
                      {new Date(record.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No recent activity</p>
          )}
        </div>

        <div className="card">
          <h3 className="card-title">Quick Actions</h3>
          <div className="quick-actions">
            <a href="/records" className="quick-action-btn">
              <FileText size={20} />
              <span>Upload Record</span>
            </a>
            <a href="/consents" className="quick-action-btn">
              <Shield size={20} />
              <span>Manage Consents</span>
            </a>
            <a href="/ai-insights" className="quick-action-btn">
              <TrendingUp size={20} />
              <span>View Insights</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;