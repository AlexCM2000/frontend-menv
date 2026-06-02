<template>
  <div class="px-3 sm:px-5 pt-4">
    <Card :pt="{ body: { class: 'px-3 sm:px-5' } }">
      <template #title>
        <div class="flex items-center gap-2">
          <div class="flex-1">
            <p class="font-bold text-base text-gray-800">Registro de auditoría</p>
            <p class="text-xs font-normal text-gray-400 mt-0.5">
              {{ totalRecords }} evento{{ totalRecords !== 1 ? "s" : "" }} registrado{{ totalRecords !== 1 ? "s" : "" }}
            </p>
          </div>
        </div>
      </template>

      <template #content>
        <!-- Filtro por acción -->
        <div class="flex flex-col sm:flex-row gap-2 mb-4 sm:items-center">
          <Select
            v-model="selectedAction"
            :options="actionOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Todas las acciones"
            showClear
            class="w-full sm:w-64"
            @change="onActionChange"
          />
          <Button
            icon="pi pi-filter-slash"
            severity="secondary"
            outlined
            v-tooltip.top="'Limpiar filtro'"
            @click="clearFilter"
          />
        </div>

        <!-- Skeleton -->
        <DataTable v-if="loading" :value="Array(5).fill({})" showGridLines>
          <Column v-for="n in 5" :key="n" style="min-width: 120px">
            <template #header><Skeleton width="60%" height="1rem" /></template>
            <template #body><Skeleton width="75%" height="0.85rem" /></template>
          </Column>
        </DataTable>

        <!-- Tabla real -->
        <DataTable
          v-else
          :value="logs"
          v-model:first="page_first"
          :total-records="totalRecords"
          @page="onPage($event)"
          :rowsPerPageOptions="[10, 20, 50]"
          showGridLines
          paginator
          :rows="pageSize"
          lazy
          stripedRows
          scrollable
        >
          <!-- Fecha -->
          <Column style="min-width: 160px">
            <template #header><p class="font-semibold text-sm">Fecha y hora</p></template>
            <template #body="{ data }">
              <div class="flex items-center gap-1.5">
                <i class="pi pi-clock text-xs text-gray-400" />
                <p class="text-sm text-gray-700 font-mono">{{ data.createdAt }}</p>
              </div>
            </template>
          </Column>

          <!-- Acción -->
          <Column style="min-width: 200px">
            <template #header><p class="font-semibold text-sm">Acción</p></template>
            <template #body="{ data }">
              <Tag :value="data.actionLabel" :severity="actionSeverity(data.action)" class="text-xs" />
            </template>
          </Column>

          <!-- Realizado por -->
          <Column style="min-width: 200px">
            <template #header><p class="font-semibold text-sm">Realizado por</p></template>
            <template #body="{ data }">
              <div v-if="data.performedBy">
                <p class="text-sm font-semibold text-gray-800">{{ displayName(data.performedBy.name) }}</p>
                <p class="text-xs text-gray-400">{{ data.performedBy.email }}</p>
                <Tag :value="data.performedBy.role" severity="secondary" class="text-xs mt-0.5" />
              </div>
              <span v-else class="text-xs text-gray-400">—</span>
            </template>
          </Column>

          <!-- Afectado -->
          <Column style="min-width: 180px">
            <template #header><p class="font-semibold text-sm">Usuario afectado</p></template>
            <template #body="{ data }">
              <div v-if="data.targetUser">
                <p class="text-sm text-gray-700">{{ displayName(data.targetUser.name) }}</p>
                <p class="text-xs text-gray-400">{{ data.targetUser.email }}</p>
              </div>
              <span v-else class="text-xs text-gray-400">—</span>
            </template>
          </Column>

          <!-- Descripción + detalles -->
          <Column style="min-width: 240px">
            <template #header><p class="font-semibold text-sm">Descripción</p></template>
            <template #body="{ data }">
              <p class="text-sm text-gray-600">{{ data.description || "—" }}</p>

              <!-- Detalles de cambios (ej: cambio de rol) -->
              <div v-if="hasDetails(data.details)" class="mt-1.5 space-y-1">
                <template v-for="(change, field) in data.details" :key="field">
                  <!-- Cambio con from → to -->
                  <div
                    v-if="isChangeObject(change)"
                    class="flex items-center gap-1 flex-wrap text-xs"
                  >
                    <span class="font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                      {{ fieldLabel(field) }}
                    </span>
                    <span class="text-red-400 font-mono">{{ formatValue(change.from) }}</span>
                    <i class="pi pi-arrow-right text-[9px] text-gray-400" />
                    <span class="text-green-500 font-mono">{{ formatValue(change.to) }}</span>
                  </div>
                  <!-- Valor simple -->
                  <div v-else class="flex items-center gap-1 flex-wrap text-xs">
                    <span class="font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                      {{ fieldLabel(field) }}
                    </span>
                    <span class="text-gray-600 font-mono">{{ formatValue(change) }}</span>
                  </div>
                </template>
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import Card from "primevue/card";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Tag from "primevue/tag";
import Select from "primevue/select";
import Button from "primevue/button";
import Skeleton from "primevue/skeleton";
import api from "@/lib/axios";

