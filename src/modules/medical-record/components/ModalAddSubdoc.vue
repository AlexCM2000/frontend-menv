<template>
  <Dialog
    v-model:visible="visibleSubdoc"
    modal
    :closable="!saving"
    :style="{ width: '500px' }"
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
        <div class="w-9 h-9 rounded-lg flex items-center justify-center" :class="typeConfig.bgClass">
          <i class="pi text-base" :class="typeConfig.iconClass"></i>
        </div>
        <div>
          <h2 class="text-base font-semibold text-gray-800">{{ typeConfig.title }}</h2>
          <p class="text-xs text-gray-400 mt-0.5">
            Paciente:
            <span class="font-medium text-gray-600">{{ patientName }}</span>
          </p>
        </div>
      </div>
    </template>

    <div class="space-y-4">

      <!-- ── OBSERVACIÓN ── -->
      <template v-if="subdocType === 'observation'">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">
            Nota clínica <span class="text-red-500">*</span>
          </label>
          <Textarea
            v-model="form.note"
            placeholder="Descripción de la observación clínica..."
            rows="4"
            class="w-full"
            autoResize
          />
        </div>
      </template>

      <!-- ── DIAGNÓSTICO ── -->
      <template v-else-if="subdocType === 'diagnosis'">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">
            Código CIE-10
            <span class="text-xs font-normal text-gray-400 ml-1">(clasificación internacional, ej: J06.9, E11, I10)</span>
          </label>
          <InputText v-model="form.code" placeholder="Ej. J06.9" class="w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">
            Descripción <span class="text-red-500">*</span>
          </label>
          <Textarea
            v-model="form.description"
            placeholder="Descripción del diagnóstico..."
            rows="3"
            class="w-full"
            autoResize
          />
        </div>
      </template>

      <!-- ── MEDICACIÓN ── -->
      <template v-else-if="subdocType === 'medication'">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Medicamento <span class="text-red-500">*</span>
            </label>
            <InputText v-model="form.name" placeholder="Ej. Paracetamol" class="w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Dosis <span class="text-red-500">*</span>
            </label>
            <InputText v-model="form.dose" placeholder="Ej. 500mg cada 8h" class="w-full" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Inicio</label>
            <DatePicker v-model="form.start" dateFormat="dd/mm/yy" class="w-full" showIcon />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Fin (opcional)</label>
            <DatePicker v-model="form.end" dateFormat="dd/mm/yy" class="w-full" showIcon />
          </div>
        </div>
      </template>

      <!-- ── TRATAMIENTO PREVIO ── -->
      <template v-else-if="subdocType === 'treatment'">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">
            Tratamiento <span class="text-red-500">*</span>
          </label>
          <InputText v-model="form.treatment" placeholder="Nombre del tratamiento" class="w-full" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Desde</label>
            <DatePicker v-model="form.from" dateFormat="dd/mm/yy" class="w-full" showIcon />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Hasta</label>
            <DatePicker v-model="form.to" dateFormat="dd/mm/yy" class="w-full" showIcon />
          </div>
        </div>
      </template>

      <!-- ── ALERGIA ── -->
      <template v-else-if="subdocType === 'allergy'">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">
            Sustancia <span class="text-red-500">*</span>
          </label>
          <InputText v-model="form.substance" placeholder="Ej. Penicilina" class="w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">
            Reacción <span class="text-red-500">*</span>
          </label>
          <Textarea
            v-model="form.reaction"
            placeholder="Descripción de la reacción alérgica..."
            rows="3"
            class="w-full"
            autoResize
          />
        </div>
      </template>

      <!-- Error de validación -->
      <p v-if="validationError" class="text-xs text-red-500 flex items-center gap-1">
        <i class="pi pi-exclamation-circle" /> {{ validationError }}
      </p>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <button
          type="button"
          :disabled="saving"
          class="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
          @click="onClose"
        >
          Cancelar
        </button>
        <button
          type="button"
          :disabled="saving"
          class="px-5 py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-50 transition flex items-center gap-2"
          :class="typeConfig.btnClass"
          @click="handleSubmit"
        >
          <i v-if="saving" class="pi pi-spin pi-spinner text-xs"></i>
          <i v-else class="pi pi-check text-xs"></i>
          {{ saving ? "Guardando..." : "Guardar" }}
        </button>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { storeToRefs } from "pinia";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import DatePicker from "primevue/datepicker";
import { useRecordStore } from "../store/recordStore";

const recordStore = useRecordStore();
const { visibleSubdoc, saving, subdocType, subdocTarget } = storeToRefs(recordStore);
const { closeSubdocModal, onAddSubdoc } = recordStore;

const form = ref({});
const validationError = ref("");

const patientName = computed(() => {
  const p = subdocTarget.value?.patient;
  if (!p) return "—";
  return [p.primerApellido, p.segundoApellido, p.nombres].filter(Boolean).join(" ");
});

const typeConfig = computed(() => {
  const configs = {
    observation: {
      title: "Agregar observación",
      bgClass: "bg-blue-50",
      iconClass: "pi-comment text-blue-600",
      btnClass: "bg-blue-600 hover:bg-blue-700",
    },
    diagnosis: {
      title: "Agregar diagnóstico",
      bgClass: "bg-purple-50",
      iconClass: "pi-clipboard text-purple-600",
      btnClass: "bg-purple-600 hover:bg-purple-700",
    },
    medication: {
      title: "Agregar medicación",
      bgClass: "bg-green-50",
      iconClass: "pi-heart text-green-600",
      btnClass: "bg-green-600 hover:bg-green-700",
    },
    treatment: {
      title: "Agregar tratamiento previo",
      bgClass: "bg-amber-50",
      iconClass: "pi-star text-amber-600",
      btnClass: "bg-amber-600 hover:bg-amber-700",
    },
    allergy: {
      title: "Agregar alergia",
      bgClass: "bg-red-50",
      iconClass: "pi-exclamation-triangle text-red-600",
      btnClass: "bg-red-600 hover:bg-red-700",
    },
  };
  return configs[subdocType.value] ?? configs.observation;
});

const validate = () => {
  validationError.value = "";
  const t = subdocType.value;
  if (t === "observation" && !form.value.note?.trim()) {
    validationError.value = "La nota clínica es obligatoria.";
    return false;
  }
  if (t === "diagnosis" && !form.value.description?.trim()) {
    validationError.value = "La descripción del diagnóstico es obligatoria.";
    return false;
  }
  if (t === "medication" && (!form.value.name?.trim() || !form.value.dose?.trim())) {
    validationError.value = "El medicamento y la dosis son obligatorios.";
    return false;
  }
  if (t === "treatment" && !form.value.treatment?.trim()) {
    validationError.value = "El nombre del tratamiento es obligatorio.";
    return false;
  }
  if (t === "allergy" && (!form.value.substance?.trim() || !form.value.reaction?.trim())) {
    validationError.value = "La sustancia y la reacción son obligatorias.";
    return false;
  }
  return true;
};

const handleSubmit = async () => {
  if (!validate()) return;
  await onAddSubdoc({ ...form.value });
};

const resetForm = () => {
  form.value = {};
  validationError.value = "";
};

const onClose = () => {
  resetForm();
  closeSubdocModal();
};

watch(visibleSubdoc, (val) => {
  if (!val) resetForm();
});
</script>