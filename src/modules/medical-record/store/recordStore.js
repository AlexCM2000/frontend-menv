import { inject, ref } from "vue";

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
  const loading = ref(false);
  const visibleForm = ref(false);
  const visibleDetail = ref(false);
  const toast = inject("toast");
  const currentRecord = ref(null);
  const currentRecordDetail = ref(null);

  const setRecords = async () => {
    try {
      loading.value = true;
      const data = await getRecords();
      records.value = data.results;
      totalRecords.value = data.count;
      page.value = data.page;
      page_size.value = data.page_size;
      loading.value = false;
    } catch (error) {
      loading.value = false;
      toast.open({
        message: error.response.data.message,
        type: "error",
      });
      console.log(error);
    }
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
  };
});
