import api from "@/lib/axios";

export const getCategories = async (params = {}) => {
  const { data } = await api.get("categories", { params });
  return data;
};

export const createCategory = async (cat) => {
  const { data } = await api.post("categories", cat);
  return data;
};

export const updateCategory = async (id, cat) => {
  const { data } = await api.put(`categories/${id}`, cat);
  return data;
};

export const deleteCategory = async (id) => {
  const { data } = await api.delete(`categories/${id}`);
  return data;
};