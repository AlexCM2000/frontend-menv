import { ref, computed, inject } from "vue";
import { defineStore } from "pinia";
import StockApi from "@/api/stockApi";

export const useStockStore = defineStore("stock", () => {
  const toast    = inject("toast");
  const items    = ref([]);
  const loading  = ref(false);
  const saving   = ref(false);
  const total    = ref(0);
  const page     = ref(1);
  const pageSize = ref(20);
  const search   = ref("");
  const filterActive = ref("true");

  const pageFirst = computed(() => (page.value - 1) * pageSize.value);

  const loadStock = async (extraParams = {}) => {
    try {
      loading.value = true;
      const { data } = await StockApi.getStock({
        page: page.value,
        page_size: pageSize.value,
        ...(search.value && { search: search.value }),
        ...(filterActive.value !== "" && { active: filterActive.value }),
        ...extraParams,
      });
      items.value = data.results;
      total.value = data.count;
    } catch (error) {
      toast.open({ message: "Error al cargar stock", type: "error" });
    } finally {
      loading.value = false;
    }
  };

  const createStock = async (formData) => {
    try {
      saving.value = true;
      const { data } = await StockApi.createStock(formData);
      toast.open({ message: "Medicamento creado correctamente", type: "success" });
      return data;
    } catch (error) {
      const msg = error?.response?.data?.msg ?? "Error al crear medicamento";
      toast.open({ message: msg, type: "error" });
      throw error;
    } finally {
      saving.value = false;
    }
  };

  const updateStock = async (id, formData) => {
    try {
      saving.value = true;
      const { data } = await StockApi.updateStock(id, formData);
      toast.open({ message: "Medicamento actualizado", type: "success" });
      return data;
    } catch (error) {
      const msg = error?.response?.data?.msg ?? "Error al actualizar medicamento";
      toast.open({ message: msg, type: "error" });
      throw error;
    } finally {
      saving.value = false;
    }
  };

  const toggleActive = async (id) => {
    try {
      const { data } = await StockApi.toggleActive(id);
      const item = items.value.find((i) => i._id === id);
      if (item) item.active = data.active;
      toast.open({ message: data.msg, type: "success" });
    } catch {
      toast.open({ message: "Error al cambiar estado", type: "error" });
    }
  };

  const onPage = async (event) => {
    page.value = event.page + 1;
    pageSize.value = event.rows;
    await loadStock();
  };

  const onSearch = async (value) => {
    search.value = value ?? "";
    page.value = 1;
    await loadStock();
  };

  return {
    items, loading, saving, total, page, pageSize, pageFirst,
    search, filterActive,
    loadStock, createStock, updateStock, toggleActive, onPage, onSearch,
  };
});
