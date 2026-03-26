import api from "@/lib/axios";

export const getServicesPaginated = async (params = {}) => {
  const { data } = await api.get("services/paginated", { params });
  return data;
};

export const createService = async (s) => {
  const { data } = await api.post("services", s);
  return data;
};

export const updateService = async (id, s) => {
  const { data } = await api.put(`services/${id}`, s);
  return data;
};

export const deleteService = async (id) => {
  const { data } = await api.delete(`services/${id}`);
  return data;
};

export const getCategories = async () => {
  const { data } = await api.get("categories", { params: { active: true } });
  return data;
};