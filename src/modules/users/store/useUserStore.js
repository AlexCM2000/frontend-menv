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
  const role = ref(null);
  const verified = ref(null);
  const totalRecords = ref(0);

  // Índice del primer registro de la página (0-indexed para PrimeVue DataTable)
  const page_first = computed(() => (page.value - 1) * page_size.value);

  const fetchUsers = async () => {
    try {
      loading.value = true;
      const params = {
        page: page.value,
        page_size: page_size.value,
        ...(search.value ? { search: search.value } : {}),
        ...(health.value ? { health: health.value } : {}),
        ...(role.value ? { role: role.value } : {}),
        ...(verified.value !== null ? { verified: verified.value } : {}),
      };
      const { data } = await UsersApi.list(params);
      users.value = data.results ?? data.items ?? data;
      totalRecords.value = data.count ?? data.total ?? (Array.isArray(data) ? data.length : 0);
    } catch (error) {
      console.error("fetchUsers error:", error);
    } finally {
      loading.value = false;
    }
  };

  const onPage = async (event) => {
    page.value = event.page + 1;
    page_size.value = event.rows;
    await fetchUsers();
  };

  const onSearch = async (value) => {
    search.value = value && value !== "" ? value : null;
    page.value = 1;
    await fetchUsers();
  };

  const setHealthFilter = async (value) => {
    health.value = value && value !== "" ? value : null;
    page.value = 1;
    await fetchUsers();
  };

  const setRoleFilter = async (value) => {
    role.value = value && value !== "" ? value : null;
    page.value = 1;
    await fetchUsers();
  };

  const setVerifiedFilter = async (value) => {
    verified.value = value !== null && value !== "" ? value : null;
    page.value = 1;
    await fetchUsers();
  };

  const resetFilters = async () => {
    search.value = null;
    health.value = null;
    role.value = null;
    verified.value = null;
    page.value = 1;
    await fetchUsers();
  };

  return {
    users,
    loading,
    page,
    page_size,
    search,
    health,
    role,
    verified,
    totalRecords,
    page_first,
    fetchUsers,
    onPage,
    onSearch,
    setHealthFilter,
    setRoleFilter,
    setVerifiedFilter,
    resetFilters,
  };
});
