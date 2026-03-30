import api from "@/lib/axios";

export const getDashboardStats = async (params = {}) => {
  const { data } = await api.get("/dashboard", { params });
  return data;
};