<template>
  <Card class="m-3 sm:m-5">
    <template #title>
      <div class="flex items-center gap-2">
        <p class="font-semibold text-lg flex-1">Lista de Pacientes</p>
        <Button size="small" icon="pi pi-plus" label="Nuevo" @click="openModal" />
      </div>
    </template>

    <template #content>
      <!-- Filtros -->
      <div class="flex flex-col sm:flex-row gap-2 mb-4 sm:items-center">

        <!-- Búsqueda: flex-1 en desktop -->
        <IconField class="w-full sm:flex-1">
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="localSearch"
            placeholder="Buscar por nombre, email o SUS..."
            class="w-full"
            @keyup.enter="onSearchHandler"
          />
        </IconField>

        <Select
          v-model="localGender"
          :options="genderOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Género"
          showClear
          class="w-full sm:w-40"
          @change="onGenderChange"
        />

        <Select
          v-if="isAdmin"
          v-model="localHealth"
          :options="healthOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Centro de salud"
          showClear
          class="w-full sm:w-48"
          @change="onHealthChange"
        />

        <div class="flex gap-2">
          <Button
            label="Buscar"
            icon="pi pi-search"
            class="flex-1 sm:flex-none"
            @click="onSearchHandler"
          />
          <Button
            icon="pi pi-filter-slash"
            severity="secondary"
            outlined
            class="flex-shrink-0"
            v-tooltip.top="'Limpiar filtros'"
            @click="clearFilters"
          />
        </div>
      </div>

      <!-- Skeleton loader -->
      <DataTable v-if="loading" :value="Array(5).fill({})" showGridLines>
        <Column style="min-width: 180px">
          <template #header><Skeleton width="60%" height="1rem" /></template>
          <template #body>
            <Skeleton width="75%" height="0.9rem" class="mb-1" />
            <Skeleton width="45%" height="0.75rem" />
          </template>
        </Column>
        <Column style="min-width: 90px">
          <template #header><Skeleton width="50%" height="1rem" /></template>
          <template #body><Skeleton width="55%" height="1.4rem" borderRadius="1rem" /></template>
        </Column>
        <Column style="min-width: 120px">
          <template #header><Skeleton width="60%" height="1rem" /></template>
          <template #body><Skeleton width="70%" height="0.9rem" /></template>
        </Column>
        <Column style="min-width: 150px">
          <template #header><Skeleton width="50%" height="1rem" /></template>
          <template #body><Skeleton width="80%" height="0.9rem" /></template>
        </Column>
        <Column style="min-width: 60px">
          <template #header><Skeleton width="40%" height="1rem" /></template>
          <template #body><Skeleton shape="circle" size="2rem" class="mx-auto" /></template>
        </Column>
      </DataTable>

      <!-- Tabla real -->
      <DataTable
        v-else
        :value="patients"
        v-model:first="page_first"
        :total-records="totalRecords"
        @page="onPage($event)"
        :rowsPerPageOptions="[10, 20, 50]"
        showGridLines
        paginator
        :rows="10"
        lazy
        stripedRows
        scrollable
        scrollHeight="flex"
      >
        <Column style="min-width: 180px">
          <template #header>
            <p class="font-semibold text-sm">Paciente</p>
          </template>
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <Avatar
                :label="getInitials(data?.firstName, data?.lastName)"
                shape="circle"
                class="bg-blue-100 text-blue-700 font-semibold flex-shrink-0 text-xs"
                size="normal"
              />
              <div>
                <p class="font-semibold text-sm text-gray-800">
                  {{ data?.firstName }} {{ data?.lastName }}
                </p>
                <p class="text-xs text-gray-400">{{ data?.contactInfo?.phone }}</p>
              </div>
            </div>
          </template>
        </Column>

        <Column style="min-width: 90px">
          <template #header>
            <p class="font-semibold text-sm">Género</p>
          </template>
          <template #body="{ data }">
            <Tag
              :value="data?.gender"
              :severity="data?.gender === 'Masculino' ? 'info' : 'contrast'"
              class="text-xs"
            />
          </template>
        </Column>

        <Column style="min-width: 120px">
          <template #header>
            <p class="font-semibold text-sm">Nacimiento</p>
          </template>
          <template #body="{ data }">
            <p class="text-sm text-gray-500">{{ formatDate(data?.dateOfBirth) }}</p>
          </template>
        </Column>

        <Column style="min-width: 160px">
          <template #header>
            <p class="font-semibold text-sm">Correo</p>
          </template>
          <template #body="{ data }">
            <p class="text-sm text-gray-500 truncate max-w-[150px]">{{ data?.email }}</p>
          </template>
        </Column>

        <Column style="min-width: 150px" class="hidden md:table-cell">
          <template #header>
            <p class="font-semibold text-sm">Dirección</p>
          </template>
          <template #body="{ data }">
            <p class="text-sm text-gray-500">{{ data?.contactInfo?.address ?? "—" }}</p>
          </template>
        </Column>

        <Column v-if="isAdmin" style="min-width: 150px" class="hidden lg:table-cell">
          <template #header>
            <p class="font-semibold text-sm">Centro de salud</p>
          </template>
          <template #body="{ data }">
            <p class="text-sm text-gray-500">{{ data?.healthCenter?.name ?? "—" }}</p>
          </template>
        </Column>

        <Column style="min-width: 60px; text-align: center">
          <template #header>
            <p class="font-semibold text-sm">Acción</p>
          </template>
          <template #body="{ data }">
            <div class="flex justify-center">
              <Button
                icon="pi pi-ellipsis-v"
                class="p-button-text p-button-rounded p-button-sm"
                @click="openPanel($event, data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>

      <!-- OverlayPanel único fuera de la tabla -->
      <OverlayPanel ref="panel" appendTo="body" :showCloseIcon="false" style="min-width: 160px">
        <ul class="py-1">
          <li
            class="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer rounded"
            @click="viewPatient(activeRow)"
          >
            <i class="pi pi-eye text-gray-500 text-sm"></i> Ver
          </li>
          <li
            class="flex items-center gap-2 px-4 py-2 text-sm hover:bg-indigo-50 cursor-pointer rounded"
            @click="editPatient(activeRow)"
          >
            <i class="pi pi-pencil text-indigo-500 text-sm"></i> Editar
          </li>
          <li
            class="flex items-center gap-2 px-4 py-2 text-sm hover:bg-red-50 cursor-pointer rounded text-red-600"
            @click="onDeletePatient(activeRow?._id)"
          >
            <i class="pi pi-trash text-sm"></i> Eliminar
          </li>
        </ul>
      </OverlayPanel>
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
import Tag from "primevue/tag";
import Select from "primevue/select";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import Button from "primevue/button";
import OverlayPanel from "primevue/overlaypanel";
import Skeleton from "primevue/skeleton";
import Avatar from "primevue/avatar";
import { computed, onMounted, ref } from "vue";
import { formatDate } from "@/helpers/date";
import { usePatientStore } from "../store/patientStore";
import { useUserStore } from "@/stores/user";
import { useHealthStore } from "@/stores/healths";
import ModalPatientForm from "./ModalPatientForm.vue";
import ModalPatientDetail from "./ModalPatientDetail.vue";

