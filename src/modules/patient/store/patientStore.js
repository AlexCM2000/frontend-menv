import { computed, inject, ref } from "vue";
import {
  createPatient,
  deletePatient,
  getPatients,
  updatePatient,
} from "../api/patientsApi";
import { defineStore } from "pinia";
import Swal from "sweetalert2";

export const usePatientStore = defineStore("patients", () => {
  const patients = ref([]);
  const totalRecords = ref(0);
  const page = ref(1);
  const page_size = ref(10);
  const page_first = computed(() => (page.value - 1) * page_size.value);
  const loading = ref(false);
  const visibleForm = ref(false);
  const visibleDetail = ref(false);
  const toast = inject("toast");
  const currentPatient = ref(null);
  const currentPatientDetail = ref(null);

  // Filtros
  const search = ref(null);
  const health = ref(null);
  const gender = ref(null);

  const setPatients = async () => {
    try {
      loading.value = true;
      const params = {
        page: page.value,
        page_size: page_size.value,
        ...(search.value ? { search: search.value } : {}),
        ...(health.value ? { health: health.value } : {}),
        ...(gender.value ? { gender: gender.value } : {}),
      };
      const data = await getPatients(params);
      patients.value = data.results;
      totalRecords.value = data.count;
      page.value = data.page;
      page_size.value = data.page_size;
      loading.value = false;
    } catch (error) {
      loading.value = false;
      console.log(error);
    }
  };

  const onPage = async (event) => {
    page.value = event.page + 1;
    page_size.value = event.rows;
    await setPatients();
  };

  const onSearch = async (value) => {
    search.value = value && value !== "" ? value : null;
    page.value = 1;
    await setPatients();
  };

  const setHealthFilter = async (value) => {
    health.value = value && value !== "" ? value : null;
    page.value = 1;
    await setPatients();
  };

  const setGenderFilter = async (value) => {
    gender.value = value && value !== "" ? value : null;
    page.value = 1;
    await setPatients();
  };

  const resetFilters = async () => {
    search.value = null;
    health.value = null;
    gender.value = null;
    page.value = 1;
    await setPatients();
  };

  const onCreatePatient = async (patient) => {
    try {
      const data = await createPatient(patient);
      setPatients();
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

  const onDeletePatient = async (id) => {
    try {
      Swal.fire({
        title: "¿Estás seguro?",
        text: "Un paciente eliminado no puede revertirse.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
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
          const response = await deletePatient(id);
          setPatients();
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

  const onCurrentPatient = async (data) => {
    currentPatient.value = data;
    openModal();
  };

  const onCurrentPatientDetail = async (data) => {
    currentPatientDetail.value = data;
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
    currentPatient.value = null;
  };

  const onChangePatient = async (values) => {
    console.log("editando 123", values);
    try {
      const data = await updatePatient(values._id, values);
      setPatients();
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

  return {
    setPatients,
    patients,
    totalRecords,
    page,
    page_size,
    page_first,
    loading,
    visibleForm,
    openModal,
    closeModal,
    onCreatePatient,
    onDeletePatient,
    onCurrentPatient,
    onChangePatient,
    currentPatient,
    visibleDetail,
    openModalDetail,
    closeModalDetail,
    onCurrentPatientDetail,
    currentPatientDetail,
    search,
    health,
    gender,
    onPage,
    onSearch,
    setHealthFilter,
    setGenderFilter,
    resetFilters,
  };
});
