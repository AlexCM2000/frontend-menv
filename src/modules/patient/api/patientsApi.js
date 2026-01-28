import api from "@/lib/axios";

export const getPatients = async () => {
  try {
    const { data } = await api.get("patient");
    console.log(data);
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const updatePatient = async (id, patient) => {
  try {
    const { data } = await api.put(`patient/${id}`, patient);
    console.log(data);
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const createPatient = async (patient) => {
  try {
    const { data } = await api.post(`patient`, patient);
    console.log(data);
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deletePatient = async (id) => {
  try {
    const { data } = await api.delete(`patient/${id}`);
    console.log(data);
    return data;
  } catch (error) {
    console.log(error);
  }
};
