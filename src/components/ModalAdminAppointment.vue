<template>
  <Dialog
    v-model:visible="visible"
    modal
    :style="{ minWidth: '48vw' }"
    :breakpoints="{ '1199px': '75vw', '575px': '95vw' }"
  >
    <template #header>
      <div class="font-semibold text-xl">Nueva cita médica</div>
    </template>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

      <!-- Paciente -->
      <div class="md:col-span-2">
        <label class="block text-gray-700 font-medium text-sm mb-1">Paciente <span class="text-red-500">*</span></label>
        <Select
          v-model="form.targetPatientId"
          :options="patientOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Seleccione un paciente"
          filter
          filterPlaceholder="Buscar por nombre o código SUS..."
          class="w-full"
          :loading="loadingPatients"
        />
        <p v-if="errors.targetPatientId" class="text-red-500 text-xs mt-1">{{ errors.targetPatientId }}</p>
      </div>

      <!-- Categoría -->
      <div>
        <label class="block text-gray-700 font-medium text-sm mb-1">Categoría / Especialidad <span class="text-red-500">*</span></label>
        <Select
          v-model="form.category"
          :options="categoryOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Seleccione una categoría"
          class="w-full"
          :loading="loadingCategories"
          @change="onCategoryChange"
        />
        <p v-if="errors.category" class="text-red-500 text-xs mt-1">{{ errors.category }}</p>
      </div>

      <!-- Servicio -->
      <div>
        <label class="block text-gray-700 font-medium text-sm mb-1">Servicio <span class="text-red-500">*</span></label>
        <Select
          v-model="form.serviceId"
          :options="filteredServiceOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="!form.category ? 'Seleccione primero una categoría' : filteredServiceOptions.length === 0 ? 'Sin servicios en esta categoría' : 'Seleccione un servicio'"
          :disabled="!form.category || filteredServiceOptions.length === 0"
          class="w-full"
          :loading="loadingServices"
        />
        <p v-if="errors.serviceId" class="text-red-500 text-xs mt-1">{{ errors.serviceId }}</p>
        <p v-if="form.category && !loadingServices && filteredServiceOptions.length === 0" class="text-amber-600 text-xs mt-1">
          No hay servicios disponibles para esta categoría.
        </p>
      </div>

      <!-- Médico -->
      <div>
        <label class="block text-gray-700 font-medium text-sm mb-1">
          Médico
          <span v-if="isBranchManager" class="text-red-500">*</span>
          <span v-else class="text-gray-400 font-normal">(opcional)</span>
        </label>
        <Select
          v-model="form.doctor"
          :options="doctorOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="!form.category ? 'Seleccione primero una categoría' : 'Seleccione un médico'"
          :showClear="!isBranchManager"
          :disabled="!form.category || loadingDoctors"
          class="w-full"
          :loading="loadingDoctors"
          @change="onDoctorChange"
        />
        <p v-if="errors.doctor" class="text-red-500 text-xs mt-1">{{ errors.doctor }}</p>
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

      <!-- Fecha -->
      <div>
        <label class="block text-gray-700 font-medium text-sm mb-1">Fecha <span class="text-red-500">*</span></label>
        <DatePicker
          v-model="form.date"
          :minDate="tomorrow"
          dateFormat="dd/mm/yy"
          placeholder="Seleccione una fecha"
          showIcon
          class="w-full"
          @update:modelValue="onDateChange"
        />
        <p v-if="errors.date" class="text-red-500 text-xs mt-1">{{ errors.date }}</p>
      </div>

      <!-- Hora -->
      <div>
        <label class="block text-gray-700 font-medium text-sm mb-1">Hora <span class="text-red-500">*</span></label>
        <Select
          v-model="form.time"
          :options="timeSlots"
          :disabled="!form.date || loadingSlots"
          :placeholder="!form.date ? 'Seleccione primero una fecha' : loadingSlots ? 'Cargando horarios...' : 'Seleccione una hora'"
          :optionDisabled="(opt) => occupiedSlots.includes(opt)"
          class="w-full"
        >
          <template #option="{ option }">
            <div class="flex items-center justify-between w-full gap-3">
              <div class="flex items-center gap-2">
                <i
                  class="pi text-xs"
                  :class="occupiedSlots.includes(option) ? 'pi-lock text-red-400' : 'pi-clock text-green-500'"
                />
                <span :class="occupiedSlots.includes(option) ? 'line-through text-gray-400' : 'text-gray-800'">
                  {{ option }}
                </span>
              </div>
              <span
                class="text-[11px] font-medium px-1.5 py-0.5 rounded-full"
                :class="occupiedSlots.includes(option) ? 'bg-red-50 text-red-400' : 'bg-green-50 text-green-600'"
              >
                {{ occupiedSlots.includes(option) ? 'Ocupado' : 'Disponible' }}
              </span>
            </div>
          </template>
        </Select>
        <div v-if="form.date && !loadingSlots" class="flex items-center gap-4 mt-1.5">
          <span class="flex items-center gap-1 text-xs text-green-600">
            <i class="pi pi-clock text-[10px]" /> Disponible
          </span>
          <span class="flex items-center gap-1 text-xs text-red-400">
            <i class="pi pi-lock text-[10px]" /> Ocupado (no seleccionable)
          </span>
        </div>
        <p v-if="errors.time" class="text-red-500 text-xs mt-1">{{ errors.time }}</p>
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
        <Button label="Crear cita" icon="pi pi-check" :loading="submitting" :disabled="submitting" @click="submit" />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, onMounted, inject } from "vue";
