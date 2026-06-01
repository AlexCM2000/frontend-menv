<script setup>
import { ref, onMounted, computed } from "vue";
import { storeToRefs } from "pinia";
import { useStockStore } from "@/stores/stockStore";
import { useUserStore } from "@/stores/user";
import Swal from "sweetalert2";
import { format, differenceInDays, isPast } from "date-fns";
import { es } from "date-fns/locale";

import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Tag from "primevue/tag";
import Select from "primevue/select";
import Skeleton from "primevue/skeleton";
import Dialog from "primevue/dialog";
import InputNumber from "primevue/inputnumber";
import DatePicker from "primevue/datepicker";

const stockStore = useStockStore();
const { items, loading, saving, total, page, pageSize, pageFirst, expiringItems, loadingExpiring } =
  storeToRefs(stockStore);

const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const isAdmin = computed(() => user.value?.admin === true);
const canManage = computed(
  () =>
    user.value?.admin || user.value?.branchManager || user.value?.pharmacist,
);

// Filtros
const searchInput = ref("");
const activeFilter = ref("true");

const ACTIVE_OPTIONS = [
  { label: "Activos", value: "true" },
  { label: "Inactivos", value: "false" },
  { label: "Todos", value: "" },
];

const CATEGORIES = [
  "antibiótico",
  "analgésico",
  "antihipertensivo",
  "antidiabético",
  "vitamina",
  "otro",
];
const FORMS = ["comprimido", "cápsula", "jarabe", "inyectable", "crema"];
const UNITS = ["comprimidos", "ml", "frascos"];

const categoryLabel = (c) => c.charAt(0).toUpperCase() + c.slice(1);

const categorySeverity = (cat) => {
  const map = {
    antibiótico: "danger",
    analgésico: "warn",
    antihipertensivo: "info",
    antidiabético: "secondary",
    vitamina: "success",
    otro: "contrast",
  };
  return map[cat] ?? "secondary";
};

// Modal crear / editar
const showModal = ref(false);
const isEdit = ref(false);
const editingId = ref(null);

const emptyForm = () => ({
  name: "",
  category: "",
  pharmaceuticalForm: "",
  unit: "",
  availableQuantity: 0,
  minimumQuantity: 5,
  expirationDate: null,
});

const form = ref(emptyForm());

const openCreate = () => {
  form.value = emptyForm();
  isEdit.value = false;
  editingId.value = null;
  showModal.value = true;
};

const openEdit = (row) => {
  form.value = {
    name: row.name,
    category: row.category,
    pharmaceuticalForm: row.pharmaceuticalForm,
    unit: row.unit,
    availableQuantity: row.availableQuantity,
    minimumQuantity: row.minimumQuantity,
    expirationDate: row.expirationDate ? new Date(row.expirationDate) : null,
  };
  isEdit.value = true;
  editingId.value = row._id;
  showModal.value = true;
};

const submitForm = async () => {
  if (
    !form.value.name ||
    !form.value.category ||
    !form.value.pharmaceuticalForm ||
    !form.value.unit
  )
    return;
  if (isEdit.value) {
    await stockStore.updateStock(editingId.value, form.value);
  } else {
    await stockStore.createStock(form.value);
  }
  showModal.value = false;
  await stockStore.loadStock();
};

// Toggle activo
const confirmToggle = async (row) => {
  const action = row.active ? "desactivar" : "activar";
  const result = await Swal.fire({
    title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} "${row.name}"?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: `Sí, ${action}`,
    cancelButtonText: "Cancelar",
    buttonsStyling: false,
    customClass: {
      confirmButton:
        "bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700 transition",
      cancelButton: "bg-gray-300 text-gray-800 px-4 py-2 rounded ml-2",
    },
  });
  if (!result.isConfirmed) return;
  await stockStore.toggleActive(row._id);
};

// Paginación y búsqueda
const doSearch = async () => {
  stockStore.search = searchInput.value;
  stockStore.filterActive = activeFilter.value;
  stockStore.page = 1;
  await stockStore.loadStock();
};

const clearFilters = async () => {
  searchInput.value = "";
  activeFilter.value = "true";
  stockStore.search = "";
  stockStore.filterActive = "true";
  stockStore.page = 1;
  await stockStore.loadStock();
};

