import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Search,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { appointmentService } from "../../services/appoinment.service";

export const AppointmentBooking = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      fetchAvailableSlots(selectedDoctor.id);
    }
  }, [selectedDoctor]);

  const fetchDoctors = async () => {
    try {
      const data = await appointmentService.getDoctors();
      setDoctors(data);
    } catch (error) {
      toast.error("Failed to load doctors");
      console.error(error);
    }
  };

  const fetchAvailableSlots = async (doctorId) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const data = await appointmentService.getDoctorAvailability(
        doctorId,
        today,
        nextMonth.toISOString().split("T")[0],
      );
      setAvailableSlots(data);
    } catch (error) {
      toast.error("Failed to load available slots");
      console.error(error);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedSlot || !reason.trim()) {
      toast.error("Please select a slot and provide a reason");
      return;
    }

    setLoading(true);
    try {
      await appointmentService.bookAppointment({
        doctor_id: selectedDoctor.id,
        slot_id: selectedSlot.id,
        reason,
        notes,
      });

      toast.success("Appointment booked successfully!");
      setSelectedDoctor(null);
      setSelectedSlot(null);
      setReason("");
      setNotes("");
    } catch (error) {
      const errorMsg =
        error.response?.data?.detail || "Failed to book appointment";
      toast.error(errorMsg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(
    (doc) =>
      doc.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <Calendar className="h-8 w-8 text-blue-600" />
          Book Appointment
        </h1>

        {/* Step 1: Select Doctor */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5" />
            Step 1: Select a Doctor
          </h2>

          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {filteredDoctors.map((doctor) => (
              <button
                key={doctor.id}
                onClick={() => setSelectedDoctor(doctor)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  selectedDoctor?.id === doctor.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Stethoscope className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {doctor.full_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {doctor.specialization}
                    </p>
                    {doctor.phone && (
                      <p className="text-xs text-gray-500 mt-1">
                        {doctor.phone}
                      </p>
                    )}
                  </div>
                  {selectedDoctor?.id === doctor.id && (
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Select Time Slot */}
        {selectedDoctor && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Step 2: Select a Time Slot
            </h2>

            {availableSlots.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No available slots for this doctor in the next month
              </p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {Object.entries(
                  availableSlots.reduce((acc, slot) => {
                    const date = slot.date;
                    if (!acc[date]) acc[date] = [];
                    acc[date].push(slot);
                    return acc;
                  }, {}),
                ).map(([date, slots]) => (
                  <div
                    key={date}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <h3 className="font-medium text-gray-900 mb-3">
                      {appointmentService.formatDate(date)}
                    </h3>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                      {slots.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedSlot(slot)}
                          className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                            selectedSlot?.id === slot.id
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {appointmentService.formatTime(slot.start_time)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Provide Details */}
        {selectedSlot && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">
              Step 3: Appointment Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Visit *
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="E.g., Regular checkup, Follow-up consultation"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional information for the doctor..."
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Book Button */}
        {selectedSlot && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">
              Appointment Summary
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <strong>Doctor:</strong> {selectedDoctor.full_name}
              </p>
              <p>
                <strong>Specialization:</strong> {selectedDoctor.specialization}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {appointmentService.formatDate(selectedSlot.date)}
              </p>
              <p>
                <strong>Time:</strong>{" "}
                {appointmentService.formatTime(selectedSlot.start_time)} -{" "}
                {appointmentService.formatTime(selectedSlot.end_time)}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleBookAppointment}
          disabled={!selectedSlot || !reason.trim() || loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Booking...
            </>
          ) : (
            <>
              <Calendar className="h-5 w-5" />
              Confirm Booking
            </>
          )}
        </button>
      </div>
    </div>
  );
};
