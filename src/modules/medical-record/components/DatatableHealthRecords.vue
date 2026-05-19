<template>
  <Card class="m-3 sm:m-5">
    <template #title>
      <div class="flex items-center gap-2 flex-wrap">
        <div class="flex-1">
          <p class="font-bold text-base text-gray-800">Historiales médicos</p>
          <p class="text-xs font-normal text-gray-400 mt-0.5">
            {{ totalRecords }} registro{{ totalRecords !== 1 ? "s" : "" }} encontrado{{ totalRecords !== 1 ? "s" : "" }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <!-- Toggle archivados (solo staff) -->
          <Button
            v-if="isStaff"
            :label="showArchived ? 'Ver activos' : 'Ver archivados'"
            :icon="showArchived ? 'pi pi-list' : 'pi pi-inbox'"
            :severity="showArchived ? 'secondary' : 'warn'"
            size="small"
            outlined
            @click="toggleShowArchived"
          />
          <ExportMenu
            v-if="isStaff"
            endpoint="/export/health-records"
            :params="exportParams"
            filename="historiales_medicos"
          />
          <!-- Crear solo para staff, no para doctor -->
          <Button
            v-if="isStaff"
            size="small"
            icon="pi pi-plus"
            label="Nuevo"
            @click="openModal"
          />
        </div>
      </div>
    </template>

    <template #content>
      <!-- Filtros -->
      <div class="flex flex-col sm:flex-row gap-2 mb-4 sm:items-center flex-wrap">
        <IconField class="w-full sm:flex-1">
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="localSearch"
            placeholder="Buscar por nombre o SUS..."
            class="w-full"
            @keyup.enter="onSearchHandler"
          />
        </IconField>

        <!-- Filtro estado solo si no estamos en archivados -->
        <Select
          v-if="!showArchived"
          v-model="localState"
          :options="stateOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Estado"
          showClear
          class="w-full sm:w-44"
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

        <!-- Rango de fechas (solo staff) -->
        <DatePicker
          v-if="isStaff"
          v-model="localDateRange"
          selectionMode="range"
          :manualInput="false"
          placeholder="Rango de fechas"
          showButtonBar
          showIcon
          class="w-full sm:w-60"
          dateFormat="dd/mm/yy"
          @update:modelValue="onDateRangeChange"
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
          <Button label="Buscar" icon="pi pi-search" class="flex-1 sm:flex-none" @click="onSearchHandler" />
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

      <!-- Banner archivados -->
      <div v-if="showArchived" class="flex items-center gap-2 mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
        <i class="pi pi-inbox" />
        <span>Mostrando historiales archivados. Solo admin y supervisor pueden desarchívarlos.</span>
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
        <template #empty>
          <div class="flex flex-col items-center justify-center py-12 gap-3">
            <img src="/img/undraw_no_data.svg" alt="Sin datos" class="w-44 opacity-60" />
            <p class="text-sm text-gray-400">No se encontraron historiales médicos</p>
          </div>
        </template>

        <Column style="min-width: 200px">
          <template #header><p class="font-semibold text-sm">Paciente</p></template>
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <Avatar
                :label="getInitials(data?.patient)"
                shape="circle"
                class="bg-teal-100 text-teal-700 font-semibold flex-shrink-0 text-xs"
              />
              <div>
                <p class="font-semibold text-sm text-gray-800">
                  {{ [data?.patient?.primerApellido, data?.patient?.segundoApellido, data?.patient?.nombres].filter(Boolean).join(' ') || '—' }}
                </p>
                <p class="text-xs text-gray-400">SUS: {{ data?.patient?.susCode }}</p>
              </div>
            </div>
          </template>
        </Column>

        <Column style="min-width: 110px">
          <template #header><p class="font-semibold text-sm">Estado</p></template>
          <template #body="{ data }">
            <Tag
              v-if="!data?.archivedAt"
              :value="data?.state"
              :severity="stateSeverity(data?.state)"
              class="text-xs capitalize"
            />
            <Tag v-else value="Archivado" severity="warn" class="text-xs" />
          </template>
        </Column>

        <Column style="min-width: 140px" class="hidden md:table-cell">
          <template #header><p class="font-semibold text-sm">Resumen</p></template>
          <template #body="{ data }">
            <div class="flex flex-wrap gap-1.5">
              <span class="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 rounded-full px-2 py-0.5">
                <i class="pi pi-clipboard text-[10px]" /> {{ data?.diagnoses?.length ?? 0 }} diag.
              </span>
              <span class="inline-flex items-center gap-1 text-xs bg-green-50 text-green-600 rounded-full px-2 py-0.5">
                <i class="pi pi-heart text-[10px]" /> {{ data?.medications?.length ?? 0 }} med.
              </span>
              <span class="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-600 rounded-full px-2 py-0.5">
                <i class="pi pi-calendar text-[10px]" /> {{ data?.medicalAppointments?.length ?? 0 }} citas
              </span>
            </div>
          </template>
        </Column>

        <!-- Sucursal: visible para admin y médico -->
        <Column v-if="showHealthCol" style="min-width: 140px" class="hidden md:table-cell">
          <template #header><p class="font-semibold text-sm">Sucursal</p></template>
          <template #body="{ data }">
            <p class="text-sm text-gray-600">{{ data?.patient?.healthCenter?.name ?? "—" }}</p>
            <p v-if="data?.patient?.healthCenter?.codigo" class="text-xs text-gray-400">Cód. {{ data.patient.healthCenter.codigo }}</p>
          </template>
        </Column>

        <Column style="min-width: 130px" class="hidden sm:table-cell">
          <template #header><p class="font-semibold text-sm">Última actualización</p></template>
          <template #body="{ data }">
            <p class="text-xs text-gray-400">{{ data?.updatedAt }}</p>
          </template>
        </Column>

        <Column style="min-width: 60px; text-align: center">
          <template #header><p class="font-semibold text-sm">Acción</p></template>
          <template #body="{ data }">
            <div class="flex justify-center">
              <Button
                icon="pi pi-ellipsis-h"
                text
                rounded
                size="small"
                @click="openPanel($event, data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>

      <!-- Popover de acciones -->
      <Popover ref="panel" appendTo="body" style="min-width: 190px">
        <p class="text-xs text-gray-400 uppercase tracking-wider px-4 pt-2 pb-1 font-semibold">Opciones</p>
        <ul class="pb-1">
          <!-- Ver detalle -->
          <li
            class="flex items-center gap-2 px-4 py-2 text-sm hover:bg-blue-50 cursor-pointer rounded-lg text-blue-700"
            @click="viewDetail()"
          >
            <i class="pi pi-eye text-sm" /> Ver detalle
          </li>

          <!-- Acciones clínicas: solo si no está archivado -->
          <template v-if="!activeRow?.archivedAt">
            <!-- Cambiar estado (admin, branchManager, doctor) -->
            <li
              class="flex items-center gap-2 px-4 py-2 text-sm hover:bg-indigo-50 cursor-pointer rounded-lg text-indigo-700"
              @click="openStateMenu($event)"
            >
              <i class="pi pi-refresh text-sm" /> Cambiar estado
              <i class="pi pi-chevron-right text-xs ml-auto" />
            </li>

            <!-- Archivar (solo staff) -->
            <li
              v-if="isStaff"
              class="flex items-center gap-2 px-4 py-2 text-sm hover:bg-amber-50 cursor-pointer rounded-lg text-amber-700"
              @click="archiveRow()"
            >
              <i class="pi pi-inbox text-sm" /> Archivar
            </li>
          </template>

          <!-- Desarchivar (solo staff y solo si está archivado) -->
          <li
            v-if="isStaff && activeRow?.archivedAt"
            class="flex items-center gap-2 px-4 py-2 text-sm hover:bg-teal-50 cursor-pointer rounded-lg text-teal-700"
            @click="unarchiveRow()"
          >
            <i class="pi pi-upload text-sm" /> Desarchivar
          </li>
        </ul>
      </Popover>

      <!-- Submenú: cambiar estado -->
      <Popover ref="statePanel" appendTo="body" style="min-width: 160px">
        <ul class="py-1">
          <li v-for="opt in stateOptions" :key="opt.value"
            class="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer rounded-lg"
            :class="{ 'font-semibold': activeRow?.state === opt.value }"
            @click="changeState(opt.value)"
          >
            <span class="inline-block w-2 h-2 rounded-full" :class="stateDotClass(opt.value)" />
            {{ opt.label }}
            <i v-if="activeRow?.state === opt.value" class="pi pi-check ml-auto text-xs text-gray-400" />
          </li>
        </ul>
      </Popover>

      <!-- Modales -->
      <FormHealthRecord />
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
import DatePicker from "primevue/datepicker";
import Popover from "primevue/popover";
import Skeleton from "primevue/skeleton";
import Avatar from "primevue/avatar";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useRecordStore } from "../store/recordStore";
import { useUserStore } from "@/stores/user";
import { useHealthStore } from "@/stores/healths";
import ExportMenu from "@/components/ExportMenu.vue";
import FormHealthRecord from "./FormHealthRecord.vue";

