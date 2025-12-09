import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  X,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { appointmentService } from "../../services/appoinment.service";

export const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { user } = useAuth();

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const status = filter === "all" ? null : filter;
      const data = await appointmentService.getMyAppointments(status);
      setAppointments(data);
    } catch (error) {
      toast.error("Failed to load appointments");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      await appointmentService.cancelAppointment(appointmentId);
      toast.success("Appointment cancelled");
      fetchAppointments();
    } catch (error) {
      toast.error("Failed to cancel appointment");
      console.error(error);
    }
  };

  const upcomingAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.appointment_date);
    return (
      aptDate >= new Date() && ["scheduled", "confirmed"].includes(apt.status)
    );
  });

  const pastAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.appointment_date);
    return (
      aptDate < new Date() ||
      ["completed", "cancelled", "no_show"].includes(apt.status)
    );
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <Calendar className="h-8 w-8 text-blue-600" />
          My Appointments
        </h1>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          {[
            { value: "all", label: "All" },
            { value: "scheduled", label: "Scheduled" },
            { value: "confirmed", label: "Confirmed" },
            { value: "completed", label: "Completed" },
            { value: "cancelled", label: "Cancelled" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === option.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No appointments found</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Upcoming Appointments */}
            {upcomingAppointments.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Upcoming Appointments
                </h2>
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      userRole={user.role}
                      onCancel={cancelAppointment}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Past Appointments */}
            {pastAppointments.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Past Appointments
                </h2>
                <div className="space-y-4">
                  {pastAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      userRole={user.role}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const AppointmentCard = ({ appointment, userRole, onCancel }) => {
  const canCancel =
    ["scheduled", "confirmed"].includes(appointment.status) &&
    new Date(appointment.appointment_date) >= new Date();

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              {userRole === "patient" ? (
                <Stethoscope className="h-6 w-6 text-blue-600" />
              ) : (
                <User className="h-6 w-6 text-blue-600" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {userRole === "patient"
                  ? appointment.doctor_name
                  : appointment.patient_name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                {appointmentService.formatDateLong(
                  appointment.appointment_date,
                )}
              </div>
            </div>
          </div>

          <div className="ml-15 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Clock className="h-4 w-4" />
              {appointmentService.formatTime(appointment.start_time)} -{" "}
              {appointmentService.formatTime(appointment.end_time)}
            </div>
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

        <div className="flex flex-col items-end gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${appointmentService.getStatusColor(appointment.status)}`}
          >
            {appointment.status}
          </span>

          {canCancel && userRole === "patient" && onCancel && (
            <button
              onClick={() => onCancel(appointment.id)}
              className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
