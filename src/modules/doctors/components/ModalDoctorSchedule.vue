<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="`Horario — ${doctor?.name ?? ''}`"
    :style="{ width: '95vw', maxWidth: '520px' }"
  >
    <!-- Cargando -->
    <div v-if="loading" class="flex justify-center py-10">
      <i class="pi pi-spin pi-spinner text-2xl text-indigo-400" />
    </div>

    <div v-else class="space-y-1 pt-1">
      <!-- Info del médico -->
      <div class="flex items-center gap-3 bg-gray-50 rounded-lg p-3 mb-4">
        <div class="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
          {{ initials }}
        </div>
        <div>
          <p class="font-semibold text-gray-800 text-sm">{{ doctor?.name }}</p>
          <p class="text-xs text-gray-500">{{ doctor?.specialty }}</p>
        </div>
      </div>

      <!-- Encabezado de columnas -->
      <div class="grid grid-cols-[1fr_64px_80px_80px] text-xs font-semibold text-gray-500 border-b pb-2 px-1">
        <span>Día</span>
        <span class="text-center">Activo</span>
        <span class="text-center">Mañana<br><span class="font-normal text-gray-400 text-[10px]">8:30–12:30</span></span>
        <span class="text-center">Tarde<br><span class="font-normal text-gray-400 text-[10px]">14:30–18:00</span></span>
      </div>

      <!-- Filas de días -->
      <div
        v-for="row in schedule"
        :key="row.dayOfWeek"
        class="grid grid-cols-[1fr_64px_80px_80px] items-center py-3 border-b last:border-0 px-1 transition-opacity"
        :class="row.active ? '' : 'opacity-40'"
      >
        <span class="text-sm font-medium text-gray-700">{{ row.dayOfWeek }}</span>

        <div class="flex justify-center">
          <ToggleSwitch v-model="row.active" @change="onToggleActive(row)" />
        </div>

        <div class="flex justify-center">
          <Checkbox v-model="row.morning" :binary="true" :disabled="!row.active" />
        </div>

        <div class="flex justify-center">
          <Checkbox v-model="row.afternoon" :binary="true" :disabled="!row.active" />
        </div>
      </div>

      <p class="text-xs text-gray-400 pt-2 px-1">
        Activa el día y marca el turno (mañana, tarde o ambos) en el que trabaja el médico.
      </p>
    </div>

    <template #footer>
      <div class="flex gap-2 justify-end pt-1">
        <Button label="Cancelar" severity="secondary" outlined @click="visible = false" />
        <Button label="Guardar horario" icon="pi pi-check" :loading="saving" @click="save" />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch, inject } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";
import ToggleSwitch from "primevue/toggleswitch";
import DoctorScheduleApi from "@/api/doctorScheduleApi";

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const props = defineProps({ doctor: { type: Object, default: null } });
const visible = defineModel("visible", { default: false });
const toast = inject("toast");

const loading = ref(false);
const saving = ref(false);

const emptySchedule = () =>
  DAYS.map(d => ({ dayOfWeek: d, morning: false, afternoon: false, active: false }));

const schedule = ref(emptySchedule());

const initials = computed(() => {
  if (!props.doctor?.name) return '';
  return props.doctor.name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase();
});

const onToggleActive = (row) => {
  if (!row.active) {
    row.morning = false;
    row.afternoon = false;
  }
};

watch([visible, () => props.doctor], async ([vis]) => {
  if (!vis || !props.doctor) return;
  loading.value = true;
  schedule.value = emptySchedule();
  try {
    const { data } = await DoctorScheduleApi.getSchedules(props.doctor._id);
    schedule.value = DAYS.map(day => {
      const found = data.find(s => s.dayOfWeek === day);
      return found
        ? { dayOfWeek: day, morning: found.morning, afternoon: found.afternoon, active: found.active }
        : { dayOfWeek: day, morning: false, afternoon: false, active: false };
    });
  } catch {
    schedule.value = emptySchedule();
  } finally {
    loading.value = false;
  }
});

const save = async () => {
  saving.value = true;
  try {
    await DoctorScheduleApi.saveSchedules(props.doctor._id, schedule.value);
    toast?.open({ message: "Horario guardado correctamente", type: "success" });
    visible.value = false;
  } catch {
    toast?.open({ message: "Error al guardar el horario", type: "error" });
  } finally {
    saving.value = false;
  }
};
</script>
