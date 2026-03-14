<template>
  <div class="px-3 sm:px-5 pt-4">
    <Card :pt="{ body: { class: 'px-3 sm:px-5' } }">
      <template #title>
        <div class="flex items-center gap-2">
          <div class="flex-1">
            <p class="font-bold text-base text-gray-800">Citas médicas</p>
            <p class="text-xs font-normal text-gray-400 mt-0.5">
              {{ totalRecords }} registro{{ totalRecords !== 1 ? "s" : "" }} encontrado{{ totalRecords !== 1 ? "s" : "" }}
            </p>
          </div>
          <ExportMenu
            v-if="user?.admin || user?.branchManager"
            endpoint="/export/appointments"
            :params="exportParams"
            filename="citas_medicas"
          />
        </div>
      </template>

      <template #content>
        <!-- Barra de filtros -->
        <div class="flex flex-col sm:flex-row gap-2 mb-4 sm:items-center">

          <!-- Búsqueda (admin y branchManager): flex-1 en desktop -->
          <IconField v-if="user?.admin || user?.branchManager" class="w-full sm:flex-1">
            <InputIcon class="pi pi-search" />
            <InputText
              v-model="search"
              placeholder="Buscar por nombre, email o SUS..."
              class="w-full"
              @keyup.enter="handleSubmit"
            />
          </IconField>

          <!-- Estado (todos los roles) -->
          <Select
            v-model="selectedState"
            :options="stateOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Estado"
            showClear
            class="w-full sm:w-44"
          >
            <template #value="{ value }">
              <div v-if="value" class="flex items-center gap-2">
                <span class="inline-block w-2 h-2 rounded-full" :class="stateDot(value)" />
                <span>{{ value }}</span>
              </div>
              <span v-else class="text-gray-400">Estado</span>
            </template>
            <template #option="{ option }">
              <div class="flex items-center gap-2">
                <span class="inline-block w-2 h-2 rounded-full" :class="stateDot(option.value)" />
                <span>{{ option.label }}</span>
              </div>
            </template>
          </Select>

          <!-- Rango de fechas (admin y branchManager) -->
          <DatePicker
            v-if="user?.admin || user?.branchManager"
            v-model="dateRange"
            selectionMode="range"
            :manualInput="false"
            placeholder="Rango de fechas"
            showButtonBar
            showIcon
            class="w-full sm:w-60"
            dateFormat="dd/mm/yy"
          />

          <!-- Centro de salud (solo admin) -->
          <Select
            v-if="user?.admin"
            v-model="selectedHealth"
            :options="healths"
            optionLabel="label"
            optionValue="value"
            placeholder="Centro de salud"
            showClear
            class="w-full sm:w-48"
          />

          <!-- Acciones -->
          <div class="flex gap-2 sm:ml-auto">
            <Button
              label="Buscar"
              icon="pi pi-search"
              class="flex-1 sm:flex-none"
              @click="handleSubmit"
            />
            <Button
              icon="pi pi-filter-slash"
              severity="secondary"
              outlined
              class="flex-shrink-0"
              v-tooltip.top="'Limpiar filtros'"
              @click="clearAllFilters"
            />
          </div>
        </div>

        <!-- Skeleton loader -->
        <DataTable v-if="loading" :value="Array(5).fill({})" showGridLines>
          <Column v-for="n in 5" :key="n" style="min-width: 120px">
            <template #header><Skeleton width="60%" height="1rem" /></template>
            <template #body><Skeleton width="75%" height="0.85rem" /></template>
          </Column>
        </DataTable>

        <!-- Tabla -->
        <DataTable
          v-else
          :value="userAppointments"
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
          <!-- Servicio -->
          <Column style="min-width: 160px">
            <template #header><p class="font-semibold text-sm">Servicio</p></template>
            <template #body="{ data }">
              <p class="text-xs text-gray-400 uppercase tracking-wide leading-none mb-0.5">
                {{ data?.services[0]?.category ?? "—" }}
              </p>
              <p class="font-semibold text-sm text-gray-700">
                {{ data?.services[0]?.name ?? "—" }}
              </p>
            </template>
          </Column>

          <!-- Fecha / Hora -->
          <Column style="min-width: 130px">
            <template #header><p class="font-semibold text-sm">Fecha / Hora</p></template>
            <template #body="{ data }">
              <div class="flex items-center gap-1.5">
                <i class="pi pi-calendar text-xs text-gray-400" />
                <p class="text-sm text-gray-700">{{ formatDate(data?.date) }}</p>
              </div>
              <div class="flex items-center gap-1.5 mt-0.5">
                <i class="pi pi-clock text-xs text-gray-400" />
                <p class="text-xs text-gray-400">{{ data?.time }}</p>
              </div>
            </template>
          </Column>

          <!-- Paciente (solo admin y branchManager) -->
          <Column v-if="user?.admin || user?.branchManager" style="min-width: 190px">
            <template #header><p class="font-semibold text-sm">Paciente</p></template>
            <template #body="{ data }">
              <div class="flex items-center gap-2">
                <Avatar
                  :label="getInitials(data?.user?.name)"
                  shape="circle"
                  class="bg-indigo-100 text-indigo-700 font-semibold flex-shrink-0 text-xs"
                />
                <div class="min-w-0">
                  <p class="font-semibold text-sm text-gray-800 truncate">{{ data?.user?.name }}</p>
                  <p class="text-xs text-gray-400 truncate">{{ data?.user?.email }}</p>
                </div>
              </div>
            </template>
          </Column>

          <!-- Centro médico -->
          <Column style="min-width: 130px" class="hidden md:table-cell">
            <template #header><p class="font-semibold text-sm">Centro médico</p></template>
            <template #body="{ data }">
              <p class="text-sm text-gray-500">{{ data?.health?.name ?? "—" }}</p>
            </template>
          </Column>

          <!-- Estado -->
          <Column style="min-width: 110px">
            <template #header><p class="font-semibold text-sm">Estado</p></template>
            <template #body="{ data }">
              <Tag
                :value="data?.state"
                :severity="appointmentSeverity(data?.state)"
                class="text-xs"
              />
            </template>
          </Column>

          <!-- Acción -->
          <Column style="min-width: 60px; text-align: center">
            <template #header><p class="font-semibold text-sm">Acción</p></template>
            <template #body="{ data }">
              <div class="flex justify-center">
                <Button
                  icon="pi pi-ellipsis-v"
                  text
                  rounded
                  size="small"
                  @click="openPanel($event, data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>

        <!-- OverlayPanel -->
        <OverlayPanel ref="panel" appendTo="body" :showCloseIcon="false" style="min-width: 170px">
          <p class="text-xs text-gray-400 uppercase tracking-wider px-4 pt-2 pb-1 font-semibold">
            Cambiar estado
          </p>
          <ul class="pb-1">
            <li
              v-for="state in ['Pendiente', 'Completada', 'Reprogramada', 'Cancelada', 'No asistio']"
              :key="state"
              class="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer rounded transition-colors"
              :class="{ 'font-semibold': activeRow?.state === state }"
              @click="changeState(state)"
            >
              <span class="inline-block w-2 h-2 rounded-full" :class="stateDot(state)" />
              {{ state }}
              <i v-if="activeRow?.state === state" class="pi pi-check ml-auto text-xs text-gray-400" />
            </li>
          </ul>
        </OverlayPanel>
      </template>
    </Card>
  </div>
