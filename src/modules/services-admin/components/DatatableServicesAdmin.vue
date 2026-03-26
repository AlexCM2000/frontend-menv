<template>
  <Card class="m-3 sm:m-5">
    <template #title>
      <div class="flex items-center gap-2">
        <p class="font-semibold text-lg flex-1">Lista de Servicios</p>
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
        <Column style="min-width: 100px">
          <template #header><Skeleton width="50%" height="1rem" /></template>
          <template #body><Skeleton width="50%" height="0.9rem" /></template>
        </Column>
        <Column style="min-width: 80px">
          <template #header><Skeleton width="40%" height="1rem" /></template>
          <template #body>
            <div class="flex gap-1 justify-center">
              <Skeleton shape="circle" size="2rem" />
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

        <Column style="min-width: 100px">
          <template #header><p class="font-semibold text-sm">Precio</p></template>
          <template #body="{ data }">
            <p class="text-sm text-gray-700 font-medium">{{ formatCurrency(data.price) }}</p>
          </template>
        </Column>

        <Column style="min-width: 80px; text-align: center">
          <template #header><p class="font-semibold text-sm">Acciones</p></template>
          <template #body="{ data }">
            <div class="flex justify-center gap-1">
              <Button
                icon="pi pi-pencil"
                size="small"
                severity="info"
                text
                v-tooltip.top="'Editar'"
                @click="onCurrentService(data)"
              />
              <Button
                icon="pi pi-trash"
                size="small"
                severity="danger"
                text
                v-tooltip.top="'Eliminar'"
                @click="confirmDelete(data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </template>
  </Card>

  <ModalServiceForm />
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import Card from "primevue/card";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Select from "primevue/select";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import Button from "primevue/button";
import Skeleton from "primevue/skeleton";
import { useServicesAdminStore } from "../store/servicesAdminStore";
import ModalServiceForm from "./ModalServiceForm.vue";
import { formatCurrency } from "@/helpers";

const store = useServicesAdminStore();
const { loading, services, totalRecords, page_first, page_size, availableCategories } = storeToRefs(store);
const { fetchServices, loadCategories, openModal, onCurrentService, onDeleteService, onPage } = store;

const localSearch = ref("");
const localCategory = ref(null);

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
  if (confirm(`¿Deseas eliminar el servicio "${data.name}"?`)) {
    onDeleteService(data._id);
  }
};

onMounted(async () => {
  await loadCategories();
  await fetchServices();
});
</script>