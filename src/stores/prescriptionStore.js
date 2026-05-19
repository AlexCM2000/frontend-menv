import { ref, computed, inject } from "vue";
import { defineStore } from "pinia";
import PrescriptionApi from "@/api/prescriptionApi";

export const usePrescriptionStore = defineStore("prescription", () => {
  const toast    = inject("toast");
  const items    = ref([]);
  const loading  = ref(false);
  const saving   = ref(false);
  const total    = ref(0);
  const page     = ref(1);
  const pageSize = ref(20);
  const search   = ref("");
  const filterStatus = ref("");

  const pageFirst = computed(() => (page.value - 1) * pageSize.value);

  const loadPrescriptions = async (extraParams = {}) => {
    try {
      loading.value = true;
      const { data } = await PrescriptionApi.getPrescriptions({
        page: page.value,
        page_size: pageSize.value,
        ...(search.value && { search: search.value }),
        ...(filterStatus.value && { status: filterStatus.value }),
        ...extraParams,
      });
      items.value = data.results;
      total.value = data.count;
    } catch {
      toast.open({ message: "Error al cargar recetas", type: "error" });
    } finally {
      loading.value = false;
    }
  };

  const getByPatient = async (patientId) => {
    try {
      const { data } = await PrescriptionApi.getByPatient(patientId);
      return data;
    } catch {
      toast.open({ message: "Error al cargar recetas del paciente", type: "error" });
      return [];
    }
  };

  const createPrescription = async (formData) => {
    try {
      saving.value = true;
      const { data } = await PrescriptionApi.createPrescription(formData);
      toast.open({ message: `Receta ${data.code} creada`, type: "success" });
      return data;
    } catch (error) {
      const msg = error?.response?.data?.msg ?? "Error al crear receta";
      toast.open({ message: msg, type: "error" });
      throw error;
    } finally {
      saving.value = false;
    }
  };

  const dispenseItems = async (id, itemsPayload) => {
    try {
      saving.value = true;
      const { data } = await PrescriptionApi.dispenseItems(id, { items: itemsPayload });
      toast.open({ message: "Despacho registrado correctamente", type: "success" });
      const idx = items.value.findIndex((p) => p._id === id);
      if (idx !== -1) items.value[idx] = data;
      return data;
    } catch (error) {
      const msg = error?.response?.data?.msg ?? "Error al despachar";
      toast.open({ message: msg, type: "error" });
      throw error;
    } finally {
      saving.value = false;
    }
  };

  const onPage = async (event) => {
    page.value = event.page + 1;
    pageSize.value = event.rows;
    await loadPrescriptions();
  };

  const onSearch = async (value) => {
    search.value = value ?? "";
    page.value = 1;
    await loadPrescriptions();
  };

  return {
    items, loading, saving, total, page, pageSize, pageFirst,
    search, filterStatus,
    loadPrescriptions, getByPatient, createPrescription, dispenseItems, onPage, onSearch,
  };
});