</template>

<script setup>
import AppointmentApi from "@/api/AppointmentApi";
import { formatDate } from "@/helpers/date";
import { useHealthStore } from "@/stores/healths";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import Avatar from "primevue/avatar";
import Button from "primevue/button";
import Card from "primevue/card";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import DatePicker from "primevue/datepicker";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputText from "primevue/inputtext";
import OverlayPanel from "primevue/overlaypanel";
import Select from "primevue/select";
import Skeleton from "primevue/skeleton";
import Tag from "primevue/tag";
import { inject, computed, onMounted, ref, watch } from "vue";
import ExportMenu from "@/components/ExportMenu.vue";

const toast = inject("toast");

const userAuth = useUserStore();
const { loading, totalRecords, user, userAppointments, page_first, dateFrom, dateTo } = storeToRefs(userAuth);
const { onPage, onSearch, getSelectedHealths, setAppointmentState, getUserAppointments, setDateFilter } = userAuth;

const healthStore = useHealthStore();
const { getHealths } = healthStore;
const { healths } = storeToRefs(healthStore);

onMounted(async () => {
  await userAuth.getUser();
  await getUserAppointments(user.value._id);
  if (user.value?.admin) await getHealths();
});

const selectedHealth = ref(null);
const selectedState = ref(null);
const search = ref("");
const dateRange = ref(null);
const panel = ref(null);
const activeRow = ref(null);

