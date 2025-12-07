import { useState, useEffect } from 'react';
import { FileText, Shield, Brain, Activity, Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/common/Card';

import toast from 'react-hot-toast';
import { appointmentService } from '../services/appoinment.service';

export const Dashboard = () => {
  const { user } = useAuth();
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
 

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const appointments = await appointmentService.getMyAppointments();
      
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // Filter today's appointments
      const todayApts = appointments.filter(apt => {
          const aptDate = typeof apt.appointment_date === 'string' 
          ? apt.appointment_date 
          : apt.appointment_date.toISOString().split('T')[0];
          return aptDate === todayStr && ['scheduled', 'confirmed'].includes(apt.status);
        });
        
        // Filter upcoming appointments (next 7 days, excluding today)
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        
        const upcomingApts = appointments.filter(apt => {
            const aptDate = typeof apt.appointment_date === 'string'
            ? new Date(apt.appointment_date)
            : apt.appointment_date;
            return aptDate > today && aptDate <= nextWeek && ['scheduled', 'confirmed'].includes(apt.status);
      });
      
      setTodayAppointments(todayApts);
      setUpcomingAppointments(upcomingApts.slice(0, 2)); // Only show next 2
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  // Stats based on real data
  const stats = user?.role === 'doctor' 
    ? [
        {
          icon: Calendar,
          label: 'Today\'s Appointments',
          value: loading ? '...' : todayAppointments.length.toString(),
          color: 'bg-blue-100 text-blue-600',
          link: '/appointments',
        },
        {
          icon: FileText,
          label: 'Patient Records',
          value: '45', // This would come from records API
          color: 'bg-green-100 text-green-600',
          link: '/medical-records',
        },
        {
          icon: Shield,
          label: 'Active Consents',
          value: '12', // This would come from consent API
          color: 'bg-purple-100 text-purple-600',
          link: '/consent-management',
        },
      ]
    : [
        {
          icon: FileText,
          label: 'Medical Records',
          value: '12', // This would come from records API
          color: 'bg-blue-100 text-blue-600',
          link: '/medical-records',
        },
        {
          icon: Calendar,
          label: 'Upcoming Appointments',
          value: loading ? '...' : upcomingAppointments.length+todayAppointments.length,
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
        { title: 'Upload Record', link: '/medical-records/upload', icon: FileText },
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
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.length === 0 || todayAppointments.length===0? (
                  <div className="text-center py-8">
                    <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No upcoming appointments</p>
                    <Link 
                      to="/appointments/book" 
                      className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Book Your First Appointment
                    </Link>
                  </div>
                ) : (
                  <>
                  {todayAppointments.map((appointment, index) => {
                      const colors = ['blue', 'green', 'purple'];
                      const color = colors[index % colors.length];
                      
                      return (
                        <div 
                          key={appointment.id} 
                          className={`flex items-center justify-between p-4 bg-${color}-50 rounded-lg border border-${color}-200`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 bg-${color}-100 rounded-full flex items-center justify-center`}>
                              <Calendar className={`h-6 w-6 text-${color}-600`} />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{appointment.doctor_name}</p>
                              <p className="text-sm text-gray-600">{appointment.reason}</p>
                              <p className={`text-sm text-${color}-600 font-medium mt-1`}>
                                {appointmentService.formatDateLong(appointment.appointment_date)} at {appointmentService.formatTime(appointment.start_time)}
                              </p>
                            </div>
                          </div>
                          <Link 
                            to="/appointments" 
                            className={`px-4 py-2 bg-${color}-600 text-white rounded-lg hover:bg-${color}-700 transition-colors text-sm font-medium`}
                          >
                            View Details
                          </Link>
                        </div>
                      );
                    })}
                    
                    {upcomingAppointments.map((appointment, index) => {
                      const colors = ['blue', 'green', 'purple'];
                      const color = colors[index % colors.length];
                      
                      return (
                        <div 
                          key={appointment.id} 
                          className={`flex items-center justify-between p-4 bg-${color}-50 rounded-lg border border-${color}-200`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 bg-${color}-100 rounded-full flex items-center justify-center`}>
                              <Calendar className={`h-6 w-6 text-${color}-600`} />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{appointment.doctor_name}</p>
                              <p className="text-sm text-gray-600">{appointment.reason}</p>
                              <p className={`text-sm text-${color}-600 font-medium mt-1`}>
                                {appointmentService.formatDateLong(appointment.appointment_date)} at {appointmentService.formatTime(appointment.start_time)}
                              </p>
                            </div>
                          </div>
                          <Link 
                            to="/appointments" 
                            className={`px-4 py-2 bg-${color}-600 text-white rounded-lg hover:bg-${color}-700 transition-colors text-sm font-medium`}
                          >
                            View Details
                          </Link>
                        </div>
                      );
                    })}
                    <Link to="/appointments" className="block">
                      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center cursor-pointer">
                        <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="font-semibold text-gray-700">Book New Appointment</p>
                      </div>
                    </Link>
                  </>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Today's Schedule (for doctors) */}
      {user?.role === 'doctor' && (
        <div className="mt-8">
          <Card title="Today's Schedule">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {todayAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No appointments scheduled for today</p>
                    <p className="text-sm text-gray-400 mb-4">Set your availability to allow patients to book appointments</p>
                    <Link 
                      to="/appointments/availability" 
                      className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Set Availability
                    </Link>
                  </div>
                ) : (
                  <>
                    {todayAppointments.map((appointment, index) => {
                      const borderColors = ['border-blue-600', 'border-green-600', 'border-purple-600'];
                      const bgColors = ['bg-blue-50', 'bg-green-50', 'bg-purple-50'];
                      const statusColors = {
                        confirmed: 'bg-green-100 text-green-700',
                        scheduled: 'bg-blue-100 text-blue-700'
                      };
                      
                      return (
                        <div 
                          key={appointment.id} 
                          className={`flex items-center gap-4 p-4 ${bgColors[index % bgColors.length]} rounded-lg border-l-4 ${borderColors[index % borderColors.length]}`}
                        >
                          <div className="text-center min-w-[60px]">
                            <p className="text-sm text-gray-600">
                              {appointmentService.formatTime(appointment.start_time).split(' ')[0]}
                            </p>
                            <p className="text-xs text-gray-500">
                              {appointmentService.formatTime(appointment.start_time).split(' ')[1]}
                            </p>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{appointment.patient_name}</p>
                            <p className="text-sm text-gray-600">{appointment.reason}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[appointment.status] || 'bg-gray-100 text-gray-700'}`}>
                            {appointment.status}
                          </span>
                        </div>
                      );
                    })}
                    <Link to="/appointments" className="block">
                      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center cursor-pointer">
                        <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="font-semibold text-gray-700">View Full Calendar</p>
                      </div>
                    </Link>
                  </>
                )}
              </div>
            )}
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