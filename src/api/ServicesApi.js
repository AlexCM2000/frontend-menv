import api from "../lib/axios";

export default {
  all() { return api.get("/services"); },
  getServiceCategory(category) { return api.get(`/services/category/${category}`); },
  paginated(params = {}) { return api.get("/services/paginated", { params }); },
  create(data) { return api.post("/services", data); },
  update(id, data) { return api.put(`/services/${id}`, data); },
  remove(id) { return api.delete(`/services/${id}`); },
};
