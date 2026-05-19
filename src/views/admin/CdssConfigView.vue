<script setup>
import { ref, watch, onMounted, computed } from "vue";
import { storeToRefs } from "pinia";
import { useCdssStore } from "@/stores/cdssStore";
import Swal from "sweetalert2";
import Skeleton from "primevue/skeleton";
import InputNumber from "primevue/inputnumber";
import Button from "primevue/button";

const loadError = ref(false);

const cdssStore = useCdssStore();
const { config, loading, saving } = storeToRefs(cdssStore);

/* ─── Definición de signos vitales ───────────────────── */
const VITAL_DEFS = [
  {
    key: "systolicBP",
    label: "Presión Sistólica",
    unit: "mmHg",
    icon: "pi-heart",
    description: "Presión arterial durante la contracción cardíaca (sístole).",
    step: 1,
    min: 40,
    max: 250,
    decimals: 0,
    noHighAlerts: false,
  },
  {
    key: "diastolicBP",
    label: "Presión Diastólica",
    unit: "mmHg",
    icon: "pi-heart",
    description: "Presión arterial durante el reposo entre latidos (diástole).",
    step: 1,
    min: 20,
    max: 160,
    decimals: 0,
    noHighAlerts: false,
  },
  {
    key: "heartRate",
    label: "Frecuencia Cardíaca",
    unit: "lpm",
    icon: "pi-chart-line",
    description: "Número de latidos cardíacos por minuto.",
    step: 1,
    min: 20,
    max: 300,
    decimals: 0,
    noHighAlerts: false,
  },
  {
    key: "temperature",
    label: "Temperatura Corporal",
    unit: "°C",
    icon: "pi-sun",
    description: "Temperatura corporal en grados Celsius.",
    step: 0.1,
    min: 30,
    max: 45,
    decimals: 1,
    noHighAlerts: false,
  },
  {
    key: "oxygenSaturation",
    label: "Saturación de Oxígeno",
    unit: "%",
    icon: "pi-cloud",
    description: "Porcentaje de saturación de oxígeno en sangre (SpO₂).",
    step: 1,
    min: 50,
    max: 100,
    decimals: 0,
    noHighAlerts: true,
  },
];

const THRESHOLD_FIELDS = [
  {
    key: "critLow",
    label: "Crítico bajo",
    dot: "bg-red-500",
    textClass: "text-red-700",
  },
  {
    key: "warnLow",
    label: "Advertencia baja",
    dot: "bg-orange-400",
    textClass: "text-orange-700",
  },
  {
    key: "normalMin",
    label: "Normal mínimo",
    dot: "bg-green-500",
    textClass: "text-green-700",
  },
  {
    key: "normalMax",
    label: "Normal máximo",
    dot: "bg-green-500",
    textClass: "text-green-700",
  },
  {
    key: "warnHigh",
    label: "Advertencia alta",
    dot: "bg-orange-400",
    textClass: "text-orange-700",
  },
  {
    key: "critHigh",
    label: "Crítico alto",
    dot: "bg-red-500",
    textClass: "text-red-700",
  },
];

/* ─── Formulario local (deep clone de config) ─────────── */
const form = ref({});

const initForm = () => {
  if (!config.value?.vitalSigns) return;
  const vs = config.value.vitalSigns;
  form.value = {
    systolicBP: { ...vs.systolicBP },
    diastolicBP: { ...vs.diastolicBP },
    heartRate: { ...vs.heartRate },
    temperature: { ...vs.temperature },
    oxygenSaturation: { ...vs.oxygenSaturation },
  };
};

watch(
  () => config.value,
  (val) => {
    if (val) initForm();
  },
);

const hasForm = computed(
  () => form.value && Object.keys(form.value).length > 0,
);

onMounted(async () => {
  await cdssStore.loadConfig();
  if (!config.value) {
    loadError.value = true;
    return;
  }
  initForm();
});

/* ─── Acciones ─────────────────────────────────────────── */
const save = async () => {
  await cdssStore.saveConfig(form.value);
};

