<script setup>
import { ref, onMounted, computed } from "vue";
import { storeToRefs } from "pinia";
import { usePrescriptionStore } from "@/stores/prescriptionStore";
import { useUserStore } from "@/stores/user";
import { generatePrescriptionPdf } from "@/helpers/prescriptionPdf";
import PrescriptionApi from "@/api/prescriptionApi";

import DataTable from "primevue/datatable";
import Column    from "primevue/column";
import Button    from "primevue/button";
import InputText from "primevue/inputtext";
import Tag       from "primevue/tag";
import Select    from "primevue/select";
import Skeleton  from "primevue/skeleton";
import Dialog    from "primevue/dialog";

const prescriptionStore = usePrescriptionStore();
const { items, loading, saving, total, pageSize, pageFirst } = storeToRefs(prescriptionStore);
const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const canDispense = computed(() => user.value?.admin || user.value?.branchManager || user.value?.pharmacist);

// Filtros
const searchInput  = ref("");
const statusFilter = ref("");

const STATUS_OPTIONS = [
  { label: "Todos los estados", value: "" },
  { label: "Pendiente", value: "Pendiente" },
  { label: "Despachada", value: "Despachada" },
];

const statusSeverity = (s) =>
  ({ Pendiente: "warn", Despachada: "success" }[s] ?? "secondary");

const doSearch = async () => {
  prescriptionStore.search = searchInput.value;
  prescriptionStore.filterStatus = statusFilter.value;
  prescriptionStore.page = 1;
  await prescriptionStore.loadPrescriptions();
};

const clearFilters = async () => {
  searchInput.value = "";
  statusFilter.value = "";
  prescriptionStore.search = "";
  prescriptionStore.filterStatus = "";
  prescriptionStore.page = 1;
  await prescriptionStore.loadPrescriptions();
};

// Modal despacho
const showDispatch   = ref(false);
const selectedRx     = ref(null);
const dispatchQtys   = ref({});

const openDispatch = (rx) => {
  selectedRx.value = rx;
  dispatchQtys.value = {};
  rx.items.forEach((item) => {
    if (!item.dispensed) {
      dispatchQtys.value[item._id] = item.quantityToDispense - item.quantityDispensed;
    }
  });
  showDispatch.value = true;
};

const submitDispatch = async () => {
  const payload = Object.entries(dispatchQtys.value)
    .map(([itemId, quantityDispensed]) => ({ itemId, quantityDispensed: Number(quantityDispensed) }))
    .filter((d) => d.quantityDispensed > 0);

  if (payload.length === 0) return;
  await prescriptionStore.dispenseItems(selectedRx.value._id, payload);
  showDispatch.value = false;
  await prescriptionStore.loadPrescriptions();
};

