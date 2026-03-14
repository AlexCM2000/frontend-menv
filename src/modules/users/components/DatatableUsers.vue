<template>
  <Card class="m-3 sm:m-5">
    <template #title>
      <div class="flex items-center gap-2">
        <div class="flex-1">
          <p class="font-bold text-base text-gray-800">Lista de usuarios</p>
          <p class="text-xs font-normal text-gray-400 mt-0.5">
            {{ totalRecords }} registro{{ totalRecords !== 1 ? "s" : "" }} encontrado{{ totalRecords !== 1 ? "s" : "" }}
          </p>
        </div>
        <ExportMenu
          endpoint="/export/users"
          :params="exportParams"
          filename="usuarios"
        />
        <Button size="small" icon="pi pi-plus" label="Nuevo" @click="openNewUser" />
      </div>
    </template>

    <template #content>
      <!-- Barra de filtros -->
      <div class="flex flex-col sm:flex-row gap-2 mb-4 sm:items-center">

        <!-- Búsqueda: flex-1 en desktop -->
        <IconField class="w-full sm:flex-1">
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="localSearch"
            placeholder="Buscar por nombre, email o SUS..."
            class="w-full"
            @keyup.enter="onSearchHandler"
          />
        </IconField>

        <!-- Rol -->
        <Select
          v-model="localRole"
          :options="roleOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Rol"
          showClear
          class="w-full sm:w-36"
          @change="onRoleChange"
        >
          <template #value="{ value }">
            <div v-if="value" class="flex items-center gap-2">
              <Tag :value="roleLabel(value)" :severity="roleSeverity(value)" class="text-xs" />
            </div>
            <span v-else class="text-gray-400">Rol</span>
          </template>
          <template #option="{ option }">
            <Tag :value="option.label" :severity="roleSeverity(option.value)" class="text-xs" />
          </template>
        </Select>

        <!-- Estado de verificación -->
        <Select
          v-model="localVerified"
          :options="verifiedOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Estado"
          showClear
          class="w-full sm:w-40"
          @change="onVerifiedChange"
        />

        <!-- Centro de salud (solo admin) -->
        <Select
          v-if="isAdmin"
          v-model="localHealth"
          :options="healths"
          optionLabel="label"
          optionValue="value"
          placeholder="Centro de salud"
          showClear
          class="w-full sm:w-48"
          @change="onHealthChange"
        />

        <!-- Acciones -->
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

      <!-- Skeleton mientras carga -->
      <DataTable v-if="loading" :value="skeletonRows" showGridLines>
        <Column style="min-width: 220px">
          <template #header><p class="font-semibold text-sm">Usuario</p></template>
          <template #body>
            <div class="flex items-center gap-3">
              <Skeleton shape="circle" size="2.2rem" />
              <div class="flex-1">
                <Skeleton width="65%" height="0.85rem" class="mb-2" />
                <Skeleton width="45%" height="0.75rem" />
              </div>
            </div>
          </template>
        </Column>
        <Column style="min-width: 160px">
          <template #header><p class="font-semibold text-sm">Centro de salud</p></template>
          <template #body>
            <Skeleton width="75%" height="0.85rem" class="mb-2" />
            <Skeleton width="40%" height="0.75rem" />
          </template>
        </Column>
        <Column style="min-width: 100px">
          <template #header><p class="font-semibold text-sm">Rol</p></template>
          <template #body><Skeleton width="55%" height="1.4rem" borderRadius="1rem" /></template>
        </Column>
        <Column style="min-width: 110px">
          <template #header><p class="font-semibold text-sm">Estado</p></template>
          <template #body><Skeleton width="60%" height="1.4rem" borderRadius="1rem" /></template>
        </Column>
        <Column style="min-width: 60px">
          <template #header><p class="font-semibold text-sm">Acción</p></template>
          <template #body><Skeleton shape="circle" size="2rem" class="mx-auto" /></template>
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
        scrollable
      >
        <!-- Usuario -->
        <Column style="min-width: 220px">
          <template #header><p class="font-semibold text-sm">Usuario</p></template>
          <template #body="{ data }">
            <div class="flex items-center gap-3">
              <Avatar
                :label="getInitials(data.name)"
                shape="circle"
                class="bg-indigo-100 text-indigo-700 font-semibold flex-shrink-0 text-sm"
              />
              <div class="min-w-0">
                <p class="font-semibold text-sm text-gray-800 truncate">{{ data.name }}</p>
                <p class="text-xs text-gray-400 truncate">{{ data.email }}</p>
                <p class="text-xs text-gray-300 font-mono mt-0.5">SUS: {{ data.susCode }}</p>
              </div>
            </div>
          </template>
        </Column>

        <!-- Centro de salud -->
        <Column style="min-width: 150px" class="hidden sm:table-cell">
          <template #header><p class="font-semibold text-sm">Centro de salud</p></template>
          <template #body="{ data }">
            <div v-if="data.health">
              <p class="text-sm font-medium text-gray-700">{{ data.health.name }}</p>
              <p class="text-xs text-gray-400">Cód. {{ data.health.codigo }}</p>
            </div>
            <span v-else class="text-xs text-gray-400 italic">Sin asignar</span>
          </template>
        </Column>

        <!-- Rol -->
        <Column style="min-width: 100px">
          <template #header><p class="font-semibold text-sm">Rol</p></template>
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
              severity="warn"
              class="text-xs"
            />
            <Tag v-else value="Usuario" severity="info" class="text-xs" />
          </template>
        </Column>

        <!-- Estado de verificación -->
        <Column style="min-width: 120px">
          <template #header><p class="font-semibold text-sm">Verificación</p></template>
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

      <!-- OverlayPanel único fuera de la tabla -->
      <OverlayPanel ref="panel" appendTo="body" :showCloseIcon="false" style="min-width: 160px">
        <p class="text-xs text-gray-400 uppercase tracking-wider px-4 pt-2 pb-1 font-semibold">Opciones</p>
        <ul class="pb-1">
          <li
            class="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer rounded transition-colors"
            @click="viewUser(activeRow)"
          >
            <i class="pi pi-eye text-gray-500 text-sm" />
            Ver detalle
          </li>
          <li
            class="flex items-center gap-2 px-4 py-2 text-sm hover:bg-indigo-50 cursor-pointer rounded transition-colors"
            @click="onEditUser(activeRow)"
          >
            <i class="pi pi-pencil text-indigo-500 text-sm" />
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
import Avatar from "primevue/avatar";
import Button from "primevue/button";
import Card from "primevue/card";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputText from "primevue/inputtext";
import OverlayPanel from "primevue/overlaypanel";
import Select from "primevue/select";
import Skeleton from "primevue/skeleton";
import Tag from "primevue/tag";
import { computed, onMounted, ref } from "vue";

