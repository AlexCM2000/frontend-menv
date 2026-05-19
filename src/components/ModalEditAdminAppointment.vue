<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Editar cita médica"
    :style="{ minWidth: '38vw' }"
    :breakpoints="{ '1199px': '65vw', '575px': '95vw' }"
  >
    <div v-if="appointment" class="grid grid-cols-1 md:grid-cols-2 gap-5">

      <!-- Fecha / Hora (solo lectura) -->
      <div class="md:col-span-2 flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
        <i class="pi pi-calendar text-gray-400 text-sm" />
        <div>
          <p class="text-xs text-gray-400 font-medium">Fecha y hora actuales (no modificable aquí)</p>
          <p class="text-sm font-semibold text-gray-700">
            {{ formattedDate }} · {{ appointment.time }} hrs.
          </p>
        </div>
        <span class="ml-auto text-xs text-gray-400 italic">Usar "Reprogramar" para cambiar</span>
      </div>

      <!-- Estado -->
      <div>
        <label class="block text-gray-700 font-medium text-sm mb-1">Estado</label>
        <Select
          v-model="form.state"
          :options="stateOptions"
          optionLabel="label"
          optionValue="value"
          class="w-full"
        />
      </div>

      <!-- Médico -->
      <div>
        <label class="block text-gray-700 font-medium text-sm mb-1">
          Médico <span class="text-red-500">*</span>
        </label>
        <Select
          v-model="form.doctor"
          :options="doctorOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Seleccione un médico"
          class="w-full"
          :loading="loadingDoctors"
        />
        <p v-if="errors.doctor" class="text-red-500 text-xs mt-1">{{ errors.doctor }}</p>
      </div>

      <!-- Motivo de consulta -->
      <div class="md:col-span-2">
        <label class="block text-gray-700 font-medium text-sm mb-1">
          Motivo de consulta <span class="text-gray-400 font-normal">(opcional)</span>
        </label>
        <textarea
          v-model="form.notes"
          rows="2"
          maxlength="300"
          placeholder="Describe el motivo de la consulta..."
          class="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

    </div>

    <template #footer>
      <div class="flex gap-2 justify-end pt-2">
        <Button label="Cancelar" severity="secondary" outlined @click="visible = false" />
        <Button label="Guardar cambios" icon="pi pi-check" :loading="submitting" @click="submit" />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch, inject, computed } from "vue";
import Dialog from "primevue/dialog";
import Select from "primevue/select";
import Button from "primevue/button";
import { getDoctorsForSelect } from "@/modules/doctors/api/doctorsApi";
import AppointmentApi from "@/api/AppointmentApi";
import { displayDate } from "@/helpers/date";

const emit = defineEmits(["updated"]);

const visible = defineModel("visible", { default: false });
const props = defineProps({
  appointment: { type: Object, default: null },
});

const toast = inject("toast");

const form = ref({
  state: "Pendiente",
  doctor: null,
  notes: "",
});

const errors = ref({});

const submitting = ref(false);
const doctorOptions = ref([]);
const loadingDoctors = ref(false);

const stateOptions = [
  { label: "Pendiente",    value: "Pendiente" },
  { label: "Cancelada",    value: "Cancelada" },
  { label: "Completada",   value: "Completada" },
  { label: "No asistio",   value: "No asistio" },
];

const formattedDate = computed(() => {
  if (!props.appointment?.date) return "—";
  return displayDate(props.appointment.date);
});

const loadDoctors = async (specialty = null) => {
  loadingDoctors.value = true;
  try {
    const params = specialty ? { specialty } : {};
    const docs = await getDoctorsForSelect(params);
    doctorOptions.value = docs.map((d) => ({
      value: d._id,
      label: `${d.name} — ${d.specialty}`,
    }));
  } catch (e) {
    console.error(e);
  } finally {
    loadingDoctors.value = false;
  }
};

watch(() => props.appointment, (appt) => {
  if (!appt) return;
  form.value = {
    state: appt.state ?? "Pendiente",
    doctor: appt.doctor?._id ?? appt.doctor ?? null,
    notes: appt.notes ?? "",
  };
  errors.value = {};
  // Cargar médicos filtrados por la especialidad de la cita
  const specialty = appt.services?.[0]?.category ?? null;
  loadDoctors(specialty);
}, { immediate: true });

const submit = async () => {
  errors.value = {};
  if (!form.value.doctor) {
    errors.value.doctor = "Seleccione un médico";
    return;
  }
  submitting.value = true;
  try {
    await AppointmentApi.update(props.appointment._id, {
      state: form.value.state,
      doctor: form.value.doctor || null,
      notes: form.value.notes || "",
    });
    toast?.open({ message: "Cita actualizada correctamente", type: "success" });
    visible.value = false;
    emit("updated");
  } catch (err) {
    toast?.open({
      message: err.response?.data?.msg || err.response?.data?.message || "Error al actualizar la cita",
      type: "error",
    });
  } finally {
    submitting.value = false;
  }
};

// Los médicos se cargan en el watch de appointment, filtrados por especialidad
</script>
