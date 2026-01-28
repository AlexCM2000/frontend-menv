// src/stores/useUserEditorStore.js
import UsersApi from "@/modules/users/api/UsersApi";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useRouter } from "vue-router";

export const useUserEditorStore = defineStore("userEditor", () => {
  const router = useRouter();

  const selectedUser = ref(null);
  const loading = ref(false); // para get
  const saving = ref(false); // para update
  const deleting = ref(false); // para delete
  const errors = ref(null); // para mensajes de validación/errores

  // Cargar un usuario por id
  const loadUser = async (id) => {
    try {
      loading.value = true;
      errors.value = null;
      const { data } = await UsersApi.getById(id);
      selectedUser.value = data;
      return data;
    } catch (error) {
      console.error("loadUser error:", error);
      errors.value = error;
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Actualizar (PATCH)
  const updateUser = async (id, payload) => {
    try {
      saving.value = true;
      errors.value = null;
      const { data } = await UsersApi.update(id, payload);
      // actualizar selectedUser con la respuesta
      selectedUser.value = data;
      return data;
    } catch (error) {
      console.error("updateUser error:", error);
      // si backend devuelve validaciones, guardarlas
      errors.value = error.response?.data ?? error;
      throw error;
    } finally {
      saving.value = false;
    }
  };

  // Eliminar usuario
  const deleteUser = async (id) => {
    try {
      deleting.value = true;
      errors.value = null;
      const res = await UsersApi.delete(id);
      // opcional: navegar o limpiar selectedUser
      selectedUser.value = null;
      return res;
    } catch (error) {
      console.error("deleteUser error:", error);
      errors.value = error.response?.data ?? error;
      throw error;
    } finally {
      deleting.value = false;
    }
  };

  // utilidad: limpiar estado del editor
  const resetEditor = () => {
    selectedUser.value = null;
    errors.value = null;
    loading.value = false;
    saving.value = false;
    deleting.value = false;
  };

  return {
    selectedUser,
    loading,
    saving,
    deleting,
    errors,
    loadUser,
    updateUser,
    deleteUser,
    resetEditor,
  };
});
