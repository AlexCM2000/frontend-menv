import api from "@/lib/axios";

export const getRecords = async () => {
  try {
    const { data } = await api.get("health-records");
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const createHealthRecord = async (record) => {
  try {
    const { data } = await api.post(`health-records`, record);
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const archivedRecord = async (id) => {
  try {
    const { data } = await api.delete(`health-records/${id}`);
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