import Dialog from "primevue/dialog";
import Select from "primevue/select";
import Button from "primevue/button";
import DatePicker from "primevue/datepicker";
import api from "@/lib/axios";
import { getDoctorsForSelect } from "@/modules/doctors/api/doctorsApi";
import AppointmentApi from "@/api/AppointmentApi";
import { convertToDDMMYYYY } from "@/helpers/date";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const emit = defineEmits(["created"]);

const visible = defineModel("visible", { default: false });
const toast = inject("toast");

const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const isBranchManager = computed(() => user.value?.branchManager === true && !user.value?.admin);

// ── Estado del formulario ────────────────────────────────────────────────────
const form = ref({
  targetPatientId: null,
  category: null,
  serviceId: null,
  date: null,
  time: null,
  doctor: null,
  state: "Pendiente",
  notes: "",
});

const errors = ref({});
const submitting = ref(false);

// ── Disponibilidad de horarios ───────────────────────────────────────────────
const loadingSlots = ref(false);
const occupiedSlots = ref([]);

// ── Opciones de listas ───────────────────────────────────────────────────────
const patientOptions = ref([]);
const allServiceOptions = ref([]);
const categoryOptions = ref([]);
const doctorOptions = ref([]);
const loadingPatients = ref(false);
const loadingServices = ref(false);
const loadingCategories = ref(false);
const loadingDoctors = ref(false);

// Servicios filtrados según la categoría seleccionada
const filteredServiceOptions = computed(() => {
  if (!form.value.category) return [];
  return allServiceOptions.value.filter((s) => s.category === form.value.category);
});

const stateOptions = [
  { label: "Pendiente",    value: "Pendiente" },
  { label: "Reprogramada", value: "Reprogramada" },
  { label: "Cancelada",    value: "Cancelada" },
  { label: "Completada",   value: "Completada" },
  { label: "No asistio",   value: "No asistio" },
];

const tomorrow = computed(() => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d;
});

// Slots fijos del horario
const timeSlots = computed(() => {
  const slots = [];
  const addSlots = (startH, startM, endH, endM) => {
    for (let h = startH; h <= endH; h++) {
      const minStart = h === startH ? startM : 0;
      const minEnd   = h === endH   ? endM   : 59;
      for (let m = minStart; m <= minEnd; m += 20) {
        slots.push(`${h}:${String(m).padStart(2, "0")}`);
      }
    }
  };
  addSlots(8, 30, 12, 30);
  addSlots(14, 30, 18, 0);
  return slots;
});