import { useHealthStore } from "@/stores/healths";
import { useUserStore } from "@/stores/user";
import ModalUserDetail from "./ModalUserDetail.vue";
import ModalUserForm from "./ModalUserForm.vue";
import { useUserEditorStore } from "@/modules/users/store/useUserEditorStore";
import { useUsersStore } from "@/modules/users/store/useUserStore";
import ExportMenu from "@/components/ExportMenu.vue";

const usersStore = useUsersStore();
const editorStore = useUserEditorStore();
const authStore = useUserStore();

const { users, loading, totalRecords, page_first, page_size } = storeToRefs(usersStore);
const { fetchUsers, onPage } = usersStore;

const healthStore = useHealthStore();
const { getHealths } = healthStore;
const { healths } = storeToRefs(healthStore);

const { user } = storeToRefs(authStore);
const isAdmin = computed(() => user.value?.admin === true);

const exportParams = computed(() => ({
  ...(localSearch.value                              && { search:   localSearch.value }),
  ...(localRole.value                               && { role:     localRole.value }),
  ...(localVerified.value !== null                  && { verified: String(localVerified.value) }),
  ...(isAdmin.value && localHealth.value            && { health:   localHealth.value }),
}));


const panel = ref(null);
const formModal = ref(null);
const detailModal = ref(null);
const localSearch = ref("");
const localRole = ref(null);
const localVerified = ref(null);
const localHealth = ref(null);
const activeRow = ref(null);

const skeletonRows = Array(5).fill({});

const roleOptions = [
  { label: "Admin", value: "admin" },
  { label: "Gerente", value: "branchManager" },
  { label: "Usuario", value: "user" },
];

const verifiedOptions = [
  { label: "Verificado", value: "true" },
  { label: "Pendiente", value: "false" },
];

const roleLabel = (value) => {
  if (value === "admin") return "Admin";
  if (value === "branchManager") return "Gerente";
  return "Usuario";
};

const roleSeverity = (value) => {
  if (value === "admin") return "danger";
  if (value === "branchManager") return "warn";
  return "info";
};

function getInitials(name = "") {
  return name.trim().split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
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
  await usersStore.onSearch(localSearch.value?.trim() || null);
};

const onRoleChange = async (e) => {
  await usersStore.setRoleFilter(e.value ?? null);
};

const onVerifiedChange = async (e) => {
  await usersStore.setVerifiedFilter(e.value !== undefined ? e.value : null);
};

const onHealthChange = async (e) => {
  await usersStore.setHealthFilter(e.value ?? null);
};

const clearFilters = async () => {
  localSearch.value = "";
  localRole.value = null;
  localVerified.value = null;
  localHealth.value = null;
  await usersStore.resetFilters();
};

onMounted(async () => {
  await authStore.getUser();
  await fetchUsers();
  if (user.value?.admin) await getHealths();
});
</script>
