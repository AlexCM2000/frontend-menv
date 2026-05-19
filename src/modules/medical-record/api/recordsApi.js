import api from "@/lib/axios";

export const getRecords = async (params = {}) => {
  const { data } = await api.get("health-records", { params });
  return data;
};

export const getRecordById = async (id) => {
  const { data } = await api.get(`health-records/${id}`);
  return data;
};

export const getRecordByAppointment = async (appointmentId) => {
  const { data } = await api.get(`health-records/by-appointment/${appointmentId}`);
  return data;
};

export const createHealthRecord = async (record) => {
  const { data } = await api.post("health-records", record);
  return data;
};

export const updateRecordState = async (id, state) => {
  const { data } = await api.patch(`health-records/${id}/state`, { state });
  return data;
};

export const archivedRecord = async (id) => {
  const { data } = await api.delete(`health-records/${id}`);
  return data;
};

export const unarchiveRecord = async (id) => {
  const { data } = await api.patch(`health-records/${id}/unarchive`);
  return data;
};

// Subdocumentos clínicos
export const addObservation = async (id, payload) => {
  const { data } = await api.post(`health-records/${id}/observations`, payload);
  return data;
};

export const addDiagnosis = async (id, payload) => {
  const { data } = await api.post(`health-records/${id}/diagnoses`, payload);
  return data;
};

export const addMedication = async (id, payload) => {
  const { data } = await api.post(`health-records/${id}/medications`, payload);
  return data;
};

export const addTreatment = async (id, payload) => {
  const { data } = await api.post(`health-records/${id}/previous-treatments`, payload);
  return data;
};

export const addAllergy = async (id, payload) => {
  const { data } = await api.post(`health-records/${id}/allergies`, payload);
  return data;
};

export const addVitalSigns = async (id, payload) => {
  const { data } = await api.post(`health-records/${id}/vital-signs`, payload);
  return data;
};

export const addVaccine = async (id, payload) => {
  const { data } = await api.post(`health-records/${id}/vaccines`, payload);
  return data;
};

export const downloadHealthRecordPDF = async (id) => {
  const { data } = await api.get(`health-records/${id}/report`, { responseType: "blob" });
  return data;
};