const resetToDefaults = async () => {
  const result = await Swal.fire({
    title: "¿Restablecer valores predeterminados?",
    text: "Los umbrales volverán a los valores basados en guías OMS/JNC. Esta acción no se puede deshacer.",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, restablecer",
    cancelButtonText: "Cancelar",
    buttonsStyling: false,
    customClass: {
      popup: "rounded-xl shadow-md",
      confirmButton:
        "bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700 transition",
      cancelButton:
        "bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition ml-2",
    },
  });
  if (!result.isConfirmed) return;
  await cdssStore.resetConfig();
  initForm();
};

/* ─── Vista previa de zonas ────────────────────────────── */
const getZoneLabel = (vsKey) => {
  const v = form.value[vsKey];
  if (!v) return "";
  const parts = [
    v.critLow != null ? `< ${v.critLow}` : null,
    v.warnLow != null ? `${v.warnLow}–${v.normalMin ?? "?"}` : null,
    v.normalMin != null && v.normalMax != null
      ? `${v.normalMin}–${v.normalMax} ✓`
      : null,
    v.warnHigh != null ? `${v.normalMax ?? "?"}–${v.warnHigh}` : null,
    v.critHigh != null ? `≥ ${v.critHigh}` : null,
  ].filter(Boolean);
  return parts.join(" | ");
};
</script>

