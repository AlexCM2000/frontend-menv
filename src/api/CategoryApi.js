import api from "@/lib/axios";

export default {
  getAll(params = {}) { return api.get("/categories", { params }); },
  getById(id) { return api.get(`/categories/${id}`); },
  create(data) { return api.post("/categories", data); },
  update(id, data) { return api.put(`/categories/${id}`, data); },
  remove(id) { return api.delete(`/categories/${id}`); },
};