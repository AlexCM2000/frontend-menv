<template>
  <Card class="m-5">
    <template #title>
      <div class="flex items-center">
        <div class="flex-1">
          <p class="font-semibold text-lg">Lista de Usuarios</p>
        </div>
        <div class="flex-1 text-right">
          <Button
            size="small"
            icon="pi pi-plus"
            label="Nuevo"
            @click="openNewUser"
          />
        </div>
      </div>
    </template>

    <template #content>
      <!-- Filtros -->
      <div class="mb-4 flex gap-2">
        <InputText
          v-model="localSearch"
          placeholder="Buscar por nombre, email..."
          class="flex-1"
          @keyup.enter="onSearchHandler"
        />
        <Button label="Buscar" icon="pi pi-search" @click="onSearchHandler" />
        <Button
          label="Limpiar"
          icon="pi pi-times"
          class="p-button-secondary"
          @click="clearFilters"
        />
      </div>

      <!-- Skeleton mientras carga -->
      <DataTable v-if="loading" :value="skeletonRows" showGridLines>
        <Column style="min-width: 220px">
          <template #header
            ><p class="font-semibold text-base">Usuario</p></template
          >
          <template #body>
            <div class="flex items-center gap-3">
              <Skeleton shape="circle" size="2.2rem" />
              <div class="flex-1">
                <Skeleton width="65%" height="0.9rem" class="mb-2" />
                <Skeleton width="45%" height="0.75rem" />
              </div>
            </div>
          </template>
        </Column>
        <Column style="min-width: 160px">
          <template #header
            ><p class="font-semibold text-base">Centro de salud</p></template
          >
          <template #body>
            <Skeleton width="75%" height="0.9rem" class="mb-2" />
            <Skeleton width="40%" height="0.75rem" />
          </template>
        </Column>
        <Column style="min-width: 120px">
          <template #header
            ><p class="font-semibold text-base">Rol</p></template
          >
          <template #body
            ><Skeleton width="55%" height="1.4rem" borderRadius="1rem"
          /></template>
        </Column>
        <Column style="min-width: 110px">
          <template #header
            ><p class="font-semibold text-base">Estado</p></template
          >
          <template #body
            ><Skeleton width="60%" height="1.4rem" borderRadius="1rem"
          /></template>
        </Column>
        <Column style="min-width: 80px">
          <template #header
            ><p class="font-semibold text-base">Acción</p></template
          >
          <template #body
            ><Skeleton shape="circle" size="2rem" class="mx-auto"
          /></template>
        </Column>
      </DataTable>

      <!-- Tabla real -->
      <DataTable
        v-else
        :value="users"
        v-model:first="page_first"
        :total-records="totalRecords"
        @page="onPage($event)"
        :rowsPerPageOptions="[10, 20, 50]"
        showGridLines
        paginator
        :rows="page_size"
        lazy
        stripedRows
      >
        <!-- Usuario -->
        <Column style="min-width: 220px">
          <template #header>
            <p class="font-semibold text-base">Usuario</p>
          </template>
          <template #body="{ data }">
            <div class="flex items-center gap-3">
              <Avatar
                :label="getInitials(data.name)"
                shape="circle"
                class="bg-indigo-100 text-indigo-700 font-semibold flex-shrink-0"
              />
              <div>
                <p class="font-semibold text-sm text-gray-800">
                  {{ data.name }}
                </p>
                <p class="text-xs text-gray-400">{{ data.email }}</p>
              </div>
            </div>
          </template>
        </Column>

        <!-- Centro de salud -->
        <Column style="min-width: 160px">
          <template #header>
            <p class="font-semibold text-base">Centro de salud</p>
          </template>
          <template #body="{ data }">
            <div v-if="data.health">
              <p class="text-sm font-medium text-gray-700">
                {{ data.health.name }}
              </p>
              <p class="text-xs text-gray-400">Cód. {{ data.health.codigo }}</p>
            </div>
            <span v-else class="text-xs text-gray-400 italic">Sin asignar</span>
          </template>
        </Column>

        <!-- Rol -->
        <Column style="min-width: 120px">
          <template #header>
            <p class="font-semibold text-base">Rol</p>
          </template>
          <template #body="{ data }">
            <Tag
              v-if="data.admin"
              value="Admin"
              severity="danger"
              class="text-xs"
            />
            <Tag
              v-else-if="data.branchManager"
              value="Gerente"
              severity="warning"
              class="text-xs"
            />
            <Tag v-else value="Usuario" severity="info" class="text-xs" />
          </template>
        </Column>

        <!-- Estado -->
        <Column style="min-width: 110px">
          <template #header>
            <p class="font-semibold text-base">Estado</p>
          </template>
          <template #body="{ data }">
            <Tag
              :value="data.verified ? 'Verificado' : 'Pendiente'"
              :severity="data.verified ? 'success' : 'secondary'"
              :icon="data.verified ? 'pi pi-check-circle' : 'pi pi-clock'"
              class="text-xs"
            />
          </template>
        </Column>

        <!-- Acciones -->
        <Column style="min-width: 80px; text-align: center">
          <template #header>
            <p class="font-semibold text-base">Acción</p>
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
      <OverlayPanel
        ref="panel"
        appendTo="body"
        :showCloseIcon="false"
        style="min-width: 160px"
      >
        <ul class="py-1">
          <li
            class="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer rounded"
            @click="viewUser(activeRow)"
          >
            <i class="pi pi-eye text-gray-500 text-sm"></i>
            Ver detalle
          </li>
          <li
            class="flex items-center gap-2 px-4 py-2 text-sm hover:bg-indigo-50 cursor-pointer rounded"
            @click="onEditUser(activeRow)"
          >
            <i class="pi pi-pencil text-indigo-500 text-sm"></i>
            Editar
          </li>
        </ul>
      </OverlayPanel>
    </template>
  </Card>

  <!-- Modales -->
  <ModalUserForm ref="formModal" />
  <ModalUserDetail ref="detailModal" />
