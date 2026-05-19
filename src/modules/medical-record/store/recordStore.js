import { computed, inject, ref } from "vue";
import { defineStore } from "pinia";
import Swal from "sweetalert2";
import {
  archivedRecord,
  unarchiveRecord,
  createHealthRecord,
  getRecords,
  getRecordById,
  updateRecordState,
  addObservation,
  addDiagnosis,
  addMedication,
  addTreatment,
  addAllergy,
  addVitalSigns,
  addVaccine,
} from "../api/recordsApi";

export const useRecordStore = defineStore("health-records", () => {
  const records = ref([]);
  const totalRecords = ref(0);
  const page = ref(1);
  const page_size = ref(10);
  const page_first = computed(() => (page.value - 1) * page_size.value);
  const loading = ref(false);
  const saving = ref(false);

  // Modales
  const visibleForm = ref(false);
  const visibleDetail = ref(false);
  const visibleSubdoc = ref(false);

  const toast = inject("toast");
  const currentRecord = ref(null);
  const currentRecordDetail = ref(null);
  const subdocTarget = ref(null);
  const subdocType = ref(null);

  // Filtros
  const search = ref(null);
  const state = ref(null);
  const health = ref(null);
  const showArchived = ref(false);
  const dateFrom = ref(null);
  const dateTo = ref(null);

  const setRecords = async () => {
    try {
      loading.value = true;
      const params = {
        page: page.value,
        page_size: page_size.value,
        ...(search.value ? { search: search.value } : {}),
        ...(state.value ? { state: state.value } : {}),
        ...(health.value ? { health: health.value } : {}),
        ...(showArchived.value ? { archived: "true" } : {}),
        ...(dateFrom.value ? { date_from: dateFrom.value } : {}),
        ...(dateTo.value ? { date_to: dateTo.value } : {}),
      };
      const data = await getRecords(params);
      records.value = data.results;
      totalRecords.value = data.count;
      page.value = data.page;
      page_size.value = data.page_size;
    } catch (error) {
      toast.open({
        message: error?.response?.data?.message ?? "Error al cargar historiales",
        type: "error",
      });
    } finally {
      loading.value = false;
    }
  };

  const onPage = async (event) => {
    page.value = event.page + 1;
    page_size.value = event.rows;
    await setRecords();
  };

  const onSearch = async (value) => {
    search.value = value && value !== "" ? value : null;
    page.value = 1;
    await setRecords();
  };

  const setStateFilter = async (value) => {
    state.value = value && value !== "" ? value : null;
    page.value = 1;
    await setRecords();
  };

  const setHealthFilter = async (value) => {
    health.value = value && value !== "" ? value : null;
    page.value = 1;
    await setRecords();
  };

  const toggleShowArchived = async () => {
    showArchived.value = !showArchived.value;
    page.value = 1;
    await setRecords();
  };

  const setDateFilter = async (from, to) => {
    dateFrom.value = from ?? null;
    dateTo.value = to ?? null;
    page.value = 1;
    await setRecords();
  };

  const resetFilters = async () => {
    search.value = null;
    state.value = null;
    health.value = null;
    dateFrom.value = null;
    dateTo.value = null;
    showArchived.value = false;
    page.value = 1;
    await setRecords();
  };

  // ── Crear historial ──────────────────────────────
  const onCreateRecord = async (record) => {
    try {
      saving.value = true;
      await createHealthRecord(record);
      await setRecords();
      toast.open({ message: "Historial creado correctamente", type: "success" });
      closeModal();
    } catch (error) {
      const msg = error?.response?.data?.message ?? "Error al crear historial";
      toast.open({ message: msg, type: "error" });
      if (error?.response?.data?.existingId) throw error;
    } finally {
      saving.value = false;
    }
  };

  // ── Archivar ──────────────────────────────────────
  const onArchivedRecord = async (id) => {
    const result = await Swal.fire({
      title: "¿Archivar historial?",
      text: "El historial quedará oculto de la lista. Podrás desarchivarlo después.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, archivar",
      cancelButtonText: "Cancelar",
      buttonsStyling: false,
      customClass: {
        popup: "rounded-xl shadow-md",
        confirmButton: "bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition",
        cancelButton: "bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition ml-2",
      },
    });
    if (!result.isConfirmed) return;
    try {
      await archivedRecord(id);
      await setRecords();
      toast.open({ message: "Historial archivado", type: "success" });
    } catch (error) {
      toast.open({ message: error?.response?.data?.message ?? "Error al archivar", type: "error" });
    }
  };

  // ── Desarchivar ───────────────────────────────────
  const onUnarchiveRecord = async (id) => {
    const result = await Swal.fire({
      title: "¿Desarchivar historial?",
      text: "El historial volverá a la lista principal.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, desarchivar",
      cancelButtonText: "Cancelar",
      buttonsStyling: false,
      customClass: {
        popup: "rounded-xl shadow-md",
        confirmButton: "bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition",
        cancelButton: "bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition ml-2",
      },
    });
    if (!result.isConfirmed) return;
    try {
      await unarchiveRecord(id);
      await setRecords();
      toast.open({ message: "Historial desarchivado", type: "success" });
    } catch (error) {
      toast.open({ message: error?.response?.data?.message ?? "Error al desarchivar", type: "error" });
    }
  };

  // ── Cambiar estado ────────────────────────────────
  const onUpdateState = async (id, newState) => {
    const rec = records.value.find((r) => r._id === id);
    const oldState = rec?.state;
    if (rec) rec.state = newState;
    try {
      await updateRecordState(id, newState);
      toast.open({ message: `Estado cambiado a "${newState}"`, type: "success" });
    } catch (error) {
      if (rec) rec.state = oldState;
      toast.open({ message: error?.response?.data?.message ?? "Error al cambiar estado", type: "error" });
    }
  };

  // ── Agregar subdocumento clínico ──────────────────
  // Retorna { alerts } si el tipo es vitalSigns, para que el formulario los muestre
  const onAddSubdoc = async (payload) => {
    if (!subdocTarget.value || !subdocType.value) return;
    try {
      saving.value = true;
      const id = subdocTarget.value._id;
      const apiMap = {
        observation:  addObservation,
        diagnosis:    addDiagnosis,
        medication:   addMedication,
        treatment:    addTreatment,
        allergy:      addAllergy,
        vitalSigns:   addVitalSigns,
        vaccine:      addVaccine,
      };
      const apiFn = apiMap[subdocType.value];
      if (!apiFn) throw new Error("Tipo no válido");

      const result = await apiFn(id, payload);
      const cdssAlerts = result?.alerts ?? [];

      toast.open({ message: "Entrada agregada al historial", type: "success" });
      subdocSaved.value = true;
      closeSubdocModal();

      if (visibleDetail.value && currentRecordDetail.value?._id === id) {
        currentRecordDetail.value = await getRecordById(id);
      }

      return { alerts: cdssAlerts };
    } catch (error) {
      toast.open({ message: error?.response?.data?.message ?? "Error al agregar entrada", type: "error" });
      return { alerts: [] };
    } finally {
      saving.value = false;
    }
  };

  // ── Control de modales ────────────────────────────
  const onCurrentRecord = (data) => { currentRecord.value = data; openModal(); };
  const onCurrentRecordDetail = (data) => { currentRecordDetail.value = data; openModalDetail(); };

  const subdocSaved = ref(false);

  const openSubdocModal = (record, type) => {
    subdocSaved.value = false;
    subdocTarget.value = record;
    subdocType.value = type;
    visibleSubdoc.value = true;
  };
  const closeSubdocModal = () => {
    visibleSubdoc.value = false;
    subdocTarget.value = null;
    subdocType.value = null;
  };

  const openModal = () => { visibleForm.value = true; };
  const closeModal = () => { visibleForm.value = false; currentRecord.value = null; };
  const openModalDetail = () => { visibleDetail.value = true; };
  const closeModalDetail = () => { visibleDetail.value = false; currentRecordDetail.value = null; };

  return {
    records, totalRecords, page, page_size, page_first, loading, saving,
    search, state, health, showArchived, dateFrom, dateTo,
    visibleForm, visibleDetail, visibleSubdoc,
    currentRecord, currentRecordDetail, subdocTarget, subdocType, subdocSaved,
    setRecords, onPage, onSearch, setStateFilter, setHealthFilter,
    setDateFilter, toggleShowArchived, resetFilters,
    onCreateRecord, onArchivedRecord, onUnarchiveRecord, onUpdateState, onAddSubdoc,
    onCurrentRecord, onCurrentRecordDetail,
    openModal, closeModal, openModalDetail, closeModalDetail,
    openSubdocModal, closeSubdocModal,
  };
});