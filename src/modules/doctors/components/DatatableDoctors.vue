<template>
  <Card class="m-3 sm:m-5">
    <template #title>
      <div class="flex items-center gap-2">
        <p class="font-semibold text-lg flex-1">Lista de Médicos</p>
        <Button size="small" icon="pi pi-plus" label="Nuevo" @click="openModal" />
      </div>
    </template>

    <template #content>
      <!-- Filtros -->
      <div class="flex flex-col sm:flex-row gap-2 mb-4 sm:items-center flex-wrap">

        <IconField class="w-full sm:flex-1">
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="localSearch"
            placeholder="Buscar por nombre, especialidad o licencia..."
            class="w-full"
            @keyup.enter="onSearchHandler"
          />
        </IconField>

        <Select
          v-model="localSpecialty"
          :options="specialtyOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Especialidad"
          showClear
          class="w-full sm:w-52"
          @change="onSpecialtyChange"
        />

        <Select
          v-model="localActive"
          :options="activeOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Estado"
          showClear
          class="w-full sm:w-36"
          @change="onActiveChange"
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
        <Column style="min-width: 200px">
          <template #header><Skeleton width="60%" height="1rem" /></template>
          <template #body>
            <Skeleton width="75%" height="0.9rem" class="mb-1" />
            <Skeleton width="45%" height="0.75rem" />
          </template>
        </Column>
        <Column style="min-width: 140px">
          <template #header><Skeleton width="50%" height="1rem" /></template>
          <template #body><Skeleton width="70%" height="0.9rem" /></template>
        </Column>
        <Column style="min-width: 110px">
          <template #header><Skeleton width="50%" height="1rem" /></template>
          <template #body><Skeleton width="60%" height="0.9rem" /></template>
        </Column>
        <Column style="min-width: 80px">
          <template #header><Skeleton width="50%" height="1rem" /></template>
          <template #body><Skeleton width="55%" height="1.4rem" borderRadius="1rem" /></template>
        </Column>
        <Column style="min-width: 60px">
          <template #header><Skeleton width="40%" height="1rem" /></template>
          <template #body><Skeleton shape="circle" size="2rem" class="mx-auto" /></template>
        </Column>
      </DataTable>

      <!-- Tabla real -->
      <DataTable
        v-else
        :value="doctors"
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
        <!-- Médico -->
        <Column style="min-width: 200px">
          <template #header>
            <p class="font-semibold text-sm">Médico</p>
          </template>
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <Avatar
                :label="getInitials(data?.name)"
                shape="circle"
                class="bg-indigo-100 text-indigo-700 font-semibold flex-shrink-0 text-xs"
                size="normal"
              />
              <div>
                <p class="font-semibold text-sm text-gray-800">{{ data?.name }}</p>
                <p class="text-xs text-gray-400">{{ data?.licenseNumber }}</p>
              </div>
            </div>
          </template>
        </Column>

        <!-- Especialidad -->
        <Column style="min-width: 160px">
          <template #header>
            <p class="font-semibold text-sm">Especialidad</p>
          </template>
          <template #body="{ data }">
            <p class="text-sm text-gray-600">{{ data?.specialty }}</p>
          </template>
        </Column>

        <!-- Experiencia -->
        <Column style="min-width: 110px" class="hidden sm:table-cell">
          <template #header>
            <p class="font-semibold text-sm">Experiencia</p>
          </template>
          <template #body="{ data }">
            <p class="text-sm text-gray-500">
              {{ data?.yearsOfExperience }}
              {{ data?.yearsOfExperience === 1 ? "año" : "años" }}
            </p>
          </template>
        </Column>

        <!-- Contacto -->
        <Column style="min-width: 130px" class="hidden md:table-cell">
          <template #header>
            <p class="font-semibold text-sm">Teléfono</p>
          </template>
          <template #body="{ data }">
            <p class="text-sm text-gray-500">{{ data?.contactInfo?.phone ?? "—" }}</p>
          </template>
        </Column>

        <!-- Centro de salud (solo admin) -->
        <Column v-if="isAdmin" style="min-width: 150px" class="hidden lg:table-cell">
          <template #header>
            <p class="font-semibold text-sm">Centro de salud</p>
          </template>
          <template #body="{ data }">
            <p class="text-sm text-gray-500">{{ data?.health?.name ?? "—" }}</p>
          </template>
        </Column>

        <!-- Estado activo -->
        <Column style="min-width: 90px">
          <template #header>
            <p class="font-semibold text-sm">Estado</p>
          </template>
          <template #body="{ data }">
            <Tag
              :value="data?.active ? 'Activo' : 'Inactivo'"
              :severity="data?.active ? 'success' : 'secondary'"
              class="text-xs"
            />
          </template>
        </Column>

        <!-- Acciones -->
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

      <!-- OverlayPanel de acciones -->
      <OverlayPanel ref="panel" appendTo="body" :showCloseIcon="false" style="min-width: 160px">
        <ul class="py-1">
          <li
            class="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer rounded"
            @click="viewDoctor(activeRow)"
          >
            <i class="pi pi-eye text-gray-500 text-sm"></i> Ver
          </li>
          <li
            class="flex items-center gap-2 px-4 py-2 text-sm hover:bg-indigo-50 cursor-pointer rounded"
            @click="editDoctor(activeRow)"
          >
            <i class="pi pi-pencil text-indigo-500 text-sm"></i> Editar
          </li>
          <li
            class="flex items-center gap-2 px-4 py-2 text-sm cursor-pointer rounded"
            :class="activeRow?.active
              ? 'hover:bg-red-50 text-red-600'
              : 'hover:bg-green-50 text-green-600'"
            @click="toggleStatus(activeRow)"
          >
            <i
              class="text-sm"
              :class="activeRow?.active ? 'pi pi-ban' : 'pi pi-check-circle'"
            ></i>
            {{ activeRow?.active ? "Desactivar" : "Activar" }}
          </li>
        </ul>
      </OverlayPanel>
    </template>
  </Card>

  <ModalDoctorForm />
  <ModalDoctorDetail />
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
import { useDoctorStore } from "../store/doctorStore";
import { useUserStore } from "@/stores/user";
import { useHealthStore } from "@/stores/healths";
import ModalDoctorForm from "./ModalDoctorForm.vue";
import ModalDoctorDetail from "./ModalDoctorDetail.vue";
import CategoryApi from "@/api/CategoryApi";