</template>

<script setup>
import { storeToRefs } from "pinia";
import Card from "primevue/card";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import OverlayPanel from "primevue/overlaypanel";
import Skeleton from "primevue/skeleton";
import Avatar from "primevue/avatar";
import Tag from "primevue/tag";
import { ref, onMounted } from "vue";

import { useUsersStore } from "@/modules/users/store/useUserStore";
import { useUserEditorStore } from "@/modules/users/store/useUserEditorStore";
import ModalUserForm from "./ModalUserForm.vue";
import ModalUserDetail from "./ModalUserDetail.vue";

const usersStore = useUsersStore();
const editorStore = useUserEditorStore();

const { users, loading, totalRecords, page_first, page_size } =
  storeToRefs(usersStore);
const { fetchUsers, onPage } = usersStore;

const panel = ref(null);
const formModal = ref(null);
const detailModal = ref(null);
const localSearch = ref("");
const activeRow = ref(null);

// Filas vacías para el skeleton (mismo número que page_size inicial)
const skeletonRows = Array(5).fill({});

// Genera iniciales del nombre para el Avatar
function getInitials(name = "") {
  return name
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function openPanel(event, data) {
  activeRow.value = data;
  panel.value.toggle(event);
}

function onEditUser(user) {
  panel.value.hide();
  formModal.value?.open(user);
}

function viewUser(data) {
  panel.value.hide();
  detailModal.value?.open(data);
}

const openNewUser = () => {
  editorStore.resetEditor();
  formModal.value?.open();
};

const onSearchHandler = async () => {
  usersStore.search = localSearch.value?.trim() || null;
  usersStore.page = 1;
  await usersStore.fetchUsers();
};

const clearFilters = async () => {
  localSearch.value = "";
  await usersStore.resetFilters();
};

onMounted(async () => {
  await fetchUsers();
});
</script>