// Clase visual de cantidad disponible
const qtyClass = (row) => {
  if (row.availableQuantity <= row.minimumQuantity)
    return "font-bold text-red-600";
  return "font-semibold text-green-700";
};

// Helpers para fecha de vencimiento
const formatExp = (date) => {
  if (!date) return null;
  return format(new Date(date), "dd/MM/yyyy", { locale: es });
};

const expirationStatus = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (isPast(d)) return "vencido";
  const days = differenceInDays(d, new Date());
  if (days <= 5) return "proximo";
  return "ok";
};

const expirationTagSeverity = (date) => {
  const s = expirationStatus(date);
  if (s === "vencido") return "danger";
  if (s === "proximo") return "warn";
  return "success";
};

const expirationLabel = (date) => {
  const s = expirationStatus(date);
  const f = formatExp(date);
  if (s === "vencido") return `${f} — VENCIDO`;
  if (s === "proximo") return `${f} — próximo`;
  return f;
};

onMounted(async () => {
  await stockStore.loadStock();
  await stockStore.loadExpiring();
});
</script>

<template>
  <div class="px-4 sm:px-6 py-6 max-w-6xl mx-auto space-y-5">
    <!-- Encabezado -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center shrink-0"
        >
          <i class="pi pi-box text-teal-600 text-lg"></i>
        </div>
        <div>
          <h1 class="text-xl font-bold text-gray-800">Stock de Medicamentos</h1>
          <p class="text-sm text-gray-500">Inventario por centro de salud</p>
        </div>
      </div>
      <Button
        v-if="canManage"
        label="Nuevo medicamento"
        icon="pi pi-plus"
        @click="openCreate"
        class="shrink-0"
      />
    </div>

    <!-- Banner de alertas de vencimiento -->
    <div
      v-if="expiringItems.length > 0"
      class="rounded-xl border border-orange-200 bg-orange-50 p-4 space-y-2"
    >
      <div class="flex items-center gap-2 text-orange-700 font-semibold text-sm">
        <i class="pi pi-exclamation-triangle text-base"></i>
        {{ expiringItems.length }} medicamento{{ expiringItems.length > 1 ? 's' : '' }}
        con fecha de vencimiento próxima o vencida
      </div>
      <ul class="space-y-1">
        <li
          v-for="item in expiringItems"
          :key="item._id"
          class="flex flex-wrap items-center gap-2 text-sm"
        >
          <Tag
            :value="isPast(new Date(item.expirationDate)) ? 'VENCIDO' : 'Próximo'"
            :severity="isPast(new Date(item.expirationDate)) ? 'danger' : 'warn'"
            class="text-xs"
          />
          <span class="font-medium text-gray-800">{{ item.name }}</span>
          <span class="text-gray-500 text-xs">
            — vence {{ format(new Date(item.expirationDate), "dd/MM/yyyy", { locale: es }) }}
            <template v-if="!isPast(new Date(item.expirationDate))">
              ({{ differenceInDays(new Date(item.expirationDate), new Date()) }} días)
            </template>
          </span>
          <span v-if="isAdmin" class="text-gray-400 text-xs">· {{ item.health?.name }}</span>
        </li>
      </ul>
    </div>

    <!-- Filtros -->
    <div class="flex flex-wrap gap-2">
      <InputText
        v-model="searchInput"
        placeholder="Buscar por nombre..."
        class="flex-1 min-w-[200px]"
        @keyup.enter="doSearch"
      />
      <Select
        v-model="activeFilter"
        :options="ACTIVE_OPTIONS"
        optionLabel="label"
        optionValue="value"
        class="w-36"
      />
      <Button label="Buscar" icon="pi pi-search" @click="doSearch" />
      <Button
        label="Limpiar"
        icon="pi pi-times"
        severity="secondary"
        outlined
        @click="clearFilters"
      />
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
      @page="stockStore.onPage($event)"
      scrollable
      scrollHeight="flex"
      class="text-sm"
      rowHover
    >
      <Column field="name" header="Medicamento" style="min-width: 180px">
        <template #body="{ data }">
          <span class="font-medium text-gray-800">{{ data.name }}</span>
          <div class="text-xs text-gray-400">{{ data.pharmaceuticalForm }}</div>
        </template>
      </Column>

      <Column field="category" header="Categoría" style="min-width: 140px">
        <template #body="{ data }">
          <Tag :value="categoryLabel(data.category)" severity="warn" />
        </template>
      </Column>

      <Column header="Disponible" style="min-width: 130px" class="text-center">
        <template #body="{ data }">
          <span :class="qtyClass(data)">
            {{ data.availableQuantity }} {{ data.unit }}
          </span>
          <div class="text-xs text-gray-400">
            Mín: {{ data.minimumQuantity }}
          </div>
        </template>
      </Column>

      <Column header="Centro" style="min-width: 140px" v-if="isAdmin">
        <template #body="{ data }">
          <span class="text-gray-600 text-xs">{{
            data.health?.name ?? "—"
          }}</span>
        </template>
      </Column>

      <Column header="Vencimiento" style="min-width: 150px">
        <template #body="{ data }">
          <template v-if="data.expirationDate">
            <Tag
              :value="expirationLabel(data.expirationDate)"
              :severity="expirationTagSeverity(data.expirationDate)"
              class="text-xs"
            />
          </template>
          <span v-else class="text-gray-400 text-xs">—</span>
        </template>
      </Column>

      <Column header="Estado" style="min-width: 90px" class="text-center">
        <template #body="{ data }">
          <Tag
            :value="data.active ? 'Activo' : 'Inactivo'"
            :severity="data.active ? 'success' : 'secondary'"
          />
        </template>
      </Column>

      <Column
        header="Acciones"
        style="min-width: 110px"
        class="text-right"
        v-if="canManage"
      >
        <template #body="{ data }">
          <div class="flex gap-1 justify-end">
            <Button
              icon="pi pi-pencil"
              severity="info"
              text
              rounded
              v-tooltip.top="'Editar'"
              @click="openEdit(data)"
            />
            <Button
              :icon="data.active ? 'pi pi-ban' : 'pi pi-check-circle'"
              :severity="data.active ? 'danger' : 'success'"
              text
              rounded
              v-tooltip.top="data.active ? 'Desactivar' : 'Activar'"
              @click="confirmToggle(data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Alerta stock bajo -->
    <p
      class="text-xs text-red-600 flex items-center gap-1"
      v-if="items.some((i) => i.availableQuantity <= i.minimumQuantity)"
    >
      <i class="pi pi-exclamation-triangle"></i>
      Los medicamentos en <strong class="mx-1">rojo</strong> están por debajo
      del stock mínimo.
    </p>

    <!-- Modal crear / editar -->
    <Dialog
      v-model:visible="showModal"
      :header="isEdit ? 'Editar medicamento' : 'Nuevo medicamento'"
      modal
      :style="{ width: '95vw', maxWidth: '480px' }"
    >
      <div class="space-y-4 pt-2">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Nombre *</label
          >
          <InputText
            v-model="form.name"
            class="w-full"
            placeholder="Nombre del medicamento y concentración"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Categoría *</label
            >
            <Select
              v-model="form.category"
              :options="CATEGORIES"
              class="w-full"
              placeholder="Seleccionar"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Forma farmacéutica *</label
            >
            <Select
              v-model="form.pharmaceuticalForm"
              :options="FORMS"
              class="w-full"
              placeholder="Seleccionar"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Unidad *</label
          >
          <Select
            v-model="form.unit"
            :options="UNITS"
            class="w-full"
            placeholder="Seleccionar"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Cantidad disponible</label
            >
            <InputNumber v-model="form.availableQuantity" :min="0" fluid />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Cantidad mínima</label
            >
            <InputNumber v-model="form.minimumQuantity" :min="0" fluid />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Fecha de vencimiento
          </label>
          <DatePicker
            v-model="form.expirationDate"
            dateFormat="dd/mm/yy"
            showIcon
            fluid
            placeholder="dd/mm/aaaa"
            :minDate="new Date()"
          />
        </div>
      </div>

      <template #footer>
        <Button
          label="Cancelar"
          severity="secondary"
          outlined
          @click="showModal = false"
        />
        <Button
          :label="isEdit ? 'Guardar cambios' : 'Crear medicamento'"
          icon="pi pi-check"
          :loading="saving"
          @click="submitForm"
        />
      </template>
    </Dialog>
  </div>
</template>
