import { useAuth } from '@/hooks/useAuth';
import { FileText, Shield, Brain, Activity, TrendingUp } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      icon: FileText,
      label: 'Medical Records',
      value: '12',
      color: 'bg-blue-100 text-blue-600',
      link: '/medical-records',
    },
    {
      icon: Shield,
      label: 'Active Consents',
      value: '3',
      color: 'bg-green-100 text-green-600',
      link: '/consent-management',
    },
    {
      icon: Brain,
      label: 'AI Insights',
      value: 'Available',
      color: 'bg-purple-100 text-purple-600',
      link: '/ai-insights',
    },
  ];

  const quickActions = [
    { title: 'Upload Record', link: '/medical-records', icon: FileText },
    { title: 'Manage Consent', link: '/consent-management', icon: Shield },
    { title: 'View AI Insights', link: '/ai-insights', icon: Brain },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.full_name}!
        </h1>
        <p className="text-gray-600">
          Manage your health records and stay informed about your health
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Link key={index} to={stat.link}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-8 w-8" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.link}>
              <div className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all cursor-pointer">
                <action.icon className="h-8 w-8 text-primary-600 mb-2" />
                <p className="font-semibold text-gray-900">{action.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </Card>

      {/* Recent Activity */}
      <div className="mt-8">
        <Card title="Recent Activity">
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Activity className="h-5 w-5 text-primary-600" />
              <div>
                <p className="font-medium">Blood Test Results Uploaded</p>
                <p className="text-sm text-gray-600">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Consent Approved for Dr. Smith</p>
                <p className="text-sm text-gray-600">1 day ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Brain className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium">New AI Health Insights Available</p>
                <p className="text-sm text-gray-600">3 days ago</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
