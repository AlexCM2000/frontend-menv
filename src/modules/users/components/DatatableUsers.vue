<template>
  <Card class="m-5">
    <template #title>
      <div class="flex">
        <div class="flex-1">
          <p class="font-semibold text-lg">Lista de Usuarios</p>
        </div>
        <div class="flex-1 text-right">
          <Button size="small" @click="openNewUser"> Nuevo </Button>
        </div>
      </div>
    </template>

    <template #content>
      <div class="mb-3 flex gap-2">
        <InputText
          v-model="localSearch"
          placeholder="Buscar usuario..."
          @keyup.enter="onSearchHandler"
        />
        <Button label="Buscar" @click="onSearchHandler" />
        <Button
          label="Limpiar"
          class="p-button-secondary"
          @click="clearFilters"
        />
      </div>

      <DataTable
        v-show="!loading"
        :value="users"
        v-model:first="page_first"
        :total-records="totalRecords"
        @page="onPage($event)"
        :rowsPerPageOptions="[10, 20, 50]"
        showGridLines
        paginator
        :rows="page_size"
        lazy
      >
        <Column class="min-w-[200px]">
          <template #header>
            <p class="font-semibold text-lg">Nombre</p>
          </template>
          <template #body="{ data }">
            <p class="font-semibold text-base text-gray-700">
              {{ data?.name ?? data?.firstName + " " + data?.lastName }}
            </p>
            <p class="font-semibold text-sm text-gray-500">{{ data?.email }}</p>
          </template>
        </Column>

        <Column class="min-w-[150px]">
          <template #header>
            <p class="font-semibold text-lg">Rol</p>
          </template>
          <template #body="{ data }">
            <p class="font-semibold text-sm text-gray-500">
              {{ data?.role ?? "N/A" }}
            </p>
          </template>
        </Column>

        <Column class="min-w-[150px]">
          <template #header>
            <p class="font-semibold text-lg">Estado</p>
          </template>
          <template #body="{ data }">
            <p class="font-semibold text-sm text-gray-500">
              {{ data?.active ? "Activo" : "Inactivo" }}
            </p>
          </template>
        </Column>

        <Column class="min-w-[60px]">
          <template #header>
            <p class="font-semibold text-lg">Acción</p>
          </template>
          <template #body="{ data }">
            <div class="flex justify-center">
              <Button
                icon="pi pi-ellipsis-v"
                class="p-button-text"
                @click="panel.toggle($event)"
                aria-haspopup="true"
                aria-controls="overlay_panel"
              />
              <OverlayPanel
                ref="panel"
                id="overlay_panel"
                appendTo="body"
                :showCloseIcon="false"
                style="min-width: 150px"
              >
                <ul>
                  <li
                    class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    @click="viewUser(data)"
                  >
                    Ver
                  </li>
                  <li
                    class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    @click="editUser(data)"
                  >
                    Editar
                  </li>
                </ul>
              </OverlayPanel>
            </div>
          </template>
        </Column>
      </DataTable>

      <div v-if="loading" class="flex justify-center p-4">Cargando...</div>
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
import { ref, onMounted } from "vue";

import { useUsersStore } from "@/modules/users/store/useUserStore";
import { useUserEditorStore } from "@/modules/users/store/useUserEditorStore";

// import ModalUserForm from "./ModalUserForm.vue";
// import ModalUserDetail from "./ModalUserDetail.vue";

const usersStore = useUsersStore();
const editorStore = useUserEditorStore();

const { users, loading, totalRecords, page_first, page_size } =
  storeToRefs(usersStore);
const { fetchUsers, onPage } = usersStore;

const panel = ref(null);
const formModal = ref(null);
const detailModal = ref(null);

const localSearch = ref("");

// inicializar lista
onMounted(async () => {
  await fetchUsers();
});

// page handler (PrimeVue proporciona event.page 0-indexed)
const onPageHandler = (event) => {
  usersStore.onPage(event);
};

// abrir modal nuevo (si quieres implementar creación luego)
const openNewUser = () => {
  // vaciar selectedUser y abrir formulario (implementación del modal usa editorStore)
  editorStore.resetEditor();
  formModal.value?.open(); // el modal tiene método open()
};

// ver usuario (muestra detalle)
const viewUser = async (data) => {
  await editorStore.loadUser(data._id ?? data.id);
  detailModal.value?.open();
};

// editar usuario (abre modal de edición)
const editUser = async (data) => {
  await editorStore.loadUser(data._id ?? data.id);
  formModal.value?.open();
};

// búsqueda
const onSearchHandler = async () => {
  usersStore.search =
    localSearch.value?.trim() === "" ? null : localSearch.value.trim();
  usersStore.page = 1;
  await usersStore.fetchUsers();
};

const clearFilters = async () => {
  localSearch.value = "";
  await usersStore.resetFilters();
};
</script>

<style scoped>
/* estilos si necesitas */
</style>
