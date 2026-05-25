<template>
  <Dialog
    v-model:visible="visibleDetail"
    modal
    :style="{ width: '58rem', maxWidth: '95vw' }"
    :breakpoints="{ '1199px': '80vw', '575px': '95vw' }"
  >
    <!-- Header -->
    <template #header>
      <div class="w-full flex items-start gap-4">
        <!-- Avatar -->
        <div
          class="w-14 h-14 rounded-2xl bg-teal-50 border-2 border-teal-200 flex items-center justify-center flex-shrink-0"
        >
          <span class="text-xl font-bold text-teal-700 select-none">{{ initials }}</span>
        </div>

        <!-- Nombre y datos rápidos -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap mb-1">
            <h2 class="text-base font-bold text-gray-900 leading-tight">
              {{ fullName }}
            </h2>
            <Tag
              v-if="p.gender"
              :value="p.gender"
              :severity="p.gender === 'Masculino' ? 'info' : 'contrast'"
              class="text-xs"
            />
          </div>
          <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span class="inline-flex items-center gap-1 text-xs text-gray-500">
              <i class="pi pi-id-card text-teal-500 text-xs"></i>
              SUS: <strong class="text-gray-700 ml-0.5">{{ p.susCode ?? "—" }}</strong>
            </span>
            <span v-if="age !== null" class="inline-flex items-center gap-1 text-xs text-gray-500">
              <i class="pi pi-calendar text-indigo-400 text-xs"></i>
              {{ age }} años
            </span>
            <span class="inline-flex items-center gap-1 text-xs text-gray-500">
              <i class="pi pi-building text-gray-400 text-xs"></i>
              {{ p.healthCenter?.name ?? p.healthCenter ?? "—" }}
            </span>
          </div>
        </div>
      </div>
    </template>

    <!-- Body -->
    <div v-if="p" class="space-y-4 pt-1">

      <!-- 1. DATOS PERSONALES -->
      <section class="rounded-xl border border-gray-100 overflow-hidden">
        <div class="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
          <span class="w-5 h-5 rounded-md bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <i class="pi pi-user text-indigo-600" style="font-size: 0.6rem"></i>
          </span>
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Datos personales</p>
        </div>
        <div class="p-4 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
          <InfoField
            icon="pi-calendar"
            icon-color="text-indigo-400"
            label="Fecha de nacimiento"
            :value="formatDOB(p.dateOfBirth)"
          />
          <InfoField
            icon="pi-id-card"
            icon-color="text-teal-500"
            label="Código SUS"
            :value="p.susCode"
            highlight
          />
          <InfoField
            icon="pi-phone"
            icon-color="text-green-500"
            label="Teléfono del paciente"
            :value="p.contactInfo?.phone"
          />
          <InfoField
            icon="pi-envelope"
            icon-color="text-violet-500"
            label="Correo electrónico"
            :value="p.email"
            class="col-span-2"
          />
          <InfoField
            icon="pi-map-marker"
            icon-color="text-gray-400"
            label="Dirección"
            :value="p.contactInfo?.address"
            class="col-span-2 sm:col-span-3"
          />
        </div>
      </section>

      <!-- 2. CONTACTO DE EMERGENCIA -->
      <section class="rounded-xl border border-gray-100 overflow-hidden">
        <div class="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
          <span class="w-5 h-5 rounded-md bg-rose-100 flex items-center justify-center flex-shrink-0">
            <i class="pi pi-heart text-rose-500" style="font-size: 0.6rem"></i>
          </span>
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contacto de emergencia</p>
        </div>
        <div class="p-4">
          <div v-if="hasEmergencyContact" class="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
            <InfoField
              icon="pi-user"
              icon-color="text-rose-400"
              label="Nombre completo"
              :value="p.emergencyContact?.name"
            />
            <InfoField
              icon="pi-users"
              icon-color="text-rose-400"
              label="Parentesco"
              :value="p.emergencyContact?.relationship"
            />
            <InfoField
              icon="pi-phone"
              icon-color="text-rose-400"
              label="Teléfono de emergencia"
              :value="p.emergencyContact?.phone"
            />
          </div>
          <p v-else class="text-sm text-gray-400 italic py-1">
            Sin contacto de emergencia registrado
          </p>
        </div>
      </section>

      <!-- 3. ANTECEDENTES MÉDICOS -->
      <section class="rounded-xl border border-gray-100 overflow-hidden">
        <div class="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
          <span class="w-5 h-5 rounded-md bg-amber-100 flex items-center justify-center flex-shrink-0">
            <i class="pi pi-list text-amber-600" style="font-size: 0.6rem"></i>
          </span>
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Antecedentes médicos</p>
        </div>
        <div class="p-4 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <!-- Alergias -->
          <div>
            <p class="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
              <i class="pi pi-exclamation-triangle text-amber-500 text-xs"></i>
              Alergias
            </p>
            <div v-if="p.allergies?.length" class="flex flex-wrap gap-1.5">
              <Tag
                v-for="a in p.allergies"
                :key="a"
                :value="a"
                severity="danger"
                class="text-xs"
              />
            </div>
            <p v-else class="text-sm text-gray-400 italic">Sin alergias registradas</p>
          </div>
          <!-- Condiciones médicas -->
          <div>
            <p class="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
              <i class="pi pi-clipboard text-blue-500 text-xs"></i>
              Condiciones médicas
            </p>
            <div v-if="p.medicalConditions?.length" class="flex flex-wrap gap-1.5">
              <Tag
                v-for="c in p.medicalConditions"
                :key="c"
                :value="c"
                severity="info"
                class="text-xs"
              />
            </div>
            <p v-else class="text-sm text-gray-400 italic">Sin condiciones registradas</p>
          </div>
        </div>
      </section>

    </div>

    <!-- Footer -->
    <template #footer>
      <div class="flex items-center justify-between w-full">
        <span class="text-xs text-gray-300 font-mono select-all">{{ p._id ?? "" }}</span>
        <Button label="Cerrar" severity="secondary" outlined @click="closeModalDetail" />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { computed, h } from "vue";
