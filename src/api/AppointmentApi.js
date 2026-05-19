import api from "../lib/axios";

export default {
  create(data) {
    return api.post("/appointments", data);
  },
  getByDate(date) {
    return api.get(`/appointments?date=${date}`);
  },
  getUserAppointments(userId, params) {
    return api.get(`/users/${userId.id}/appointments`, { params });
  },
  getById(userId) {
    return api.get(`/appointments/${userId}`);
  },
  update(id, data) {
    return api.patch(`/appointments/${id}`, data);
  },
  delete(id) {
    return api.delete(`/appointments/${id}`);
  },
  getCalendar(start, end) {
    return api.get(`/appointments/calendar?start=${start}&end=${end}`);
  },
  getAvailability(date, category, excludeId = null, doctorId = null) {
    const params = { date, category };
    if (excludeId) params.excludeId = excludeId;
    if (doctorId) params.doctorId = doctorId;
    return api.get("/appointments/availability", { params });
  },
};