const router = useRouter();
const recordStore = useRecordStore();
const {
  loading, records, totalRecords, page_first, showArchived, dateFrom, dateTo,
} = storeToRefs(recordStore);
const {
  setRecords, openModal, onArchivedRecord, onUnarchiveRecord,
  onPage, onSearch, setStateFilter, setHealthFilter, setDateFilter, resetFilters,
  toggleShowArchived, onUpdateState,
} = recordStore;

const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const isAdmin    = computed(() => user.value?.admin === true);
const isDoctor   = computed(() => user.value?.doctor === true && !user.value?.admin && !user.value?.branchManager);
const isStaff    = computed(() => user.value?.admin === true || user.value?.branchManager === true);
// Mostrar columna de sucursal: admin (ve todos los centros) y médico (quiere ver a qué centro pertenece el paciente)
const showHealthCol = computed(() => isAdmin.value || isDoctor.value);

const exportParams = computed(() => ({
  ...(localSearch.value && { search:     localSearch.value }),
  ...(localState.value  && { state:      localState.value  }),
  ...(dateFrom.value    && { date_from:  dateFrom.value    }),
  ...(dateTo.value      && { date_to:    dateTo.value      }),
  ...(isAdmin.value && localHealth.value && { health: localHealth.value }),
}));

const healthStore = useHealthStore();
const { healths } = storeToRefs(healthStore);
const healthOptions = computed(() => healths.value ?? []);

