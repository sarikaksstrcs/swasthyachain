import { FileText, Shield, Brain, Activity, Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/common/Card';

export const Dashboard = () => {
  const { user } = useAuth();

  // Different stats based on user role
  const stats = user?.role === 'doctor' 
    ? [
        {
          icon: Calendar,
          label: 'Today\'s Appointments',
          value: '8',
          color: 'bg-blue-100 text-blue-600',
          link: '/appointments',
        },
        {
          icon: FileText,
          label: 'Patient Records',
          value: '45',
          color: 'bg-green-100 text-green-600',
          link: '/medical-records',
        },
        {
          icon: Shield,
          label: 'Active Consents',
          value: '12',
          color: 'bg-purple-100 text-purple-600',
          link: '/consent-management',
        },
      ]
    : [
        {
          icon: FileText,
          label: 'Medical Records',
          value: '12',
          color: 'bg-blue-100 text-blue-600',
          link: '/medical-records',
        },
        {
          icon: Calendar,
          label: 'Upcoming Appointments',
          value: '2',
          color: 'bg-green-100 text-green-600',
          link: '/appointments',
        },
        {
          icon: Brain,
          label: 'AI Insights',
          value: 'Available',
          color: 'bg-purple-100 text-purple-600',
          link: '/ai-insights',
        },
      ];

  const quickActions = user?.role === 'doctor'
    ? [
        { title: 'View Calendar', link: '/appointments', icon: Calendar },
        { title: 'Set Availability', link: '/appointments', icon: Clock },
        { title: 'Patient Records', link: '/medical-records', icon: FileText },
      ]
    : [
        { title: 'Book Appointment', link: '/appointments', icon: Calendar },
        { title: 'Upload Record', link: '/medical-records', icon: FileText },
        { title: 'View AI Insights', link: '/ai-insights', icon: Brain },
      ];

  const recentActivity = user?.role === 'doctor'
    ? [
        {
          icon: Calendar,
          color: 'text-blue-600',
          title: 'Appointment Confirmed',
          description: 'John Doe - 10:00 AM Today',
          time: '30 minutes ago',
        },
        {
          icon: FileText,
          color: 'text-green-600',
          title: 'New Patient Record',
          description: 'Lab results uploaded by hospital',
          time: '2 hours ago',
        },
        {
          icon: Shield,
          color: 'text-purple-600',
          title: 'Consent Request Approved',
          description: 'Patient granted access to records',
          time: '1 day ago',
        },
      ]
    : [
        {
          icon: Calendar,
          color: 'text-blue-600',
          title: 'Appointment Scheduled',
          description: 'Dr. Smith - Dec 10, 10:00 AM',
          time: '1 hour ago',
        },
        {
          icon: Activity,
          color: 'text-green-600',
          title: 'Blood Test Results Uploaded',
          description: 'New lab report available',
          time: '2 hours ago',
        },
        {
          icon: Brain,
          color: 'text-purple-600',
          title: 'New AI Health Insights Available',
          description: 'Check your personalized recommendations',
          time: '3 days ago',
        },
      ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.full_name}!
        </h1>
        <p className="text-gray-600">
          {user?.role === 'doctor' 
            ? 'Manage your appointments and patient records'
            : 'Manage your health records and appointments'}
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
              <div className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer">
                <action.icon className="h-8 w-8 text-blue-600 mb-2" />
                <p className="font-semibold text-gray-900">{action.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </Card>

      {/* Upcoming Appointments Widget (for patients) */}
      {user?.role === 'patient' && (
        <div className="mt-8">
          <Card title="Upcoming Appointments">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Dr. Sarah Smith</p>
                    <p className="text-sm text-gray-600">Cardiology Checkup</p>
                    <p className="text-sm text-blue-600 font-medium mt-1">
                      Dec 10, 2025 at 10:00 AM
                    </p>
                  </div>
                </div>
                <Link 
                  to="/appointments" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  View Details
                </Link>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Dr. John Doe</p>
                    <p className="text-sm text-gray-600">Follow-up Consultation</p>
                    <p className="text-sm text-green-600 font-medium mt-1">
                      Dec 15, 2025 at 2:30 PM
                    </p>
                  </div>
                </div>
                <Link 
                  to="/appointments" 
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  View Details
                </Link>
              </div>
              <Link to="/appointments" className="block">
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center cursor-pointer">
                  <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="font-semibold text-gray-700">Book New Appointment</p>
                </div>
              </Link>
            </div>
          </Card>
        </div>
      )}

      {/* Today's Schedule (for doctors) */}
      {user?.role === 'doctor' && (
        <div className="mt-8">
          <Card title="Today's Schedule">
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-600">
                <div className="text-center min-w-[60px]">
                  <p className="text-sm text-gray-600">09:00</p>
                  <p className="text-xs text-gray-500">AM</p>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">John Smith</p>
                  <p className="text-sm text-gray-600">General Checkup</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  Confirmed
                </span>
              </div>
              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-600">
                <div className="text-center min-w-[60px]">
                  <p className="text-sm text-gray-600">10:30</p>
                  <p className="text-xs text-gray-500">AM</p>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Alice Johnson</p>
                  <p className="text-sm text-gray-600">Follow-up Consultation</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  Scheduled
                </span>
              </div>
              <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-600">
                <div className="text-center min-w-[60px]">
                  <p className="text-sm text-gray-600">02:00</p>
                  <p className="text-xs text-gray-500">PM</p>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Robert Brown</p>
                  <p className="text-sm text-gray-600">Lab Results Discussion</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  Confirmed
                </span>
              </div>
              <Link to="/appointments" className="block">
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center cursor-pointer">
                  <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="font-semibold text-gray-700">View Full Calendar</p>
                </div>
              </Link>
            </div>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      <div className="mt-8">
        <Card title="Recent Activity">
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <activity.icon className={`h-5 w-5 ${activity.color}`} />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                </div>
                <p className="text-sm text-gray-500">{activity.time}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};