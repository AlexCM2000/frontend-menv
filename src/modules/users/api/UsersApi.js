// src/api/UsersApi.js
import api from "../../../lib/axios";

export default {
  /**
   * Listar usuarios con paginado y filtros opcionales.
   * params puede contener: page, page_size, search, health, sort, etc.
   */
  list(params = {}) {
    return api.get("/usersList", { params });
  },

  /**
   * Obtener un usuario por id
   */
  getById(id) {
    return api.get(`/usersList/${id}`);
  },

  /**
   * Editar/actualizar un usuario (PATCH)
   * id: string (ej: "6805a12f67be694f03e04241")
   * data: objeto con los campos a actualizar
   */
  update(id, data) {
    console.log("editando usuario id:", id);
    console.log("payload:", data);
    return api.patch(`/usersList/${id}`, data);
  },
};
