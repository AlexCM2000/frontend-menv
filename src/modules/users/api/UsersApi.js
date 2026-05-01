// src/api/UsersApi.js
import api from "../../../lib/axios";

export default {
  list(params = {}) {
    return api.get("/usersList", { params });
  },

  getById(id) {
    return api.get(`/usersList/${id}`);
  },

  create(data) {
    return api.post("/usersList", data);
  },

  update(id, data) {
    return api.patch(`/usersList/${id}`, data);
  },
};
