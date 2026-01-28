<template>
  <Card class="m-5">
    <template #title>
      <div class="flex">
        <div class="flex-1">
          <p class="font-semibold text-lg">Historiales médicos</p>
        </div>
        <div class="flex-1 text-right">
          <Button size="small" @click="openModal"> Nuevo </Button>
        </div>
      </div>
    </template>
    <template #content>
      <DataTable
        v-show="!loading"
        :value="records"
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
            <p class="font-semibold text-lg">Nombres completos</p>
          </template>
          <template #body="{ data }">
            <p class="font-semibold text-base text-gray-700">
              {{ data?.patient?.firstName + " " + data?.patient?.lastName }}
            </p>
          </template>
        </Column>

        <Column class="min-w-[150px]">
          <template #header>
            <p class="font-semibold text-lg">Código SUS</p>
          </template>
          <template #body="{ data }">
            <p class="font-semibold text-base text-gray-700">
              {{ data?.patient?.susCode }}
            </p>
          </template>
        </Column>

        <Column class="min-w-[150px]">
          <template #header>
            <p class="font-semibold text-lg">Estado</p>
          </template>
          <template #body="{ data }">
            <p class="font-semibold text-base text-gray-700">
              {{ data?.state }}
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
                  <!-- <li
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
                  </li> -->
                </ul>
              </OverlayPanel>
            </div>
          </template>
        </Column>
      </DataTable>
    </template>
  </Card>
  <!-- <ModalPatientForm />
  <ModalPatientDetail /> -->
</template>

<script setup>
import { storeToRefs } from "pinia";
import Card from "primevue/card";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import { onMounted, ref } from "vue";
import OverlayPanel from "primevue/overlaypanel";
import { useRecordStore } from "../store/recordStore";
import { getRecords } from "../api/recordsApi";

const { loading, records, totalRecords, page_first, page } = storeToRefs(
  useRecordStore()
);
const { setRecords, openModal } = useRecordStore();

const onPage = (event) => {
  getRecords(event.page + 1);
};

onMounted(async () => {
  page.value = 1;
  await setRecords();
});

// const panel = ref(null);

// const editPatient = (data) => {
//   onCurrentPatient(data);
// };

// const viewPatient = (data) => {
//   onCurrentPatientDetail(data);
// };
</script>
