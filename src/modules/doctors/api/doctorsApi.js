import api from "@/lib/axios";

export const getDoctors = async (params = {}) => {
  try {
    const { data } = await api.get("doctors", { params });
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getDoctorsForSelect = async (params = {}) => {
  try {
    const { data } = await api.get("doctors/select", { params });
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getDoctorById = async (id) => {
  try {
    const { data } = await api.get(`doctors/${id}`);
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const createDoctor = async (doctor) => {
  try {
    const { data } = await api.post("doctors", doctor);
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateDoctor = async (id, doctor) => {
  try {
    const { data } = await api.put(`doctors/${id}`, doctor);
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const toggleDoctorStatus = async (id) => {
  try {
    const { data } = await api.patch(`doctors/${id}/toggle-status`);
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
