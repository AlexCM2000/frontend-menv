<template>
  <Dialog
    v-model:visible="visibleDetail"
    modal
    :style="{ minWidth: '48vw' }"
    :breakpoints="{ '1199px': '75vw', '575px': '95vw' }"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <Avatar
          :label="initials"
          shape="circle"
          class="bg-teal-100 text-teal-700 font-bold text-sm"
          size="large"
        />
        <div>
          <p class="font-bold text-base text-gray-800 leading-tight">
            {{ p.firstName }} {{ p.lastName }}
          </p>
          <p class="text-xs text-gray-400">SUS: {{ p.susCode ?? "—" }}</p>
        </div>
      </div>
    </template>

    <div v-if="p" class="space-y-6">

      <!-- Información personal -->
      <section>
        <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Información personal</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailField label="Fecha de nacimiento" :value="formatDOB(p.dateOfBirth)" />
          <DetailField label="Género" :value="p.gender" />
          <DetailField label="Email" :value="p.email" class="sm:col-span-2" />
          <DetailField label="Teléfono" :value="p.contactInfo?.phone" />
          <DetailField label="Dirección" :value="p.contactInfo?.address" />
          <DetailField label="Centro de salud" :value="p.healthCenter?.name ?? p.healthCenter" />
        </div>
      </section>

      <!-- Contacto de emergencia -->
      <section>
        <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Contacto de emergencia</h3>
        <div v-if="hasEmergencyContact" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailField label="Nombre" :value="p.emergencyContact?.name" />
          <DetailField label="Parentesco" :value="p.emergencyContact?.relationship" />
          <DetailField label="Teléfono" :value="p.emergencyContact?.phone" />
        </div>
        <p v-else class="text-sm text-gray-400 italic">Sin contacto de emergencia registrado</p>
      </section>

      <!-- Condiciones médicas y alergias -->
      <section class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Condiciones médicas</h3>
          <div v-if="p.medicalConditions?.length" class="flex flex-wrap gap-1.5">
            <Tag v-for="c in p.medicalConditions" :key="c" :value="c" severity="info" class="text-xs" />
          </div>
          <p v-else class="text-sm text-gray-400 italic">Sin condiciones registradas</p>
        </div>
        <div>
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Alergias</h3>
          <div v-if="p.allergies?.length" class="flex flex-wrap gap-1.5">
            <Tag v-for="a in p.allergies" :key="a" :value="a" severity="danger" class="text-xs" />
          </div>
          <p v-else class="text-sm text-gray-400 italic">Sin alergias registradas</p>
        </div>
      </section>

    </div>

    <template #footer>
      <Button label="Cerrar" severity="secondary" outlined @click="closeModalDetail" />
    </template>
  </Dialog>
</template>

<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import Dialog from "primevue/dialog";
import Avatar from "primevue/avatar";
import Button from "primevue/button";
import Tag from "primevue/tag";
import { usePatientStore } from "../store/patientStore";

// Subcomponente simple para un campo
const DetailField = {
  props: { label: String, value: [String, Number] },
  template: `
    <div>
      <p class="text-xs font-semibold text-gray-500 mb-0.5">{{ label }}</p>
      <p class="text-sm text-gray-800">{{ value && value !== '' ? value : '—' }}</p>
    </div>
  `,
};

const { visibleDetail, currentPatientDetail } = storeToRefs(usePatientStore());
const { closeModalDetail } = usePatientStore();

const p = computed(() => currentPatientDetail.value ?? {});

const initials = computed(() => {
  const f = p.value.firstName?.[0] ?? "";
  const l = p.value.lastName?.[0] ?? "";
  return (f + l).toUpperCase() || "?";
});

const hasEmergencyContact = computed(() =>
  p.value.emergencyContact?.name ||
  p.value.emergencyContact?.phone ||
  p.value.emergencyContact?.relationship
);

const formatDOB = (dob) => {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d)) return dob;
  return d.toLocaleDateString("es-BO", { day: "2-digit", month: "long", year: "numeric" });
};
</script>