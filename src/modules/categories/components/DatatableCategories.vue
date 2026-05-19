<template>
  <Card class="m-3 sm:m-5">
    <template #title>
      <div class="flex items-center gap-2">
        <div class="flex-1">
          <p class="font-bold text-base text-gray-800">Lista de Categorías</p>
          <p class="text-xs font-normal text-gray-400 mt-0.5">
            {{ totalRecords }} registro{{ totalRecords !== 1 ? "s" : "" }} encontrado{{ totalRecords !== 1 ? "s" : "" }}
          </p>
        </div>
        <ExportMenu
          endpoint="/export/categories"
          :params="exportParams"
          filename="categorias"
        />
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
        :value="categories"
        showGridLines
        stripedRows
        scrollable
        scrollHeight="flex"
      >
        <template #empty>
          <div class="flex flex-col items-center justify-center py-12 gap-3">
            <img src="/img/undraw_no_data.svg" alt="Sin datos" class="w-44 opacity-60" />
            <p class="text-sm text-gray-400">No se encontraron categorías</p>
          </div>
        </template>

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
            @click="editCategory(activeRow)"
          >
            <i class="pi pi-pencil text-indigo-500 text-sm"></i> Editar
          </li>
          <li class="border-t border-gray-100 my-1" />
          <li
            class="flex items-center gap-2 px-4 py-2 text-sm hover:bg-red-50 text-red-600 cursor-pointer rounded-lg"
            @click="deleteCategory(activeRow)"
          >
            <i class="pi pi-trash text-sm"></i> Eliminar
          </li>
        </ul>
      </Popover>
    </template>
  </Card>

  <ModalCategoryForm />
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import Swal from "sweetalert2";
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
import Popover from "primevue/popover";
import { useCategoryStore } from "../store/categoryStore";
import ExportMenu from "@/components/ExportMenu.vue";
import ModalCategoryForm from "./ModalCategoryForm.vue";

const categoryStore = useCategoryStore();
const { loading, categories, totalRecords } = storeToRefs(categoryStore);
const { fetchCategories, openModal, onCurrentCategory, onDeleteCategory } = categoryStore;

const localSearch = ref("");
const localActive = ref(null);
const panel = ref(null);
const activeRow = ref(null);

function openPanel(event, data) {
  activeRow.value = data;
  panel.value.toggle(event);
}

const editCategory = (data) => {
  panel.value?.hide();
  onCurrentCategory(data);
};

const deleteCategory = (data) => {
  panel.value?.hide();
  confirmDelete(data);
};

const exportParams = computed(() => ({
  ...(localSearch.value && { search: localSearch.value }),
  ...(localActive.value && { active: localActive.value }),
}));

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
  Swal.fire({
    title: "¿Eliminar categoría?",
    html: `La categoría <strong>"${data.name}"</strong> será eliminada permanentemente.`,
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
      onDeleteCategory(data._id);
    }
  });
};

onMounted(async () => {
  await fetchCategories();
});
</script>