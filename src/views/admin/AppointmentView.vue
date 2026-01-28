<template>
  <p class="text-[#3A3A3A] text-lg mt-5">
    A continiación podrás administrar tus próximas citas
  </p>

  <p class="text-white text-2xl text-center mt-5" v-if="loading">Cargando...</p>

  <div v-else>
    <p v-if="user?.noAppoinments" class="text-white text-2xl text-center mt-5">
      No tienes próximas citas
    </p>

    <Card v-else class="" :pt="{ body: { class: 'shadow-2xl px-0' } }">
      <template #title>
        <div class="flex justify-between">
          <p class="text-start text-lg text-gray-900">
            {{
              "Mostrando " +
              userAppointments.length +
              " de " +
              totalRecords +
              " registros"
            }}
          </p>
          <p class="text-end">
            <FormKit
              id="filterForm"
              type="form"
              :actions="false"
              @submit="handleSubmit"
              incomplete-message="No se pudo enviar el formulario, revisa los campos"
              class="space-y-8 mt-8"
            >
              <div class="flex gap-x-2 text-dark">
                <FormKit
                  type="text"
                  name="search"
                  placeholder="buscar por paciente"
                  label-class="text-gray-700 font-medium"
                  v-model="search"
                  input-class="placeholder-gray-400 text-sm w-40  h-10 px-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-400 transition duration-300"
                />
                <div class="relative inline-block w-full">
                  <FormKit
                    type="select"
                    name="health"
                    :options="healths"
                    placeholder="Seleccione un centro"
                    label-class="text-gray-700 font-medium"
                    input-class="text-sm p-0 h-10 px-2 w-auto  border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-400 transition duration-300"
                    v-model="selectedHealth"
                  />
                  <button
                    v-if="selectedHealth"
                    @click="clearSelection"
                    type="button"
                    class="absolute right-5 top-1/2 transform -translate-y-1/2 text-sm text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </FormKit>
          </p>
        </div>
      </template>
      <template #content>
        <DataTable
          v-show="!loading"
          :value="userAppointments"
          v-model:first="page_first"
          :total-records="totalRecords"
          @page="onPage($event)"
          :rowsPerPageOptions="[10, 20, 50]"
          showGridLines
          paginator
          :rows="10"
          lazy
        >
          <Column class="min-w-[150px]">
            <template #header>
              <p class="font-bold text-lg">Servicio</p>
            </template>
            <template #body="{ data }">
              <p class="font-semibold text-base text-gray-700">
                {{ data?.services[0]?.category }}
              </p>
              <p class="font-semibold text-sm text-gray-500">
                {{ data?.services[0]?.name }}
              </p>
            </template>
          </Column>

          <Column class="min-w-[150px]">
            <template #header>
              <p class="font-bold text-lg">Fecha cita</p>
            </template>
            <template #body="{ data }">
              <p class="font-semibold text-sm text-gray-500">
                {{ formatDate(data?.date) }}
              </p>
            </template>
          </Column>
          <Column class="min-w-[100px]">
            <template #header>
              <p class="font-bold text-lg">Hora cita</p>
            </template>
            <template #body="{ data }">
              <p class="font-semibold text-sm text-gray-500">
                {{ data?.time }}
              </p>
            </template>
          </Column>
          <Column class="min-w-[150px]">
            <template #header>
              <p class="font-bold text-lg">Paciente</p>
            </template>
            <template #body="{ data }">
              <p class="font-semibold text-sm text-gray-700">
                {{ data?.user?.name }}
              </p>
            </template>
          </Column>
          <Column class="min-w-[100px]">
            <template #header>
              <p class="font-bold text-lg">Centro medico</p>
            </template>
            <template #body="{ data }">
              <p class="font-semibold text-sm text-gray-500">
                {{ data?.health?.name }}
              </p>
            </template>
          </Column>
          <Column class="min-w-[50px]">
            <template #header>
              <p class="font-bold text-lg">Estado</p>
            </template>
            <template #body="{ data }">
              <Badge :value="data?.state" severity="info"></Badge>
            </template>
          </Column>
          <Column class="min-w-[50px]">
            <template #header>
              <p class="font-bold text-lg">Acción</p>
            </template>
            <template #body="{ data }">
              <div class="relative">
                <!-- Contenedor de cada celda -->
                <Button
                  icon="pi pi-ellipsis-v"
                  type="button"
                  severity="secondary"
                  aria-label="Options"
                  @click="toggleDropdown(data._id)"
                  size="small"
                />
                <div
                  v-if="activeDropdown === data._id"
                  class="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20"
                >
                  <ul class="py-1">
                    <li
                      class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      @click="selected(data, 'Pendiente')"
                    >
                      Pendiente
                    </li>
                    <li
                      class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      @click="selected(data, 'Completada')"
                    >
                      Completada
                    </li>
                    <li
                      class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      @click="selected(data, 'Cancelada')"
                    >
                      Cancelada
                    </li>
                  </ul>
                </div>
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { list } from "@/helpers";
import { formatDate } from "@/helpers/date";
import { useHealthStore } from "@/stores/healths";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import Badge from "primevue/badge";
import Button from "primevue/button";
import Card from "primevue/card";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import Popover from "primevue/popover";
import { onMounted, ref, watch } from "vue";

const userAuth = useUserStore();

const { loading, totalRecords, user, userAppointments, page, page_first } =
  storeToRefs(userAuth);
const { onPage, onSearch, getSelectedHealths } = userAuth;

const healthStore = useHealthStore();
const { getHealths } = healthStore;
const { healths } = storeToRefs(healthStore);

onMounted(async () => {
  await userAuth.getUser();
  await userAuth.getUserAppointments(user.value._id);
  await getHealths();
});

const selectedHealth = ref("");
const search = ref("");

watch(selectedHealth, async (selectedHealth) => {
  if (selectedHealth !== "") getSelectedHealths(selectedHealth);
});

watch(search, (search) => {
  if (search.length === 0) onSearch("");
});

const handleSubmit = () => {
  if (search.value.length > 3) {
    onSearch(search.value);
  }
};

const clearSelection = async () => {
  selectedHealth.value = "";
  getSelectedHealths("");
};
const activeDropdown = ref(null);

const toggleDropdown = (id) => {
  // Alternar la visibilidad del dropdown
  activeDropdown.value = activeDropdown.value === id ? null : id;
};

const selected = (data, state) => {
  console.log("Acción seleccionada:", state, "Para fila:", data);
  // Realizar la acción con la data y el estado
  activeDropdown.value = null; // Cerrar el dropdown después de seleccionar
};
</script>
