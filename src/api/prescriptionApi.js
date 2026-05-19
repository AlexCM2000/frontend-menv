import api from "@/lib/axios";

export default {
  getPrescriptions:      (params)     => api.get("/prescriptions", { params }),
  getPrescriptionById:   (id)         => api.get(`/prescriptions/${id}`),
  getByPatient:          (patientId)  => api.get(`/prescriptions/patient/${patientId}`),
  createPrescription:    (data)       => api.post("/prescriptions", data),
  dispenseItems:         (id, data)   => api.put(`/prescriptions/${id}/dispense`, data),
  deletePrescription:    (id)         => api.delete(`/prescriptions/${id}`),
};