const doctorStore = useDoctorStore();
const { loading, doctors, totalRecords, page_first } = storeToRefs(doctorStore);
const {
  setDoctors,
  openModal,
  onCurrentDoctor,
  onCurrentDoctorDetail,
  onPage,
  onSearch,
  setHealthFilter,
  setSpecialtyFilter,
  setActiveFilter,
  resetFilters,
  onToggleStatus,
} = doctorStore;

const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const isAdmin = computed(() => user.value?.admin === true);

const healthStore = useHealthStore();
const { healths } = storeToRefs(healthStore);
const healthOptions = computed(() => healths.value ?? []);

const activeOptions = [
  { label: "Activo", value: "true" },
  { label: "Inactivo", value: "false" },
];

const localSearch = ref("");
const localHealth = ref(null);
const localSpecialty = ref(null);
const localActive = ref(null);
const panel = ref(null);
const activeRow = ref(null);
const specialtyOptions = ref([]);

function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
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

const onSpecialtyChange = async () => {
  await setSpecialtyFilter(localSpecialty.value ?? null);
};

const onActiveChange = async () => {
  await setActiveFilter(localActive.value ?? null);
};

const clearFilters = async () => {
  localSearch.value = "";
  localHealth.value = null;
  localSpecialty.value = null;
  localActive.value = null;
  await resetFilters();
};

const editDoctor = (data) => {
  panel.value?.hide();
  onCurrentDoctor(data);
};

const viewDoctor = (data) => {
  panel.value?.hide();
  onCurrentDoctorDetail(data);
};

const toggleStatus = (data) => {
  panel.value?.hide();
  onToggleStatus(data._id, data.active);
};

onMounted(async () => {
  await userStore.getUser();
  if (isAdmin.value) await healthStore.getHealths();
  await setDoctors();
  try {
    const { data } = await CategoryApi.getAll({ active: true });
    specialtyOptions.value = data.map((c) => ({ label: c.name, value: c.name }));
  } catch {
    specialtyOptions.value = [];
  }
});
</script>
