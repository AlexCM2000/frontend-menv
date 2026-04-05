<template>
  <Dialog
    v-model:visible="visibleForm"
    modal
    :closable="!saving"
    header="Nuevo historial médico"
    :style="{ width: '520px' }"
    :breakpoints="{ '640px': '95vw' }"
    :pt="{
      header: { class: 'border-b border-gray-100 pb-0 pt-5 px-6' },
      content: { class: 'px-6 py-5' },
      footer: { class: 'border-t border-gray-100 px-6 py-4' },
    }"
    @hide="onClose"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center">
          <i class="pi pi-file-edit text-teal-600 text-base"></i>
        </div>
        <div>
          <h2 class="text-base font-semibold text-gray-800">Nuevo historial médico</h2>
          <p class="text-xs text-gray-400 mt-0.5">Selecciona el paciente para crear su historial</p>
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <!-- Búsqueda de paciente -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">
          Paciente <span class="text-red-500">*</span>
        </label>
        <IconField class="w-full">
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="patientSearch"
            placeholder="Buscar por nombre o código SUS..."
            class="w-full"
            @input="onPatientSearch"
          />
        </IconField>

        <!-- Resultados de búsqueda -->
        <div v-if="patientResults.length && !selectedPatient"
          class="mt-1 border border-gray-200 rounded-lg shadow-sm max-h-48 overflow-y-auto bg-white"
        >
          <button
            v-for="p in patientResults"
            :key="p._id"
            type="button"
            class="w-full text-left px-4 py-2.5 hover:bg-teal-50 transition-colors border-b border-gray-100 last:border-0"
            @click="selectPatient(p)"
          >
            <p class="text-sm font-medium text-gray-800">
              {{ [p.primerApellido, p.segundoApellido, p.nombres].filter(Boolean).join(' ') }}
            </p>
            <p class="text-xs text-gray-400">SUS: {{ p.susCode }}</p>
          </button>
        </div>

        <!-- Paciente seleccionado -->
        <div v-if="selectedPatient"
          class="mt-2 flex items-center gap-3 px-3 py-2.5 bg-teal-50 border border-teal-200 rounded-lg"
        >
          <div class="w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-sm flex-shrink-0">
            {{ getInitials(selectedPatient) }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-800 truncate">
              {{ [selectedPatient.primerApellido, selectedPatient.segundoApellido, selectedPatient.nombres].filter(Boolean).join(' ') }}
            </p>
            <p class="text-xs text-gray-500">SUS: {{ selectedPatient.susCode }}</p>
          </div>
          <button
            type="button"
            class="text-gray-400 hover:text-red-500 transition flex-shrink-0"
            @click="clearPatient"
          >
            <i class="pi pi-times text-sm"></i>
          </button>
        </div>

        <p v-if="searchLoading" class="text-xs text-gray-400 mt-1 flex items-center gap-1">
          <i class="pi pi-spin pi-spinner text-[10px]" /> Buscando...
        </p>
        <p v-if="noResults && patientSearch.length >= 2" class="text-xs text-amber-600 mt-1">
          No se encontraron pacientes con ese criterio.
        </p>
      </div>

      <!-- Nota informativa -->
      <div class="flex items-start gap-2 px-3 py-2.5 bg-blue-50 border border-blue-100 rounded-lg">
        <i class="pi pi-info-circle text-blue-500 text-sm mt-0.5 flex-shrink-0"></i>
        <p class="text-xs text-blue-700 leading-relaxed">
          El historial se creará en estado <strong>activo</strong>.
          Podrás agregar diagnósticos, medicaciones y observaciones una vez creado.
        </p>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <button
          type="button"
          :disabled="saving"
          class="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          @click="onClose"
        >
          Cancelar
        </button>
        <button
          type="button"
          :disabled="saving || !selectedPatient"
          class="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
          @click="handleCreate"
        >
          <i v-if="saving" class="pi pi-spin pi-spinner text-xs"></i>
          <i v-else class="pi pi-plus text-xs"></i>
          {{ saving ? "Creando..." : "Crear historial" }}
        </button>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import { useRecordStore } from "../store/recordStore";
import { getPatients } from "@/modules/patient/api/patientsApi";

const recordStore = useRecordStore();
const { visibleForm, saving } = storeToRefs(recordStore);
const { closeModal, onCreateRecord } = recordStore;

const patientSearch   = ref("");
const patientResults  = ref([]);
const selectedPatient = ref(null);
const searchLoading   = ref(false);
const noResults       = ref(false);

let searchTimeout = null;

const onPatientSearch = () => {
  noResults.value = false;
  clearTimeout(searchTimeout);
  if (patientSearch.value.length < 2) {
    patientResults.value = [];
    return;
  }
  searchLoading.value = true;
  searchTimeout = setTimeout(async () => {
    try {
      const data = await getPatients({ search: patientSearch.value, page_size: 10 });
      patientResults.value = data.results ?? [];
      noResults.value = patientResults.value.length === 0;
    } catch {
      patientResults.value = [];
    } finally {
      searchLoading.value = false;
    }
  }, 350);
};

const selectPatient = (p) => {
  selectedPatient.value = p;
  patientResults.value = [];
  patientSearch.value = "";
};

const clearPatient = () => {
  selectedPatient.value = null;
  patientSearch.value = "";
  patientResults.value = [];
  noResults.value = false;
};

function getInitials(patient) {
  const a = patient?.primerApellido?.[0] ?? "";
  const n = patient?.nombres?.[0] ?? "";
  return (a + n).toUpperCase() || "?";
}

const handleCreate = async () => {
  if (!selectedPatient.value) return;
  try {
    await onCreateRecord({ patient: selectedPatient.value._id });
    clearPatient();
  } catch (err) {
    // El store ya muestra el toast de error
    // Si hay historial archivado, cerramos igual para que el user vea la lista de archivados
  }
};

const onClose = () => {
  clearPatient();
  closeModal();
};

// Limpiar cuando se cierra el modal desde afuera
watch(visibleForm, (val) => {
  if (!val) clearPatient();
});
</script>