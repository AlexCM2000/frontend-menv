import { computed, inject, ref } from "vue";

import { defineStore } from "pinia";
import Swal from "sweetalert2";
import {
  archivedRecord,
  createHealthRecord,
  getRecords,
} from "../api/recordsApi";

export const useRecordStore = defineStore("health-records", () => {
  const records = ref([]);
  const totalRecords = ref(0);
  const page = ref(1);
  const page_size = ref(10);
  const page_first = computed(() => (page.value - 1) * page_size.value);
  const loading = ref(false);
  const visibleForm = ref(false);
  const visibleDetail = ref(false);
  const toast = inject("toast");
  const currentRecord = ref(null);
  const currentRecordDetail = ref(null);

  // Filtros
  const search = ref(null);
  const state = ref(null);
  const health = ref(null);

  const setRecords = async () => {
    try {
      loading.value = true;
      const params = {
        page: page.value,
        page_size: page_size.value,
        ...(search.value ? { search: search.value } : {}),
        ...(state.value ? { state: state.value } : {}),
        ...(health.value ? { health: health.value } : {}),
      };
      const data = await getRecords(params);
      records.value = data.results;
      totalRecords.value = data.count;
      page.value = data.page;
      page_size.value = data.page_size;
      loading.value = false;
    } catch (error) {
      loading.value = false;
      toast.open({
        message: error?.response?.data?.message ?? "Error al cargar historiales",
        type: "error",
      });
      console.log(error);
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

  const resetFilters = async () => {
    search.value = null;
    state.value = null;
    health.value = null;
    page.value = 1;
    await setRecords();
  };

  const onCreateRecord = async (record) => {
    try {
      const data = await createHealthRecord(record);
      setRecords();
      toast.open({
        message: data.message,
        type: "success",
      });
      closeModal();
      return data;
    } catch (error) {
      console.log(error);
      toast.open({
        message: error.response.data.message,
        type: "error",
      });
      closeModal();
    }
  };

  const onArchivedRecord = async (id) => {
    try {
      Swal.fire({
        title: "¿Estás seguro?",
        text: "Archivará un historial médico",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, archivar",
        cancelButtonText: "Cancelar",
        buttonsStyling: false, // Desactivamos los estilos por defecto
        customClass: {
          popup: "rounded-xl shadow-md",
          confirmButton:
            "bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition",
          cancelButton:
            "bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition ml-2",
        },
      }).then(async (result) => {
        if (result.isConfirmed) {
          const response = await archivedRecord(id);
          setRecords();
          console.log(response);
          toast.open({
            message: response.message,
            type: "success",
          });
        }
      });
    } catch (error) {
      console.log(error);
      toast.open({
        message: error.response.data.message,
        type: "error",
      });
    }
  };

  const onCurrentRecord = async (data) => {
    currentRecord.value = data;
    openModal();
  };

  const onCurrentRecordDetail = async (data) => {
    currentRecordDetail.value = data;
    openModalDetail();
  };

  const openModal = () => {
    visibleForm.value = true;
  };

  const openModalDetail = () => {
    visibleDetail.value = true;
  };

  const closeModalDetail = () => {
    visibleDetail.value = false;
  };

  const closeModal = () => {
    visibleForm.value = false;
    currentRecord.value = null;
  };

  //   const onChangePatient = async (values) => {
  //     console.log("editando 123", values);
  //     try {
  //       const data = await updatePatient(values._id, values);
  //       setRecords();
  //       toast.open({
  //         message: data.message,
  //         type: "success",
  //       });
  //       closeModal();
  //       return data;
  //     } catch (error) {
  //       console.log(error);
  //       toast.open({
  //         message: error.response.data.message,
  //         type: "error",
  //       });
  //       closeModal();
  //     }
  //   };

  return {
    setRecords,
    records,
    totalRecords,
    page,
    page_size,
    page_first,
    loading,
    visibleForm,
    openModal,
    closeModal,
    onCreateRecord,
    onArchivedRecord,
    onCurrentRecord,
    currentRecord,
    visibleDetail,
    openModalDetail,
    closeModalDetail,
    onCurrentRecordDetail,
    currentRecordDetail,
    search,
    state,
    health,
    onPage,
    onSearch,
    setStateFilter,
    setHealthFilter,
    resetFilters,
  };
});
