<template>
  <Card class="m-5">
    <template #title>
      <div class="flex">
        <div class="flex-1">
          <p class="font-semibold text-lg">Lista de Pacientes</p>
        </div>
        <div class="flex-1 text-right">
          <Button size="small" @click="openModal"> Nuevo </Button>
        </div>
      </div>
    </template>
    <template #content>
      <DataTable
        v-show="!loading"
        :value="patients"
        v-model:first="page_first"
        :total-records="totalRecords"
        @page="onPage($event)"
        :rowsPerPageOptions="[10, 20, 50]"
        showGridLines
        paginator
        :rows="10"
        lazy
      >
        <Column class="min-w-[150px]">
          <template #header>
            <p class="font-semibold text-lg">Nombres</p>
          </template>
          <template #body="{ data }">
            <p class="font-semibold text-base text-gray-700">
              {{ data?.firstName + " " + data?.lastName }}
            </p>
            <p class="font-semibold text-sm text-gray-500">
              {{ data?.contactInfo?.phone }}
            </p>
          </template>
        </Column>

        <Column class="min-w-[150px]">
          <template #header>
            <p class="font-semibold text-lg">Fecha nacimiento</p>
          </template>
          <template #body="{ data }">
            <p class="font-semibold text-sm text-gray-500">
              {{ formatDate(data?.dateOfBirth) }}
            </p>
          </template>
        </Column>
        <Column class="min-w-[150px]">
          <template #header>
            <p class="font-semibold text-lg">correo</p>
          </template>
          <template #body="{ data }">
            <p class="font-semibold text-sm text-gray-500">
              {{ data?.email }}
            </p>
          </template>
        </Column>
        <Column class="min-w-[150px]">
          <template #header>
            <p class="font-semibold text-lg">Dirección</p>
          </template>
          <template #body="{ data }">
            <p class="font-semibold text-sm text-gray-500">
              {{ data?.contactInfo?.address }}
            </p>
          </template>
        </Column>

        <Column class="min-w-[50px]">
          <template #header>
            <p class="font-semibold text-lg">Acción</p>
          </template>
          <template #body="{ data }">
            <div class="flex justify-center">
              <Button
                icon="pi pi-ellipsis-v"
                class="p-button-text"
                @click="panel.toggle($event)"
                aria-haspopup="true"
                aria-controls="overlay_panel"
              />
              <OverlayPanel
                ref="panel"
                id="overlay_panel"
                appendTo="body"
                :showCloseIcon="false"
                style="min-width: 150px"
              >
                <ul>
                  <li
                    class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    @click="viewPatient(data)"
                  >
                    Ver
                  </li>
                  <li
                    class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    @click="editPatient(data)"
                  >
                    Editar
                  </li>
                  <li
                    class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    @click="onDeletePatient(data._id)"
                  >
                    Eliminar
                  </li>
                </ul>
              </OverlayPanel>
            </div>
          </template>
        </Column>
      </DataTable>
    </template>
  </Card>
  <ModalPatientForm />
  <ModalPatientDetail />
</template>

<script setup>
import { storeToRefs } from "pinia";
import Card from "primevue/card";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { usePatientStore } from "../store/patientStore";
import Button from "primevue/button";
import { onMounted, ref } from "vue";
import { formatDate } from "@/helpers/date";
import ModalPatientForm from "./ModalPatientForm.vue";
import OverlayPanel from "primevue/overlaypanel";
import ModalPatientDetail from "./ModalPatientDetail.vue";

const { loading, patients, totalRecords, page_first } = storeToRefs(
  usePatientStore()
);
const {
  setPatients,
  openModal,
  onDeletePatient,
  onCurrentPatient,
  onCurrentPatientDetail,
} = usePatientStore();

const onPage = (event) => {
  usePatientStore().getPatients(event.page + 1);
};

onMounted(async () => {
  await setPatients();
});

const panel = ref(null);

const editPatient = (data) => {
  onCurrentPatient(data);
};

const viewPatient = (data) => {
  onCurrentPatientDetail(data);
};
</script>
