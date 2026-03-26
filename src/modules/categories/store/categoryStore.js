import { computed, inject, ref } from "vue";
import { defineStore } from "pinia";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../api/categoriesApi";

export const useCategoryStore = defineStore("categories", () => {
  const categories = ref([]);
  const totalRecords = ref(0);
  const page = ref(1);
  const page_size = ref(10);
  const page_first = computed(() => (page.value - 1) * page_size.value);
  const loading = ref(false);
  const visibleForm = ref(false);
  const currentCategory = ref(null);
  const toast = inject("toast");

  const search = ref("");
  const activeFilter = ref(null);

  const fetchCategories = async () => {
    try {
      loading.value = true;
      const params = {};
      if (search.value && search.value.trim() !== "") params.search = search.value.trim();
      if (activeFilter.value !== null && activeFilter.value !== "") params.active = activeFilter.value;
      const data = await getCategories(params);
      categories.value = data;
      totalRecords.value = data.length;
    } catch (error) {
      console.error(error);
      toast.open({ message: "Error al cargar categorías", type: "error" });
    } finally {
      loading.value = false;
    }
  };

  const onCreateCategory = async (data) => {
    try {
      const result = await createCategory(data);
      toast.open({ message: result.msg, type: "success" });
      closeModal();
      await fetchCategories();
    } catch (error) {
      toast.open({
        message: error.response?.data?.msg || "Error al crear la categoría",
        type: "error",
      });
    }
  };

  const onUpdateCategory = async (data) => {
    try {
      const result = await updateCategory(currentCategory.value._id, data);
      toast.open({ message: result.msg, type: "success" });
      closeModal();
      await fetchCategories();
    } catch (error) {
      toast.open({
        message: error.response?.data?.msg || "Error al actualizar la categoría",
        type: "error",
      });
    }
  };

  const onDeleteCategory = async (id) => {
    try {
      const result = await deleteCategory(id);
      toast.open({ message: result.msg, type: "success" });
      await fetchCategories();
    } catch (error) {
      toast.open({
        message: error.response?.data?.msg || "Error al eliminar la categoría",
        type: "error",
      });
    }
  };

  const onCurrentCategory = (data) => {
    currentCategory.value = data;
    openModal();
  };

  const openModal = () => { visibleForm.value = true; };
  const closeModal = () => {
    visibleForm.value = false;
    currentCategory.value = null;
  };

  return {
    categories,
    totalRecords,
    page,
    page_size,
    page_first,
    loading,
    visibleForm,
    currentCategory,
    search,
    activeFilter,
    fetchCategories,
    onCreateCategory,
    onUpdateCategory,
    onDeleteCategory,
    onCurrentCategory,
    openModal,
    closeModal,
  };
});