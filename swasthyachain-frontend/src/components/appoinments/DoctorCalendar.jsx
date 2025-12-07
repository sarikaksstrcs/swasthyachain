import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, User, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { appointmentService } from '../../services/appoinment.service';


export const DoctorCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointmentCounts, setAppointmentCounts] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayAppointments, setDayAppointments] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    fetchMonthAppointments();
  }, [currentDate]);

  const fetchMonthAppointments = async () => {
    try {
      const data = await appointmentService.getMonthAppointments(year, month + 1);
      
      const counts = {};
      data.forEach(item => {
        counts[item.date.split('T')[0]] = item.count;
      });
      setAppointmentCounts(counts);
    } catch (error) {
      toast.error('Failed to load appointments');
      console.error(error);
    }
  };

  const fetchDayAppointments = async (date) => {
    setLoading(true);
    try {
      const dateStr = date.toISOString().split('T')[0];
      const data = await appointmentService.getDayAppointments(dateStr);
      setDayAppointments(data);
      setSelectedDate(date);
      setShowDetailsModal(true);
    } catch (error) {
      toast.error('Failed to load day appointments');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      await appointmentService.updateAppointmentStatus(appointmentId, status);
      toast.success('Appointment updated');
      fetchDayAppointments(selectedDate);
      fetchMonthAppointments();
    } catch (error) {
      toast.error('Failed to update appointment');
      console.error(error);
    }
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-blue-600" />
            Appointment Calendar
          </h1>
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Today
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <h2 className="text-2xl font-semibold">
            {monthNames[month]} {year}
          </h2>
          
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
          
          {calendarDays.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const date = new Date(year, month, day);
            const dateStr = date.toISOString().split('T')[0];
            const appointmentCount = appointmentCounts[dateStr] || 0;
            const isToday = isCurrentMonth && day === today.getDate();
            const isPast = date < new Date(today.setHours(0, 0, 0, 0));

            return (
              <button
                key={day}
                onClick={() => !isPast && fetchDayAppointments(date)}
                disabled={isPast}
                className={`aspect-square border rounded-lg p-2 transition-all ${
                  isToday
                    ? 'border-blue-500 bg-blue-50'
                    : appointmentCount > 0
                    ? 'border-green-300 bg-green-50 hover:bg-green-100'
                    : 'border-gray-200 hover:bg-gray-50'
                } ${isPast ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex flex-col h-full">
                  <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : ''}`}>
                    {day}
                  </span>
                  {appointmentCount > 0 && (
                    <div className="mt-auto">
                      <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-600 text-white rounded-full">
                        {appointmentCount}
                      </span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {appointmentService.formatDateLong(selectedDate)}
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : dayAppointments.length === 0 ? (
                <p className="text-center text-gray-500 py-12">
                  No appointments scheduled for this day
                </p>
              ) : (
                <div className="space-y-4">
                  {dayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {appointment.patient_name}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="h-4 w-4" />
                                {appointmentService.formatTime(appointment.start_time)} - {appointmentService.formatTime(appointment.end_time)}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2 ml-13">
                            <p className="text-sm">
                              <strong>Reason:</strong> {appointment.reason}
                            </p>
                            {appointment.notes && (
                              <p className="text-sm text-gray-600">
                                <strong>Notes:</strong> {appointment.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${appointmentService.getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                          
                          {appointment.status === 'scheduled' && (
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                          
                          {appointment.status === 'confirmed' && (
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};