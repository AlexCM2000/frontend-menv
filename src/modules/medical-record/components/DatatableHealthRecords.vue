<template>
  <Card class="m-3 sm:m-5">
    <template #title>
      <div class="flex items-center gap-2">
        <p class="font-semibold text-lg flex-1">Historiales médicos</p>
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
            placeholder="Buscar por nombre o SUS..."
            class="w-full"
            @keyup.enter="onSearchHandler"
          />
        </IconField>

        <Select
          v-model="localState"
          :options="stateOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Estado"
          showClear
          class="w-full sm:w-48"
          @change="onStateChange"
        >
          <template #value="{ value }">
            <div v-if="value" class="flex items-center gap-2">
              <span class="inline-block w-2 h-2 rounded-full" :class="stateDotClass(value)" />
              <span class="capitalize">{{ value }}</span>
            </div>
            <span v-else class="text-gray-400">Estado</span>
          </template>
          <template #option="{ option }">
            <div class="flex items-center gap-2">
              <span class="inline-block w-2 h-2 rounded-full" :class="stateDotClass(option.value)" />
              <span>{{ option.label }}</span>
            </div>
          </template>
        </Select>

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
          <template #body><Skeleton width="75%" height="0.9rem" /></template>
        </Column>
        <Column style="min-width: 120px">
          <template #header><Skeleton width="50%" height="1rem" /></template>
          <template #body><Skeleton width="55%" height="0.9rem" /></template>
        </Column>
        <Column style="min-width: 110px">
          <template #header><Skeleton width="45%" height="1rem" /></template>
          <template #body><Skeleton width="60%" height="1.4rem" borderRadius="1rem" /></template>
        </Column>
        <Column style="min-width: 60px">
          <template #header><Skeleton width="40%" height="1rem" /></template>
          <template #body><Skeleton shape="circle" size="2rem" class="mx-auto" /></template>
        </Column>
      </DataTable>

      <!-- Tabla real -->
      <DataTable
        v-else
        :value="records"
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
      >
        <Column style="min-width: 200px">
          <template #header>
            <p class="font-semibold text-sm">Paciente</p>
          </template>
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <Avatar
                :label="getInitials(data?.patient?.firstName, data?.patient?.lastName)"
                shape="circle"
                class="bg-teal-100 text-teal-700 font-semibold flex-shrink-0 text-xs"
              />
              <div>
                <p class="font-semibold text-sm text-gray-800">
                  {{ data?.patient?.firstName }} {{ data?.patient?.lastName }}
                </p>
                <p class="text-xs text-gray-400">SUS: {{ data?.patient?.susCode }}</p>
              </div>
            </div>
          </template>
        </Column>

        <Column style="min-width: 110px">
          <template #header>
            <p class="font-semibold text-sm">Estado</p>
          </template>
          <template #body="{ data }">
            <Tag
              :value="data?.state"
              :severity="stateSeverity(data?.state)"
              class="text-xs capitalize"
            />
          </template>
        </Column>

        <Column style="min-width: 130px" class="hidden sm:table-cell">
          <template #header>
            <p class="font-semibold text-sm">Última actualización</p>
          </template>
          <template #body="{ data }">
            <p class="text-xs text-gray-400">{{ data?.updatedAt }}</p>
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
            class="flex items-center gap-2 px-4 py-2 text-sm hover:bg-amber-50 cursor-pointer rounded text-amber-700"
            @click="archiveRow()"
          >
            <i class="pi pi-inbox text-sm"></i> Archivar
          </li>
        </ul>
      </OverlayPanel>
    </template>
  </Card>
</template>

<script setup>
import { storeToRefs } from "pinia";
import Card from "primevue/card";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Tag from "primevue/tag";
import Select from "primevue/select";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import OverlayPanel from "primevue/overlaypanel";
import Skeleton from "primevue/skeleton";
import Avatar from "primevue/avatar";
import { computed, onMounted, ref } from "vue";
import { useRecordStore } from "../store/recordStore";
import { useUserStore } from "@/stores/user";
import { useHealthStore } from "@/stores/healths";

const recordStore = useRecordStore();
const { loading, records, totalRecords, page_first } = storeToRefs(recordStore);
const {
  setRecords,
  openModal,
  onArchivedRecord,
  onPage,
  onSearch,
  setStateFilter,
  setHealthFilter,
  resetFilters,
} = recordStore;

const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const isAdmin = computed(() => user.value?.admin === true);

const healthStore = useHealthStore();
const { healths } = storeToRefs(healthStore);
const healthOptions = computed(() => healths.value ?? []);

const stateOptions = [
  { label: "Activo", value: "activo" },
  { label: "En tratamiento", value: "en tratamiento" },
  { label: "Cerrado", value: "cerrado" },
];

const stateSeverity = (state) => {
  if (state === "activo") return "success";
  if (state === "en tratamiento") return "warn";
  if (state === "cerrado") return "secondary";
  return "info";
};

const stateDotClass = (state) => {
  if (state === "activo") return "bg-green-500";
  if (state === "en tratamiento") return "bg-orange-400";
  if (state === "cerrado") return "bg-gray-400";
  return "bg-blue-400";
};

function getInitials(first = "", last = "") {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

const localSearch = ref("");
const localState = ref(null);
const localHealth = ref(null);
const panel = ref(null);
const activeRow = ref(null);

function openPanel(event, data) {
  activeRow.value = data;
  panel.value.toggle(event);
}

const archiveRow = () => {
  panel.value?.hide();
  onArchivedRecord(activeRow.value?._id);
};

const onSearchHandler = async () => {
  await onSearch(localSearch.value?.trim() || null);
};

const onStateChange = async () => {
  await setStateFilter(localState.value ?? null);
};

const onHealthChange = async () => {
  await setHealthFilter(localHealth.value ?? null);
};

const clearFilters = async () => {
  localSearch.value = "";
  localState.value = null;
  localHealth.value = null;
  await resetFilters();
};

onMounted(async () => {
  await userStore.getUser();
  if (isAdmin.value) await healthStore.getHealths();
  await setRecords();
});
</script>