// Helpers de display
const patientName = (p) => {
  if (!p) return "—";
  return [p.primerApellido, p.segundoApellido, p.nombres].filter(Boolean).join(" ");
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("es-BO", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

// Imprimir receta
const printRx = async (rx) => {
  try {
    const { data } = await PrescriptionApi.getPrescriptionById(rx._id);
    await generatePrescriptionPdf(data);
  } catch {
    console.error("Error al generar PDF");
  }
};

onMounted(() => prescriptionStore.loadPrescriptions());
</script>

<template>
  <div class="px-4 sm:px-6 py-6 max-w-6xl mx-auto space-y-5">

    <!-- Encabezado -->
    <div class="flex items-center gap-3 mb-1">
      <div class="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
        <i class="pi pi-file-edit text-violet-600 text-lg"></i>
      </div>
      <div>
        <h1 class="text-xl font-bold text-gray-800">Recetas Médicas</h1>
        <p class="text-sm text-gray-500">Gestión y despacho de recetas</p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="flex flex-wrap gap-2">
      <InputText
        v-model="searchInput"
        placeholder="Buscar por código..."
        class="flex-1 min-w-[200px]"
        @keyup.enter="doSearch"
      />
      <Select
        v-model="statusFilter"
        :options="STATUS_OPTIONS"
        optionLabel="label"
        optionValue="value"
        class="w-44"
      />
      <Button label="Buscar" icon="pi pi-search" @click="doSearch" />
      <Button label="Limpiar" icon="pi pi-times" severity="secondary" outlined @click="clearFilters" />
    </div>

    <!-- Skeleton -->
    <div v-if="loading" class="space-y-2">
      <Skeleton v-for="i in 6" :key="i" height="3rem" />
    </div>

    <!-- Tabla -->
    <DataTable
      v-else
      :value="items"
      lazy
      :totalRecords="total"
      :rows="pageSize"
      :first="pageFirst"
      paginator
      :rowsPerPageOptions="[10, 20, 50]"
      @page="prescriptionStore.onPage($event)"
      scrollable
      class="text-sm"
      rowHover
    >
      <Column field="code" header="Código" style="min-width:150px">
        <template #body="{ data }">
          <span class="font-mono font-bold text-sky-700">{{ data.code }}</span>
        </template>
      </Column>

      <Column header="Paciente" style="min-width:200px">
        <template #body="{ data }">
          <span class="font-medium">{{ patientName(data.patient) }}</span>
          <div class="text-xs text-gray-400">SUS: {{ data.patient?.susCode ?? '—' }}</div>
        </template>
      </Column>

      <Column header="Médico" style="min-width:150px">
        <template #body="{ data }">
          <span class="text-sm text-gray-700">{{ data.doctor?.name ?? '—' }}</span>
          <div class="text-xs text-gray-400">{{ data.doctor?.specialty ?? '' }}</div>
        </template>
      </Column>

      <Column header="Fecha" style="min-width:100px">
        <template #body="{ data }">{{ formatDate(data.date) }}</template>
      </Column>

      <Column header="Ítems" style="min-width:80px" class="text-center">
        <template #body="{ data }">
          <span class="text-sm">{{ data.items?.length ?? 0 }}</span>
        </template>
      </Column>

      <Column header="Estado" style="min-width:110px">
        <template #body="{ data }">
          <Tag :value="data.status" :severity="statusSeverity(data.status)" />
        </template>
      </Column>

      <Column header="Acciones" style="min-width:120px" class="text-right">
        <template #body="{ data }">
          <div class="flex gap-1 justify-end">
            <Button
              icon="pi pi-print"
              severity="info"
              text
              rounded
              v-tooltip.top="'Vista previa / imprimir'"
              @click="printRx(data)"
            />
            <Button
              v-if="canDispense && data.status !== 'Despachada'"
              icon="pi pi-send"
              severity="success"
              text
              rounded
              v-tooltip.top="'Despachar'"
              @click="openDispatch(data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Modal despacho -->
    <Dialog
      v-model:visible="showDispatch"
      header="Despacho de receta"
      modal
      :style="{ width: '95vw', maxWidth: '560px' }"
    >
      <div v-if="selectedRx" class="space-y-4 pt-2">
        <!-- Info receta -->
        <div class="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
          <p><span class="font-medium text-gray-600">Código:</span> <span class="font-mono font-bold text-sky-700">{{ selectedRx.code }}</span></p>
          <p><span class="font-medium text-gray-600">Paciente:</span> {{ patientName(selectedRx.patient) }}</p>
          <p><span class="font-medium text-gray-600">Médico:</span> {{ selectedRx.doctor?.name ?? '—' }}</p>
          <p><span class="font-medium text-gray-600">Fecha:</span> {{ formatDate(selectedRx.date) }}</p>
        </div>

        <!-- Ítems -->
        <div class="space-y-3">
          <p class="text-sm font-semibold text-gray-700">Medicamentos a despachar</p>
          <div
            v-for="item in selectedRx.items"
            :key="item._id"
            class="border rounded-lg p-3 text-sm"
            :class="item.dispensed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1">
                <p class="font-semibold text-gray-800">{{ item.medicationName }}</p>
                <p class="text-gray-500 text-xs">{{ item.dose }} · {{ item.frequency }} · {{ item.duration }}</p>
                <p class="text-gray-500 text-xs">
                  Solicitado: {{ item.quantityToDispense }} {{ item.stock?.unit }}
                  · Despachado: {{ item.quantityDispensed }}
                </p>
              </div>
              <div v-if="item.dispensed" class="text-green-600 shrink-0">
                <i class="pi pi-check-circle text-lg"></i>
              </div>
              <div v-else class="shrink-0 w-24">
                <label class="text-xs text-gray-500 mb-0.5 block">Cantidad</label>
                <input
                  type="number"
                  v-model.number="dispatchQtys[item._id]"
                  :max="item.quantityToDispense - item.quantityDispensed"
                  :min="0"
                  class="w-full border border-gray-300 rounded px-2 py-1 text-sm text-center"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Cancelar" severity="secondary" outlined @click="showDispatch = false" />
        <Button
          label="Confirmar despacho"
          icon="pi pi-send"
          severity="success"
          :loading="saving"
          @click="submitDispatch"
        />
      </template>
    </Dialog>

  </div>
</template>
