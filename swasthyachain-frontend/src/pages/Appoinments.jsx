import { useState } from 'react';
import { Calendar, Clock, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';


import { AppointmentBooking } from '../components/appoinments/AppoinmentBooking';
import { DoctorCalendar } from '../components/appoinments/DoctorCalendar';
import { MyAppointments } from '../components/appoinments/MyAppoinments';
import { DoctorAvailability } from '../components/appoinments/DoctorAvailability';

export const Appointments = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(
    user?.role === 'doctor' ? 'calendar' : 'book'
  );

  const tabs = user?.role === 'doctor' 
    ? [
        { id: 'calendar', label: 'Calendar', icon: Calendar },
        { id: 'appointments', label: 'My Appointments', icon: Clock },
        { id: 'availability', label: 'Set Availability', icon: User }
      ]
    : [
        { id: 'book', label: 'Book Appointment', icon: Calendar },
        { id: 'appointments', label: 'My Appointments', icon: Clock }
      ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-6">
          <div className="flex space-x-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          {user?.role === 'doctor' ? (
            <>
              {activeTab === 'calendar' && <DoctorCalendar />}
              {activeTab === 'appointments' && <MyAppointments />}
              {activeTab === 'availability' && <DoctorAvailability />}
            </>
          ) : (
            <>
              {activeTab === 'book' && <AppointmentBooking />}
              {activeTab === 'appointments' && <MyAppointments />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};