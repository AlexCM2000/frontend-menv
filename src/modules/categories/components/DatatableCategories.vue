<template>
  <Card class="m-3 sm:m-5">
    <template #title>
      <div class="flex items-center gap-2">
        <p class="font-semibold text-lg flex-1">Lista de Categorías</p>
        <Button size="small" icon="pi pi-plus" label="Nueva categoría" @click="openModal" />
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
          v-model="localActive"
          :options="activeOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Estado"
          showClear
          class="w-full sm:w-36"
          @change="onActiveChange"
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
      <DataTable v-if="loading" :value="Array(4).fill({})" showGridLines>
        <Column style="min-width: 60px">
          <template #header><Skeleton width="50%" height="1rem" /></template>
          <template #body><Skeleton shape="circle" size="2.5rem" class="mx-auto" /></template>
        </Column>
        <Column style="min-width: 160px">
          <template #header><Skeleton width="60%" height="1rem" /></template>
          <template #body><Skeleton width="70%" height="0.9rem" /></template>
        </Column>
        <Column style="min-width: 220px">
          <template #header><Skeleton width="60%" height="1rem" /></template>
          <template #body><Skeleton width="85%" height="0.9rem" /></template>
        </Column>
        <Column style="min-width: 80px">
          <template #header><Skeleton width="50%" height="1rem" /></template>
          <template #body><Skeleton width="55%" height="1.4rem" borderRadius="1rem" /></template>
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
        :value="categories"
        showGridLines
        stripedRows
        scrollable
        scrollHeight="flex"
      >
        <Column style="min-width: 60px; text-align: center">
          <template #header><p class="font-semibold text-sm">Icono</p></template>
          <template #body="{ data }">
            <div class="flex justify-center">
              <img
                :src="`/img/${data.icon}`"
                :alt="data.name"
                class="h-10 w-10 object-contain rounded-full bg-sky-100 p-1"
              />
            </div>
          </template>
        </Column>

        <Column style="min-width: 160px">
          <template #header><p class="font-semibold text-sm">Nombre</p></template>
          <template #body="{ data }">
            <p class="font-semibold text-sm text-gray-800">{{ data.name }}</p>
          </template>
        </Column>

        <Column style="min-width: 220px" class="hidden sm:table-cell">
          <template #header><p class="font-semibold text-sm">Descripción</p></template>
          <template #body="{ data }">
            <p class="text-sm text-gray-500">{{ data.description || "—" }}</p>
          </template>
        </Column>

        <Column style="min-width: 90px">
          <template #header><p class="font-semibold text-sm">Estado</p></template>
          <template #body="{ data }">
            <Tag
              :value="data.active ? 'Activa' : 'Inactiva'"
              :severity="data.active ? 'success' : 'secondary'"
              class="text-xs"
            />
          </template>
        </Column>

        <Column style="min-width: 90px; text-align: center">
          <template #header><p class="font-semibold text-sm">Acciones</p></template>
          <template #body="{ data }">
            <div class="flex justify-center gap-1">
              <Button
                icon="pi pi-pencil"
                size="small"
                severity="info"
                text
                v-tooltip.top="'Editar'"
                @click="onCurrentCategory(data)"
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

  <ModalCategoryForm />
</template>

<script setup>
import { ref, onMounted } from "vue";
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
import Skeleton from "primevue/skeleton";
import { useCategoryStore } from "../store/categoryStore";
import ModalCategoryForm from "./ModalCategoryForm.vue";

const categoryStore = useCategoryStore();
const { loading, categories } = storeToRefs(categoryStore);
const { fetchCategories, openModal, onCurrentCategory, onDeleteCategory } = categoryStore;

const localSearch = ref("");
const localActive = ref(null);

const activeOptions = [
  { label: "Activa", value: "true" },
  { label: "Inactiva", value: "false" },
];

const onSearchHandler = async () => {
  categoryStore.search = localSearch.value?.trim() || "";
  await fetchCategories();
};

const onActiveChange = async () => {
  categoryStore.activeFilter = localActive.value ?? null;
  await fetchCategories();
};

const clearFilters = async () => {
  localSearch.value = "";
  localActive.value = null;
  categoryStore.search = "";
  categoryStore.activeFilter = null;
  await fetchCategories();
};

const confirmDelete = (data) => {
  if (confirm(`¿Deseas eliminar la categoría "${data.name}"?`)) {
    onDeleteCategory(data._id);
  }
};

onMounted(async () => {
  await fetchCategories();
});
</script>