const patientStore = usePatientStore();
const { loading, patients, totalRecords, page_first } = storeToRefs(patientStore);
const {
  setPatients,
  openModal,
  onDeletePatient,
  onCurrentPatient,
  onCurrentPatientDetail,
  onPage,
  onSearch,
  setHealthFilter,
  setGenderFilter,
  resetFilters,
} = patientStore;

const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const isAdmin = computed(() => user.value?.admin === true);

const healthStore = useHealthStore();
const { healths } = storeToRefs(healthStore);
const healthOptions = computed(() => healths.value ?? []);

const genderOptions = [
  { label: "Masculino", value: "Masculino" },
  { label: "Femenino", value: "Femenino" },
];

const localSearch = ref("");
const localHealth = ref(null);
const localGender = ref(null);
const panel = ref(null);
const activeRow = ref(null);

function getInitials(first = "", last = "") {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

function openPanel(event, data) {
  activeRow.value = data;
  panel.value.toggle(event);
}

const onSearchHandler = async () => {
  await onSearch(localSearch.value?.trim() || null);
};

const onHealthChange = async () => {
  await setHealthFilter(localHealth.value ?? null);
};

const onGenderChange = async () => {
  await setGenderFilter(localGender.value ?? null);
};

const clearFilters = async () => {
  localSearch.value = "";
  localHealth.value = null;
  localGender.value = null;
  await resetFilters();
};

const editPatient = (data) => {
  panel.value?.hide();
  onCurrentPatient(data);
};

const viewPatient = (data) => {
  panel.value?.hide();
  onCurrentPatientDetail(data);
};

onMounted(async () => {
  await userStore.getUser();
  if (isAdmin.value) await healthStore.getHealths();
  await setPatients();
});
</script>
