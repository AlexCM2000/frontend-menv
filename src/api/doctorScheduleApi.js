import api from "@/lib/axios";

export default {
  getSchedules: (doctorId) => api.get(`doctors/${doctorId}/schedules`),
  saveSchedules: (doctorId, schedules) => api.put(`doctors/${doctorId}/schedules`, { schedules }),
};