const logs = ref([]);
const loading = ref(false);
const totalRecords = ref(0);
const page = ref(1);
const pageSize = ref(20);
const selectedAction = ref(null);
const page_first = computed(() => (page.value - 1) * pageSize.value);

const actionOptions = [
  { label: "Cambio de rol",                value: "role_change" },
  { label: "Restablecimiento contraseña",  value: "password_reset" },
  { label: "Eliminación de paciente",      value: "patient_delete" },
  { label: "Cambio de estado (historial)", value: "health_record_state_change" },
  { label: "Actualización de perfil",      value: "profile_update" },
];

const FIELD_LABELS = {
  admin:         "Administrador",
  branchManager: "Gestor de sucursal",
  doctor:        "Médico",
  doctorProfile: "Perfil de médico",
  verified:      "Cuenta verificada",
  email:         "Correo electrónico",
  nombres:       "Nombres",
  primerApellido:"Primer apellido",
  segundoApellido:"Segundo apellido",
  phone:         "Teléfono",
  state:         "Estado",
};

const fieldLabel = (field) => FIELD_LABELS[field] ?? field;

const formatValue = (v) => {
  if (v === true  || v === "true")  return "Sí";
  if (v === false || v === "false") return "No";
  if (v === null || v === undefined || v === "") return "—";
  return String(v);
};

const displayName = (name) => (name && name.trim()) ? name.trim() : "—";

const isChangeObject = (val) =>
  val !== null && typeof val === "object" && !Array.isArray(val) && ("from" in val || "to" in val);

const hasDetails = (details) =>
  details !== null && typeof details === "object" && Object.keys(details).length > 0;

const actionSeverity = (action) => {
  if (action === "role_change")                return "warn";
  if (action === "password_reset")             return "info";
  if (action === "patient_delete")             return "danger";
  if (action === "health_record_state_change") return "secondary";
  if (action === "profile_update")             return "success";
  return "secondary";
};

const fetchLogs = async () => {
  loading.value = true;
  try {
    const { data } = await api.get("/audit-logs", {
      params: {
        page: page.value,
        page_size: pageSize.value,
        ...(selectedAction.value && { action: selectedAction.value }),
      },
    });
    logs.value = data.results ?? [];
    totalRecords.value = data.count ?? 0;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const onPage = async (event) => {
  page.value = event.page + 1;
  pageSize.value = event.rows;
  await fetchLogs();
};

const onActionChange = async () => {
  page.value = 1;
  await fetchLogs();
};

const clearFilter = async () => {
  selectedAction.value = null;
  page.value = 1;
  await fetchLogs();
};

onMounted(fetchLogs);
</script>
