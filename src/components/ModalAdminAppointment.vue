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

      <!-- Usuario / Paciente -->
      <div class="md:col-span-2">
        <label class="block text-gray-700 font-medium text-sm mb-1">Paciente <span class="text-red-500">*</span></label>
        <Select
          v-model="form.targetUserId"
          :options="userOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Seleccione un paciente"
          filter
          filterPlaceholder="Buscar por nombre o email..."
          class="w-full"
          :loading="loadingUsers"
        />
        <p v-if="errors.targetUserId" class="text-red-500 text-xs mt-1">{{ errors.targetUserId }}</p>
      </div>

      <!-- Servicio -->
      <div class="md:col-span-2">
        <label class="block text-gray-700 font-medium text-sm mb-1">Servicio <span class="text-red-500">*</span></label>
        <Select
          v-model="form.serviceId"
          :options="serviceOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Seleccione un servicio"
          filter
          filterPlaceholder="Buscar servicio..."
          class="w-full"
          :loading="loadingServices"
        />
        <p v-if="errors.serviceId" class="text-red-500 text-xs mt-1">{{ errors.serviceId }}</p>
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
        />
        <p v-if="errors.date" class="text-red-500 text-xs mt-1">{{ errors.date }}</p>
      </div>

      <!-- Hora -->
      <div>
        <label class="block text-gray-700 font-medium text-sm mb-1">Hora <span class="text-red-500">*</span></label>
        <Select
          v-model="form.time"
          :options="timeSlots"
          placeholder="Seleccione una hora"
          class="w-full"
        />
        <p v-if="errors.time" class="text-red-500 text-xs mt-1">{{ errors.time }}</p>
      </div>

      <!-- Médico (opcional) -->
      <div>
        <label class="block text-gray-700 font-medium text-sm mb-1">Médico <span class="text-gray-400 font-normal">(opcional)</span></label>
        <Select
          v-model="form.doctor"
          :options="doctorOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Sin preferencia"
          showClear
          class="w-full"
          :loading="loadingDoctors"
        />
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
        <Button label="Crear cita" icon="pi pi-check" :loading="submitting" @click="submit" />
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

const emit = defineEmits(["created"]);

const visible = defineModel("visible", { default: false });
const toast = inject("toast");

// ── Estado del formulario ────────────────────────────────────────────────────
const form = ref({
  targetUserId: null,
  serviceId: null,
  date: null,
  time: null,
  doctor: null,
  state: "Pendiente",
  notes: "",
});

const errors = ref({});
const submitting = ref(false);

// ── Opciones de listas ───────────────────────────────────────────────────────
const userOptions = ref([]);
const serviceOptions = ref([]);
const doctorOptions = ref([]);
const loadingUsers = ref(false);
const loadingServices = ref(false);
const loadingDoctors = ref(false);

const stateOptions = [
  { label: "Pendiente",    value: "Pendiente" },
  { label: "Reprogramada", value: "Reprogramada" },
  { label: "Cancelada",    value: "Cancelada" },
  { label: "Completada",   value: "Completada" },
  { label: "No asistio",   value: "No asistio" },
];

// Mañana como fecha mínima
const tomorrow = computed(() => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d;
});

// ── Slots de hora (igual que appointments store) ─────────────────────────────
const timeSlots = computed(() => {
  const slots = [];
  const addSlots = (startH, startM, endH) => {
    for (let h = startH; h <= endH; h++) {
      const minStart = h === startH ? startM : 0;
      for (let m = minStart; m < 60; m += 20) {
        if (h === endH && m > 0) break;
        slots.push(`${h}:${String(m).padStart(2, "0")}`);
      }
    }
  };
  addSlots(8, 30, 12);
  addSlots(14, 30, 18);
  return slots;
});

// ── Carga de datos ───────────────────────────────────────────────────────────
const loadUsers = async () => {
  loadingUsers.value = true;
  try {
    const { data } = await api.get("usersList", { params: { page: 1, page_size: 200 } });
    userOptions.value = (data.results ?? []).map((u) => ({
      value: u._id,
      label: `${u.name} — ${u.email}`,
    }));
  } catch (e) {
    console.error(e);
  } finally {
    loadingUsers.value = false;
  }
};

const loadServices = async () => {
  loadingServices.value = true;
  try {
    const { data } = await api.get("services");
    serviceOptions.value = (data ?? []).map((s) => ({
      value: s._id,
      label: `${s.name} (${s.category}) — Bs. ${s.price}`,
      price: s.price,
    }));
  } catch (e) {
    console.error(e);
  } finally {
    loadingServices.value = false;
  }
};

const loadDoctors = async () => {
  loadingDoctors.value = true;
  try {
    const docs = await getDoctorsForSelect();
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
  if (!form.value.targetUserId) e.targetUserId = "Seleccione un paciente";
  if (!form.value.serviceId)    e.serviceId    = "Seleccione un servicio";
  if (!form.value.date)         e.date         = "Seleccione una fecha";
  if (!form.value.time)         e.time         = "Seleccione una hora";
  errors.value = e;
  return Object.keys(e).length === 0;
};

// ── Submit ───────────────────────────────────────────────────────────────────
const submit = async () => {
  if (!validate()) return;

  const selectedService = serviceOptions.value.find(
    (s) => s.value === form.value.serviceId
  );

  const payload = {
    targetUserId: form.value.targetUserId,
    services: [form.value.serviceId],
    date: form.value.date.toISOString(),
    time: form.value.time,
    totalAmount: selectedService?.price ?? 0,
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
      message: err.response?.data?.message || "Error al crear la cita",
      type: "error",
    });
  } finally {
    submitting.value = false;
  }
};

const resetForm = () => {
  form.value = { targetUserId: null, serviceId: null, date: null, time: null, doctor: null, state: "Pendiente", notes: "" };
  errors.value = {};
};

onMounted(async () => {
  await Promise.all([loadUsers(), loadServices(), loadDoctors()]);
});
</script>
