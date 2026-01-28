// src/stores/useUsersStore.js
import UsersApi from "@/modules/users/api/UsersApi";
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useUsersStore = defineStore("users", () => {
  const users = ref([]);
  const loading = ref(false);
  const page = ref(1);
  const page_size = ref(10);
  const search = ref(null);
  const health = ref(null);
  const totalRecords = ref(0);

  // calcular índice del primer registro de la página (útil para tablas)
  const page_first = computed(() => (page.value - 1) * page_size.value + 1);

  // Traer la lista de usuarios con los params actuales
  const fetchUsers = async () => {
    try {
      loading.value = true;

      // construir params dinámicamente (no incluir null/undefined)
      const params = {
        page: page.value,
        page_size: page_size.value,
        ...(search.value ? { search: search.value } : {}),
        ...(health.value ? { health: health.value } : {}),
      };

      const { data } = await UsersApi.list(params);
      // Asumiendo estructura tipo: { results: [...], count: xxx }
      users.value = data.results ?? data.items ?? data; // tolerante a varias respuestas
      totalRecords.value =
        data.count ?? data.total ?? (Array.isArray(data) ? data.length : 0);
    } catch (error) {
      console.error("fetchUsers error:", error);
    } finally {
      loading.value = false;
    }
  };

  // handlers para UI (primevue/paginador)
  const onPage = async (event) => {
    // event.page (0-indexed), event.rows
    page.value = event.page + 1;
    page_size.value = event.rows;
    await fetchUsers();
  };

  const onSearch = async (value) => {
    search.value = value && value !== "" ? value : null;
    page.value = 1; // reiniciar a primera página
    await fetchUsers();
  };

  const setHealthFilter = async (value) => {
    health.value = value && value !== "" ? value : null;
    page.value = 1;
    await fetchUsers();
  };

  const resetFilters = async () => {
    search.value = null;
    health.value = null;
    page.value = 1;
    await fetchUsers();
  };

  // inicializar opcionalmente (no lo hacemos automáticamente)
  // onMounted(() => fetchUsers()); // si quieres auto-cargar en componentes montar

  return {
    users,
    loading,
    page,
    page_size,
    search,
    health,
    totalRecords,
    page_first,
    fetchUsers,
    onPage,
    onSearch,
    setHealthFilter,
    resetFilters,
  };
});
