<template>
  <Card class="m-3 sm:m-5">
    <template #title>
      <div class="flex items-center gap-2">
        <div class="flex-1">
          <p class="font-bold text-base text-gray-800">Lista de Servicios</p>
          <p class="text-xs font-normal text-gray-400 mt-0.5">
            {{ totalRecords }} registro{{ totalRecords !== 1 ? "s" : "" }} encontrado{{ totalRecords !== 1 ? "s" : "" }}
          </p>
        </div>
        <ExportMenu
          endpoint="/export/services"
          :params="exportParams"
          filename="servicios"
        />
        <Button size="small" icon="pi pi-plus" label="Nuevo servicio" @click="openModal" />
      </div>
    </template>

    <template #content>
      <!-- Filtros -->
      <div class="flex flex-col sm:flex-row gap-2 mb-4 sm:items-center flex-wrap">
        <IconField class="w-full sm:flex-1">
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="localSearch"
            placeholder="Buscar por nombre..."
            class="w-full"
            @keyup.enter="onSearchHandler"
          />
        </IconField>

        <Select
          v-model="localCategory"
          :options="categoryOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Categoría"
          showClear
          class="w-full sm:w-48"
          @change="onCategoryChange"
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
        <Column style="min-width: 140px">
          <template #header><Skeleton width="60%" height="1rem" /></template>
          <template #body><Skeleton width="65%" height="0.9rem" /></template>
        </Column>
        <Column style="min-width: 60px">
          <template #header><Skeleton width="40%" height="1rem" /></template>
          <template #body>
            <div class="flex justify-center">
              <Skeleton shape="circle" size="2rem" />
            </div>
          </template>
        </Column>
      </DataTable>

      <!-- Tabla real -->
      <DataTable
        v-else
        :value="services"
        v-model:first="page_first"
        :total-records="totalRecords"
        @page="onPage($event)"
        :rowsPerPageOptions="[10, 20, 50]"
        showGridLines
        paginator
        :rows="page_size"
        lazy
        stripedRows
        scrollable
        scrollHeight="flex"
      >
        <template #empty>
          <div class="flex flex-col items-center justify-center py-12 gap-3">
            <img src="/img/undraw_no_data.svg" alt="Sin datos" class="w-44 opacity-60" />
            <p class="text-sm text-gray-400">No se encontraron servicios</p>
          </div>
        </template>

        <Column style="min-width: 180px">
          <template #header><p class="font-semibold text-sm">Nombre</p></template>
          <template #body="{ data }">
            <p class="font-semibold text-sm text-gray-800">{{ data.name }}</p>
          </template>
        </Column>

        <Column style="min-width: 140px">
          <template #header><p class="font-semibold text-sm">Categoría</p></template>
          <template #body="{ data }">
            <p class="text-sm text-gray-600">{{ data.category }}</p>
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

      <Popover ref="panel" appendTo="body" style="min-width: 150px">
        <p class="text-xs text-gray-400 uppercase tracking-wider px-4 pt-2 pb-1 font-semibold">Opciones</p>
        <ul class="pb-1">
          <li
            class="flex items-center gap-2 px-4 py-2 text-sm hover:bg-indigo-50 cursor-pointer rounded-lg"
            @click="editService(activeRow)"
          >
            <i class="pi pi-pencil text-indigo-500 text-sm"></i> Editar
          </li>
          <li class="border-t border-gray-100 my-1" />
          <li
            class="flex items-center gap-2 px-4 py-2 text-sm hover:bg-red-50 text-red-600 cursor-pointer rounded-lg"
            @click="deleteService(activeRow)"
          >
            <i class="pi pi-trash text-sm"></i> Eliminar
          </li>
        </ul>
      </Popover>
    </template>
  </Card>

  <ModalServiceForm />
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import Swal from "sweetalert2";
import Card from "primevue/card";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Select from "primevue/select";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import Button from "primevue/button";
import Skeleton from "primevue/skeleton";
import Popover from "primevue/popover";
import { useServicesAdminStore } from "../store/servicesAdminStore";
import ExportMenu from "@/components/ExportMenu.vue";
import ModalServiceForm from "./ModalServiceForm.vue";

const store = useServicesAdminStore();
const { loading, services, totalRecords, page_first, page_size, availableCategories } = storeToRefs(store);
const { fetchServices, loadCategories, openModal, onCurrentService, onDeleteService, onPage } = store;

const localSearch = ref("");
const localCategory = ref(null);
const panel = ref(null);
const activeRow = ref(null);

function openPanel(event, data) {
  activeRow.value = data;
  panel.value.toggle(event);
}

const editService = (data) => {
  panel.value?.hide();
  onCurrentService(data);
};

const deleteService = (data) => {
  panel.value?.hide();
  confirmDelete(data);
};

const exportParams = computed(() => ({
  ...(localSearch.value   && { search:   localSearch.value   }),
  ...(localCategory.value && { category: localCategory.value }),
}));

const categoryOptions = computed(() =>
  availableCategories.value.map((c) => ({ label: c.name, value: c.name }))
);

const onSearchHandler = async () => {
  store.search = localSearch.value?.trim() || "";
  store.page = 1;
  await fetchServices();
};

const onCategoryChange = async () => {
  store.categoryFilter = localCategory.value ?? null;
  store.page = 1;
  await fetchServices();
};

const clearFilters = async () => {
  localSearch.value = "";
  localCategory.value = null;
  store.search = "";
  store.categoryFilter = null;
  store.page = 1;
  await fetchServices();
};

const confirmDelete = (data) => {
  Swal.fire({
    title: "¿Eliminar servicio?",
    html: `El servicio <strong>"${data.name}"</strong> será eliminado permanentemente.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    buttonsStyling: false,
    customClass: {
      popup: "rounded-xl shadow-md",
      confirmButton: "bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition",
      cancelButton: "bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition ml-2",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      onDeleteService(data._id);
    }
  });
};

onMounted(async () => {
  await loadCategories();
  await fetchServices();
});
</script>