const stateOptions = [
  { label: "Activo",         value: "activo" },
  { label: "En tratamiento", value: "en tratamiento" },
  { label: "Cerrado",        value: "cerrado" },
];

const stateSeverity = (state) => {
  if (state === "activo")          return "success";
  if (state === "en tratamiento")  return "warn";
  if (state === "cerrado")         return "secondary";
  return "info";
};

const stateDotClass = (state) => {
  if (state === "activo")         return "bg-green-500";
  if (state === "en tratamiento") return "bg-orange-400";
  if (state === "cerrado")        return "bg-gray-400";
  return "bg-blue-400";
};

function getInitials(patient) {
  const a = patient?.primerApellido?.[0] ?? "";
  const n = patient?.nombres?.[0] ?? "";
  return (a + n).toUpperCase() || "?";
}

const localSearch    = ref("");
const localState     = ref(null);
const localHealth    = ref(null);
const localDateRange = ref(null);
const panel      = ref(null);
const statePanel = ref(null);
const activeRow   = ref(null);

function openPanel(event, data) {
  activeRow.value = data;
  panel.value.toggle(event);
}

const viewDetail = () => {
  panel.value?.hide();
  router.push({ name: "health-record-detail", params: { id: activeRow.value._id } });
};

const archiveRow = () => {
  panel.value?.hide();
  onArchivedRecord(activeRow.value?._id);
};

const unarchiveRow = () => {
  panel.value?.hide();
  onUnarchiveRecord(activeRow.value?._id);
};

const openStateMenu = (event) => {
  panel.value?.hide();
  statePanel.value?.toggle(event);
};

const changeState = async (newState) => {
  statePanel.value?.hide();
  await onUpdateState(activeRow.value?._id, newState);
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

const onDateRangeChange = async (val) => {
  if (val && val[0] && val[1]) {
    await setDateFilter(val[0].toISOString(), val[1].toISOString());
  } else if (!val) {
    await setDateFilter(null, null);
  }
};

const clearFilters = async () => {
  localSearch.value    = "";
  localState.value     = null;
  localHealth.value    = null;
  localDateRange.value = null;
  await resetFilters();
};

onMounted(async () => {
  await userStore.getUser();
  if (isAdmin.value) await healthStore.getHealths();
  await setRecords();
});
</script>