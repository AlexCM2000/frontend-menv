<template>
  <Dialog
    v-model:visible="visibleDetail"
    modal
    :style="{ minWidth: '56vw' }"
    :breakpoints="{ '1199px': '80vw', '575px': '98vw' }"
    @show="loadDetail"
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
            {{ record?.patient?.firstName }} {{ record?.patient?.lastName }}
          </p>
          <p class="text-xs text-gray-400">SUS: {{ record?.patient?.susCode ?? "—" }}</p>
        </div>
        <Tag
          v-if="record?.state"
          :value="record.state"
          :severity="stateSeverity(record.state)"
          class="text-xs capitalize ml-2"
        />
      </div>
    </template>

    <!-- Loader -->
    <div v-if="loading" class="flex justify-center py-10">
      <i class="pi pi-spin pi-spinner text-3xl text-gray-300" />
    </div>

    <div v-else-if="record" class="space-y-6">

      <!-- Citas médicas -->
      <section>
        <SectionTitle icon="pi-calendar" label="Citas médicas" :count="record.medicalAppointments?.length" />
        <div v-if="record.medicalAppointments?.length" class="space-y-2 mt-2">
          <div
            v-for="apt in record.medicalAppointments"
            :key="apt._id"
            class="flex items-center gap-3 bg-gray-50 rounded-lg p-3 text-sm"
          >
            <i class="pi pi-calendar text-blue-400" />
            <span class="text-gray-700 font-medium">{{ formatDate(apt.date) }}</span>
            <span class="text-gray-400">{{ apt.time }}</span>
            <Tag :value="apt.state ?? apt.status" :severity="aptSeverity(apt.state ?? apt.status)" class="text-xs ml-auto" />
          </div>
        </div>
        <EmptySection v-else label="Sin citas registradas" />
      </section>

      <!-- Diagnósticos -->
      <section>
        <SectionTitle icon="pi-clipboard" label="Diagnósticos" :count="record.diagnoses?.length" />
        <div v-if="record.diagnoses?.length" class="space-y-2 mt-2">
          <div
            v-for="d in record.diagnoses"
            :key="d._id"
            class="bg-blue-50 border border-blue-100 rounded-lg p-3"
          >
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">{{ d.code || "—" }}</span>
              <span class="text-xs text-gray-400">{{ formatDate(d.date) }}</span>
              <span v-if="d.doctor?.name" class="text-xs text-gray-500 ml-auto">Dr. {{ d.doctor.name }}</span>
            </div>
            <p class="text-sm text-gray-700">{{ d.description || "—" }}</p>
            <p v-if="d.createdBy?.name" class="text-xs text-gray-400 mt-1">Registrado por: {{ d.createdBy.name }}</p>
          </div>
        </div>
        <EmptySection v-else label="Sin diagnósticos registrados" />
      </section>

      <!-- Medicaciones -->
      <section>
        <SectionTitle icon="pi-heart" label="Medicaciones" :count="record.medications?.length" />
        <div v-if="record.medications?.length" class="space-y-2 mt-2">
          <div
            v-for="m in record.medications"
            :key="m._id"
            class="bg-green-50 border border-green-100 rounded-lg p-3 text-sm"
          >
            <p class="font-semibold text-gray-800">{{ m.name }}</p>
            <p class="text-gray-500">Dosis: {{ m.dose || "—" }}</p>
            <p v-if="m.start || m.end" class="text-xs text-gray-400 mt-1">
              {{ formatDate(m.start) }} → {{ formatDate(m.end) }}
            </p>
          </div>
        </div>
        <EmptySection v-else label="Sin medicaciones registradas" />
      </section>

      <!-- Tratamientos previos -->
      <section>
        <SectionTitle icon="pi-list" label="Tratamientos previos" :count="record.previousTreatments?.length" />
        <div v-if="record.previousTreatments?.length" class="space-y-2 mt-2">
          <div
            v-for="t in record.previousTreatments"
            :key="t._id"
            class="bg-purple-50 border border-purple-100 rounded-lg p-3 text-sm"
          >
            <p class="font-semibold text-gray-800">{{ t.treatment }}</p>
            <p v-if="t.from || t.to" class="text-xs text-gray-400 mt-1">
              {{ formatDate(t.from) }} → {{ formatDate(t.to) }}
            </p>
          </div>
        </div>
        <EmptySection v-else label="Sin tratamientos previos" />
      </section>

      <!-- Historial de alergias -->
      <section>
        <SectionTitle icon="pi-exclamation-triangle" label="Historial de alergias" :count="record.allergyHistory?.length" />
        <div v-if="record.allergyHistory?.length" class="space-y-2 mt-2">
          <div
            v-for="a in record.allergyHistory"
            :key="a._id"
            class="bg-red-50 border border-red-100 rounded-lg p-3 text-sm"
          >
            <p class="font-semibold text-red-700">{{ a.substance }}</p>
            <p class="text-gray-600">{{ a.reaction }}</p>
            <p v-if="a.date" class="text-xs text-gray-400 mt-1">{{ formatDate(a.date) }}</p>
          </div>
        </div>
        <EmptySection v-else label="Sin alergias registradas" />
      </section>

      <!-- Observaciones -->
      <section>
        <SectionTitle icon="pi-pencil" label="Observaciones" :count="record.observations?.length" />
        <div v-if="record.observations?.length" class="space-y-2 mt-2">
          <div
            v-for="o in record.observations"
            :key="o._id"
            class="bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-sm"
          >
            <p class="text-gray-700">{{ o.note }}</p>
            <div class="flex items-center gap-3 mt-1">
              <span class="text-xs text-gray-400">{{ formatDate(o.date) }}</span>
              <span v-if="o.createdBy?.name" class="text-xs text-gray-400">— {{ o.createdBy.name }}</span>
              <span v-if="o.doctor?.name" class="text-xs text-indigo-500 ml-auto">Dr. {{ o.doctor.name }}</span>
            </div>
          </div>
        </div>
        <EmptySection v-else label="Sin observaciones registradas" />
      </section>

    </div>

    <template #footer>
      <Button label="Cerrar" severity="secondary" outlined @click="visibleDetail = false" />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { storeToRefs } from "pinia";