import { storeToRefs } from "pinia";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Tag from "primevue/tag";
import { usePatientStore } from "../store/patientStore";

// Componente interno: campo con icono
const InfoField = {
  props: {
    icon: String,
    iconColor: { type: String, default: "text-gray-400" },
    label: String,
    value: [String, Number],
    highlight: { type: Boolean, default: false },
  },
  setup(props) {
    return () =>
      h("div", {}, [
        h(
          "p",
          { class: "text-xs text-gray-400 mb-0.5 flex items-center gap-1" },
          [
            h("i", { class: `pi ${props.icon} ${props.iconColor}`, style: "font-size: 0.7rem" }),
            props.label,
          ]
        ),
        h(
          "p",
          {
            class: props.highlight
              ? "text-sm font-semibold text-teal-700"
              : "text-sm text-gray-800 break-words",
          },
          props.value && props.value !== "" ? props.value : "—"
        ),
      ]);
  },
};

// Store
const { visibleDetail, currentPatientDetail } = storeToRefs(usePatientStore());
const { closeModalDetail } = usePatientStore();

const p = computed(() => currentPatientDetail.value ?? {});

const fullName = computed(() =>
  [p.value.primerApellido, p.value.segundoApellido, p.value.nombres]
    .filter(Boolean)
    .join(" ") || "—"
);

const initials = computed(() => {
  const a = p.value.primerApellido?.[0] ?? "";
  const n = p.value.nombres?.[0] ?? "";
  return (a + n).toUpperCase() || "?";
});

const age = computed(() => {
  if (!p.value.dateOfBirth) return null;
  const dob = new Date(p.value.dateOfBirth);
  if (isNaN(dob)) return null;
  const today = new Date();
  let years = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) years--;
  return years;
});

const hasEmergencyContact = computed(
  () =>
    p.value.emergencyContact?.name ||
    p.value.emergencyContact?.phone ||
    p.value.emergencyContact?.relationship
);

const formatDOB = (dob) => {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d)) return dob;
  return d.toLocaleDateString("es-BO", {
    timeZone: "UTC",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};
</script>