// ── Carga de disponibilidad al cambiar fecha o médico ───────────────────────
const fetchAvailability = async () => {
  if (!form.value.date || !form.value.category) {
    occupiedSlots.value = [];
    return;
  }
  loadingSlots.value = true;
  form.value.time = null;
  try {
    // El backend espera dd/MM/yyyy
    const formattedDate = convertToDDMMYYYY(form.value.date.toISOString());
    const { data } = await AppointmentApi.getAvailability(formattedDate, form.value.category);
    const appts = data.appointments ?? [];
    const doctors = data.doctors ?? [];
    const selectedDoc = form.value.doctor;
    occupiedSlots.value = timeSlots.value.filter((slot) => {
      const atSlot = appts.filter((a) => a.time === slot);
      // Todos los médicos de la categoría están ocupados en este slot
      if (doctors.length > 0 && atSlot.length >= doctors.length) return true;
      // El médico seleccionado ya tiene cita en este slot
      if (selectedDoc) {
        return atSlot.some((a) => (a.doctor?.toString() ?? String(a.doctor)) === selectedDoc.toString());
      }
      return false;
    });
  } catch (e) {
    console.error("Error al cargar disponibilidad:", e);
    occupiedSlots.value = [];
  } finally {
    loadingSlots.value = false;
  }
};

const onDateChange = async () => {
  await fetchAvailability();
};

const onDoctorChange = async () => {
  if (form.value.date) await fetchAvailability();
};

const onCategoryChange = () => {
  form.value.serviceId = null;
  form.value.doctor = null;
  form.value.time = null;
  occupiedSlots.value = [];
  loadDoctors(form.value.category);
  if (form.value.date) fetchAvailability();
};

// ── Carga de datos ───────────────────────────────────────────────────────────
const loadPatients = async () => {
  loadingPatients.value = true;
  try {
    const { data } = await api.get("patient", { params: { page: 1, page_size: 200 } });
    patientOptions.value = (data.results ?? []).map((p) => ({
      value: p._id,
      label: `${[p.primerApellido, p.segundoApellido, p.nombres].filter(Boolean).join(' ')} — SUS: ${p.susCode}`,
    }));
  } catch (e) {
    console.error(e);
  } finally {
    loadingPatients.value = false;
  }
};

const loadServices = async () => {
  loadingServices.value = true;
  loadingCategories.value = true;
  try {
    const { data } = await api.get("services");
    allServiceOptions.value = (data ?? []).map((s) => ({
      value: s._id,
      label: s.name,
      category: s.category,
    }));
    // Categorías únicas
    const cats = [...new Set((data ?? []).map((s) => s.category).filter(Boolean))];
    categoryOptions.value = cats.map((c) => ({ label: c, value: c }));
  } catch (e) {
    console.error(e);
  } finally {
    loadingServices.value = false;
    loadingCategories.value = false;
  }
};

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

// ── Validación ───────────────────────────────────────────────────────────────
const validate = () => {
  const e = {};
  if (!form.value.targetPatientId) e.targetPatientId = "Seleccione un paciente";
  if (!form.value.category)        e.category        = "Seleccione una categoría";
  if (!form.value.serviceId)       e.serviceId       = "Seleccione un servicio";
  if (!form.value.date)            e.date            = "Seleccione una fecha";
  if (!form.value.time)            e.time            = "Seleccione una hora";
  if (isBranchManager.value && !form.value.doctor) e.doctor = "Seleccione un médico";
  errors.value = e;
  return Object.keys(e).length === 0;
};

// ── Submit ───────────────────────────────────────────────────────────────────
const submit = async () => {
  if (!validate()) return;
  if (submitting.value) return;

  const payload = {
    targetPatientId: form.value.targetPatientId,
    services: [form.value.serviceId],
    date: form.value.date.toISOString(),
    time: form.value.time,
    state: form.value.state,
    doctor: form.value.doctor || null,
    notes: form.value.notes || "",
  };

  submitting.value = true;
  try {
    await api.post("appointments", payload);
    toast.open({ message: "Cita creada correctamente", type: "success" });
    visible.value = false;
    resetForm();
    emit("created");
  } catch (err) {
    toast.open({
      message: err.response?.data?.msg || err.response?.data?.message || "Error al crear la cita",
      type: "error",
    });
  } finally {
    submitting.value = false;
  }
};

const resetForm = () => {
  form.value = { targetPatientId: null, category: null, serviceId: null, date: null, time: null, doctor: null, state: "Pendiente", notes: "" };
  errors.value = {};
  occupiedSlots.value = [];
};

onMounted(async () => {
  await Promise.all([loadPatients(), loadServices()]);
});
</script>
