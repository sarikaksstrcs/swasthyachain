import api from "./api";

export const appointmentService = {
  // Doctor APIs
  getMonthAppointments: async (year, month) => {
    const response = await api.get(
      `/appointments/appointments/month/${year}/${month}`,
    );
    return response.data;
  },

  getDayAppointments: async (date) => {
    const response = await api.get(`/appointments/appointments/date/${date}`);
    return response.data;
  },

  updateAppointmentStatus: async (appointmentId, status) => {
    const response = await api.put(`/appointments/${appointmentId}/status`, {
      status,
    });
    return response.data;
  },

  // Availability APIs
  createAvailability: async (data) => {
    const response = await api.post("/appointments/availability", data);
    return response.data;
  },

  createBulkAvailability: async (availabilitySlots) => {
    const promises = availabilitySlots.map((slot) =>
      api.post("/appointments/availability", slot),
    );
    return Promise.all(promises);
  },

  getDoctorAvailability: async (doctorId, dateFrom, dateTo) => {
    const response = await api.get(
      `/appointments/availability/${doctorId}?date_from=${dateFrom}&date_to=${dateTo}`,
    );
    return response.data;
  },

  // Patient APIs
  getDoctors: async () => {
    const response = await api.get("/appointments/doctors");
    return response.data;
  },

  bookAppointment: async (data) => {
    const response = await api.post("/appointments/book", data);
    return response.data;
  },

  getMyAppointments: async (status = null) => {
    const url = status
      ? `/appointments/my-appointments?status=${status}`
      : "/appointments/my-appointments";
    const response = await api.get(url);
    return response.data;
  },

  cancelAppointment: async (appointmentId) => {
    const response = await api.put(`/appointments/${appointmentId}/status`, {
      status: "cancelled",
    });
    return response.data;
  },

  // Utility functions
  formatTime: (timeStr) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  },

  formatDate: (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  },

  formatDateLong: (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  },

  getStatusColor: (status) => {
    const colors = {
      scheduled: "bg-blue-100 text-blue-800",
      confirmed: "bg-green-100 text-green-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
      no_show: "bg-orange-100 text-orange-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  },

  generateTimeSlots: (startHour = 9, endHour = 17, intervalMinutes = 30) => {
    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += intervalMinutes) {
        const startTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        const endMinute = minute + intervalMinutes;
        const endHourAdjusted = endMinute >= 60 ? hour + 1 : hour;
        const endMinuteAdjusted = endMinute >= 60 ? 0 : endMinute;
        const endTime = `${endHourAdjusted.toString().padStart(2, "0")}:${endMinuteAdjusted.toString().padStart(2, "0")}`;

        slots.push({ start: startTime, end: endTime });
      }
    }
    return slots;
  },
};