const exportParams = computed(() => ({
  ...(search.value        && { search:    search.value }),
  ...(selectedState.value && { state:     selectedState.value }),
  ...(selectedHealth.value&& { health:    selectedHealth.value }),
  ...(dateFrom.value      && { date_from: dateFrom.value }),
  ...(dateTo.value        && { date_to:   dateTo.value }),
}));

const stateOptions = [
  { label: "Pendiente", value: "Pendiente" },
  { label: "Reprogramada", value: "Reprogramada" },
  { label: "Cancelada", value: "Cancelada" },
  { label: "Completada", value: "Completada" },
  { label: "No asistio", value: "No asistio" },
];

const stateDot = (state) => ({
  "bg-yellow-400": state === "Pendiente",
  "bg-blue-400": state === "Reprogramada",
  "bg-red-400": state === "Cancelada",
  "bg-green-500": state === "Completada",
  "bg-gray-400": state === "No asistio",
});

const appointmentSeverity = (state) => {
  if (state === "Completada") return "success";
  if (state === "Pendiente") return "warn";
  if (state === "Cancelada") return "danger";
  if (state === "Reprogramada") return "info";
  return "secondary";
};

function getInitials(name = "") {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name[0]?.toUpperCase() ?? "";
}

watch(selectedHealth, async (val) => {
  await getSelectedHealths(val ?? "");
});

watch(selectedState, async (val) => {
  await setAppointmentState(val ?? "");
});

watch(search, (val) => {
  if (!val || val.length === 0) onSearch("");
});

watch(dateRange, async (val) => {
  if (val && val[0] && val[1]) {
    await setDateFilter(val[0].toISOString(), val[1].toISOString());
  } else if (!val) {
    await setDateFilter(null, null);
  }
});

const handleSubmit = () => {
  if (search.value?.length >= 2) onSearch(search.value);
};

const clearAllFilters = async () => {
  search.value = "";
  selectedState.value = null;
  selectedHealth.value = null;
  dateRange.value = null;
  await onSearch("");
  await setAppointmentState("");
  await getSelectedHealths("");
  await setDateFilter(null, null);
};

function openPanel(event, data) {
  activeRow.value = data;
  panel.value.toggle(event);
}

const changeState = async (state) => {
  panel.value?.hide();
  if (!activeRow.value?._id) return;
  try {
    await AppointmentApi.update(activeRow.value._id, { state });
    activeRow.value.state = state;
    await getUserAppointments(user.value._id);
    toast?.add({ severity: "success", summary: "Estado actualizado", detail: `Cita marcada como "${state}"`, life: 3000 });
  } catch {
    toast?.add({ severity: "error", summary: "Error", detail: "No se pudo actualizar el estado", life: 3000 });
  }
};
</script>