import Dialog from "primevue/dialog";
import Avatar from "primevue/avatar";
import Button from "primevue/button";
import Tag from "primevue/tag";
import { useRecordStore } from "../store/recordStore";
import { getRecordById } from "../api/recordsApi";

// Sub-componentes inline
const SectionTitle = {
  props: { icon: String, label: String, count: Number },
  template: `
    <div class="flex items-center gap-2 border-b border-gray-100 pb-1">
      <i :class="['pi', icon, 'text-gray-400 text-sm']" />
      <h3 class="text-sm font-semibold text-gray-600">{{ label }}</h3>
      <span v-if="count != null" class="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{{ count }}</span>
    </div>
  `,
};

const EmptySection = {
  props: { label: String },
  template: `<p class="text-xs text-gray-400 italic mt-2 pl-1">{{ label }}</p>`,
};

const recordStore = useRecordStore();
const { visibleDetail, currentRecordDetail } = storeToRefs(recordStore);

const loading = ref(false);
const record = ref(null);

const loadDetail = async () => {
  if (!currentRecordDetail.value?._id) return;
  loading.value = true;
  try {
    record.value = await getRecordById(currentRecordDetail.value._id);
  } catch {
    record.value = currentRecordDetail.value;
  } finally {
    loading.value = false;
  }
};

// Limpiar al cerrar
watch(visibleDetail, (val) => {
  if (!val) record.value = null;
});

const initials = computed(() => {
  const f = record.value?.patient?.firstName?.[0] ?? "";
  const l = record.value?.patient?.lastName?.[0] ?? "";
  return (f + l).toUpperCase() || "?";
});

const formatDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date)) return d;
  return date.toLocaleDateString("es-BO", { day: "2-digit", month: "short", year: "numeric" });
};

const stateSeverity = (s) => {
  if (s === "activo") return "success";
  if (s === "en tratamiento") return "warn";
  if (s === "cerrado") return "secondary";
  return "info";
};

const aptSeverity = (s) => {
  if (s === "Completada") return "success";
  if (s === "Pendiente") return "warn";
  if (s === "Cancelada") return "danger";
  if (s === "Reprogramada") return "info";
  return "secondary";
};
</script>