<template>
  <div class="px-4 sm:px-6 py-6 max-w-5xl mx-auto space-y-6">
    <!-- ── Encabezado ──────────────────────────────────── -->
    <div>
      <div class="flex items-center gap-3 mb-3">
        <div
          class="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center shrink-0"
        >
          <i class="pi pi-sliders-h text-sky-600 text-lg"></i>
        </div>
        <div>
          <h1 class="text-xl font-bold text-gray-800 leading-tight">
            Configuración CDSS
          </h1>
          <p class="text-sm text-gray-500">
            Sistema de Apoyo a Decisiones Clínicas — Umbrales de Signos Vitales
          </p>
        </div>
      </div>

      <!-- <div class="bg-sky-50 border border-sky-200 rounded-xl p-4">
        <p class="text-sm text-sky-800 leading-relaxed">
          <strong>¿Qué es el CDSS?</strong> Al guardar signos vitales en un historial clínico, el sistema
          evalúa automáticamente cada valor contra los umbrales definidos aquí y genera alertas con
          nivel de severidad (<span class="font-semibold text-red-600">Crítico</span>,
          <span class="font-semibold text-orange-600">Advertencia</span> o
          <span class="font-semibold text-yellow-600">Elevado</span>). Ajusta los rangos según los
          protocolos de tu centro de salud.
        </p>
      </div> -->
    </div>

    <!-- ── Leyenda de colores ──────────────────────────── -->
    <div class="flex flex-wrap gap-3 text-xs">
      <span
        class="flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-full font-medium"
      >
        <span class="w-2 h-2 rounded-full bg-red-500 shrink-0"></span> Crítico
      </span>
      <span
        class="flex items-center gap-1.5 bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1.5 rounded-full font-medium"
      >
        <span class="w-2 h-2 rounded-full bg-orange-400 shrink-0"></span>
        Advertencia
      </span>
      <span
        class="flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full font-medium"
      >
        <span class="w-2 h-2 rounded-full bg-green-500 shrink-0"></span> Normal
      </span>
    </div>

    <!-- ── Skeleton mientras carga ─────────────────────── -->
    <div v-if="loading" class="space-y-4">
      <div
        v-for="i in 5"
        :key="i"
        class="bg-white rounded-xl border border-gray-100 p-4"
      >
        <Skeleton height="1.5rem" class="mb-3 w-1/3" />
        <Skeleton height="0.75rem" class="mb-4 w-1/2" />
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div v-for="j in 6" :key="j">
            <Skeleton height="1rem" class="mb-1 w-1/2" />
            <Skeleton height="2.5rem" />
          </div>
        </div>
      </div>
    </div>

    <!-- ── Error al cargar ─────────────────────────────── -->
    <div
      v-else-if="loadError"
      class="bg-red-50 border border-red-200 rounded-xl p-6 text-center"
    >
      <i class="pi pi-exclamation-circle text-red-400 text-3xl mb-2 block"></i>
      <p class="text-red-700 font-medium">
        No se pudo cargar la configuración CDSS.
      </p>
      <p class="text-red-500 text-sm mt-1">
        Verifica que el servidor esté activo e intenta de nuevo.
      </p>
    </div>

    <!-- ── Cards de signos vitales ─────────────────────── -->
    <div v-else-if="hasForm" class="space-y-4">
      <div
        v-for="vs in VITAL_DEFS"
        :key="vs.key"
        class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <!-- Cabecera de la tarjeta -->
        <div
          class="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100"
        >
          <div
            class="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0"
          >
            <i :class="`pi ${vs.icon} text-sky-500 text-sm`"></i>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-gray-800 text-sm leading-tight">
              {{ vs.label }}
            </h3>
            <p class="text-xs text-gray-400 truncate">{{ vs.description }}</p>
          </div>
          <span
            class="text-xs font-mono text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded shrink-0"
          >
            {{ vs.unit }}
          </span>
        </div>

        <!-- Barra visual de zonas -->
        <div class="px-4 pt-3 pb-1">
          <div class="flex h-2.5 rounded-full overflow-hidden gap-px">
            <div class="bg-red-400 flex-1" title="Crítico bajo"></div>
            <div
              class="bg-orange-300 flex-[1.5]"
              title="Advertencia baja"
            ></div>
            <div class="bg-green-400 flex-[3]" title="Zona normal"></div>
            <template v-if="!vs.noHighAlerts">
              <div
                class="bg-orange-300 flex-[1.5]"
                title="Advertencia alta"
              ></div>
              <div class="bg-red-400 flex-1" title="Crítico alto"></div>
            </template>
          </div>
          <p class="text-xs text-gray-500 mt-1.5 font-mono truncate">
            {{ getZoneLabel(vs.key) }}
          </p>
        </div>

        <!-- Inputs de umbrales -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 p-4">
          <template v-for="field in THRESHOLD_FIELDS" :key="field.key">
            <!-- Input normal -->
            <div
              v-if="
                !vs.noHighAlerts ||
                !['warnHigh', 'critHigh'].includes(field.key)
              "
            >
              <label
                class="flex items-center gap-1.5 text-xs font-medium mb-1"
                :class="field.textClass"
              >
                <span
                  :class="`w-2 h-2 rounded-full shrink-0 ${field.dot}`"
                ></span>
                {{ field.label }}
              </label>
              <InputNumber
                v-model="form[vs.key][field.key]"
                :min="vs.min"
                :max="vs.max"
                :step="vs.step"
                :minFractionDigits="vs.decimals"
                :maxFractionDigits="vs.decimals"
                :suffix="` ${vs.unit}`"
                showButtons
                buttonLayout="horizontal"
                fluid
              />
            </div>

            <!-- "No aplica" para saturación O₂ (sin alertas altas) -->
            <div
              v-else
              class="flex items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 min-h-[56px]"
            >
              <span class="text-xs text-gray-400 italic">No aplica</span>
            </div>
          </template>
        </div>
      </div>

      <!-- ── Botones de acción ──────────────────────────── -->
      <div
        class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2"
      >
        <p class="text-xs text-gray-400">
          <i class="pi pi-info-circle mr-1"></i>
          Valores por defecto basados en guías OMS / JNC — Atención primaria
        </p>
        <div class="flex gap-2 shrink-0">
          <Button
            label="Restablecer"
            icon="pi pi-refresh"
            severity="secondary"
            outlined
            :loading="saving"
            @click="resetToDefaults"
          />
          <Button
            label="Guardar cambios"
            icon="pi pi-check"
            :loading="saving"
            @click="save"
          />
        </div>
      </div>
    </div>
  </div>
</template>
