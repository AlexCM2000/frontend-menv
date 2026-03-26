import { computed, inject, ref } from "vue";
import { defineStore } from "pinia";
import {
  getServicesPaginated,
  createService,
  updateService,
  deleteService,
  getCategories,
} from "../api/servicesAdminApi";

export const useServicesAdminStore = defineStore("servicesAdmin", () => {
  const services = ref([]);
  const totalRecords = ref(0);
  const page = ref(1);
  const page_size = ref(10);
  const page_first = computed(() => (page.value - 1) * page_size.value);
  const loading = ref(false);
  const visibleForm = ref(false);
  const currentService = ref(null);
  const toast = inject("toast");

  const search = ref("");
  const categoryFilter = ref(null);
  const availableCategories = ref([]);

  const fetchServices = async () => {
    try {
      loading.value = true;
      const params = {
        page: page.value,
        page_size: page_size.value,
      };
      if (search.value && search.value.trim() !== "") params.search = search.value.trim();
      if (categoryFilter.value) params.category = categoryFilter.value;

      const data = await getServicesPaginated(params);
      services.value = data.results;
      totalRecords.value = data.count;
      page.value = data.page;
      page_size.value = data.page_size;
    } catch (error) {
      console.error(error);
      toast.open({ message: "Error al cargar servicios", type: "error" });
    } finally {
      loading.value = false;
    }
  };

  const loadCategories = async () => {
    try {
      availableCategories.value = await getCategories();
    } catch (error) {
      console.error(error);
    }
  };

  const onPage = async (event) => {
    page.value = event.page + 1;
    page_size.value = event.rows;
    await fetchServices();
  };

  const onCreateService = async (data) => {
    try {
      const result = await createService(data);
      toast.open({ message: result.msg, type: "success" });
      closeModal();
      await fetchServices();
    } catch (error) {
      toast.open({
        message: error.response?.data?.msg || "Error al crear el servicio",
        type: "error",
      });
    }
  };

  const onUpdateService = async (data) => {
    try {
      const result = await updateService(currentService.value._id, data);
      toast.open({ message: result.msg, type: "success" });
      closeModal();
      await fetchServices();
    } catch (error) {
      toast.open({
        message: error.response?.data?.msg || "Error al actualizar el servicio",
        type: "error",
      });
    }
  };

  const onDeleteService = async (id) => {
    try {
      const result = await deleteService(id);
      toast.open({ message: result.msg, type: "success" });
      await fetchServices();
    } catch (error) {
      toast.open({
        message: error.response?.data?.msg || "Error al eliminar el servicio",
        type: "error",
      });
    }
  };

  const onCurrentService = (data) => {
    currentService.value = data;
    openModal();
  };

  const openModal = () => { visibleForm.value = true; };
  const closeModal = () => {
    visibleForm.value = false;
    currentService.value = null;
  };

  return {
    services,
    totalRecords,
    page,
    page_size,
    page_first,
    loading,
    visibleForm,
    currentService,
    search,
    categoryFilter,
    availableCategories,
    fetchServices,
    loadCategories,
    onPage,
    onCreateService,
    onUpdateService,
    onDeleteService,
    onCurrentService,
    openModal,
    closeModal,
  };
});