import { computed, inject, ref } from "vue";
import { defineStore } from "pinia";
import Swal from "sweetalert2";
import {
  getDoctors,
  createDoctor,
  updateDoctor,
  toggleDoctorStatus,
} from "../api/doctorsApi";

export const useDoctorStore = defineStore("doctors", () => {
  const doctors = ref([]);
  const totalRecords = ref(0);
  const page = ref(1);
  const page_size = ref(10);
  const page_first = computed(() => (page.value - 1) * page_size.value);
  const loading = ref(false);
  const visibleForm = ref(false);
  const visibleDetail = ref(false);
  const toast = inject("toast");
  const currentDoctor = ref(null);
  const currentDoctorDetail = ref(null);

  // Filtros
  const search = ref(null);
  const health = ref(null);
  const specialty = ref(null);
  const activeFilter = ref(null);

  const setDoctors = async () => {
    try {
      loading.value = true;
      const params = {
        page: page.value,
        page_size: page_size.value,
        ...(search.value ? { search: search.value } : {}),
        ...(health.value ? { health: health.value } : {}),
        ...(specialty.value ? { specialty: specialty.value } : {}),
        ...(activeFilter.value !== null ? { active: activeFilter.value } : {}),
      };
      const data = await getDoctors(params);
      doctors.value = data.results;
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
    await setDoctors();
  };

  const onSearch = async (value) => {
    search.value = value && value !== "" ? value : null;
    page.value = 1;
    await setDoctors();
  };

  const setHealthFilter = async (value) => {
    health.value = value && value !== "" ? value : null;
    page.value = 1;
    await setDoctors();
  };

  const setSpecialtyFilter = async (value) => {
    specialty.value = value && value !== "" ? value : null;
    page.value = 1;
    await setDoctors();
  };

  const setActiveFilter = async (value) => {
    activeFilter.value = value !== null && value !== "" ? value : null;
    page.value = 1;
    await setDoctors();
  };

  const resetFilters = async () => {
    search.value = null;
    health.value = null;
    specialty.value = null;
    activeFilter.value = null;
    page.value = 1;
    await setDoctors();
  };

  const onCreateDoctor = async (doctor) => {
    try {
      const data = await createDoctor(doctor);
      await setDoctors();
      toast.open({ message: data.msg, type: "success" });
      closeModal();
      return data;
    } catch (error) {
      toast.open({
        message: error.response?.data?.msg || "Error al crear el médico",
        type: "error",
      });
    }
  };

  const onChangeDoctor = async (values) => {
    try {
      const data = await updateDoctor(values._id, values);
      await setDoctors();
      toast.open({ message: data.msg, type: "success" });
      closeModal();
      return data;
    } catch (error) {
      toast.open({
        message: error.response?.data?.msg || "Error al actualizar el médico",
        type: "error",
      });
    }
  };

  const onToggleStatus = async (id, currentActive) => {
    const actionLabel = currentActive ? "desactivar" : "activar";
    Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Deseas ${actionLabel} este médico?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Sí, ${actionLabel}`,
      cancelButtonText: "Cancelar",
      buttonsStyling: false,
      customClass: {
        popup: "rounded-xl shadow-md",
        confirmButton:
          "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition",
        cancelButton:
          "bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition ml-2",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const data = await toggleDoctorStatus(id);
          await setDoctors();
          toast.open({ message: data.msg, type: "success" });
        } catch (error) {
          toast.open({
            message: error.response?.data?.msg || "Error al cambiar estado",
            type: "error",
          });
        }
      }
    });
  };

  const onCurrentDoctor = (data) => {
    currentDoctor.value = data;
    openModal();
  };

  const onCurrentDoctorDetail = (data) => {
    currentDoctorDetail.value = data;
    openModalDetail();
  };

  const openModal = () => { visibleForm.value = true; };
  const openModalDetail = () => { visibleDetail.value = true; };
  const closeModal = () => {
    visibleForm.value = false;
    currentDoctor.value = null;
  };
  const closeModalDetail = () => { visibleDetail.value = false; };

  return {
    doctors,
    totalRecords,
    page,
    page_size,
    page_first,
    loading,
    visibleForm,
    visibleDetail,
    currentDoctor,
    currentDoctorDetail,
    search,
    health,
    specialty,
    activeFilter,
    setDoctors,
    onPage,
    onSearch,
    setHealthFilter,
    setSpecialtyFilter,
    setActiveFilter,
    resetFilters,
    onCreateDoctor,
    onChangeDoctor,
    onToggleStatus,
    onCurrentDoctor,
    onCurrentDoctorDetail,
    openModal,
    openModalDetail,
    closeModal,
    closeModalDetail,
  };
});
