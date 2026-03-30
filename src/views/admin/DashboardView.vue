<template>
  <div class="p-3 sm:p-5 space-y-5">

    <!-- Encabezado + controles -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-3">
      <div>
        <h2 class="text-xl font-bold text-gray-800">Dashboard</h2>
        <p class="text-sm text-gray-400">
          Resumen del sistema —
          <span class="capitalize">{{ rangeLabel }}</span>
        </p>
      </div>
      <div class="flex gap-2 sm:ml-auto flex-wrap items-center">
        <SelectButton
          v-model="range"
          :options="rangeOptions"
          optionLabel="label"
          optionValue="value"
          :allowEmpty="false"
          class="text-sm"
        />
        <Select
          v-if="isAdmin"
          v-model="selectedHealth"
          :options="healthSelectOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Todos los centros"
          showClear
          class="w-52 text-sm"
          @change="load"
        />
        <Button
          icon="pi pi-refresh"
          severity="secondary"
          outlined
          rounded
          size="small"
          :loading="loading"
          v-tooltip.top="'Actualizar'"
          @click="load"
        />
      </div>
    </div>

    <!-- KPI Cards -->
    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <div v-for="i in 5" :key="i" class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-3">
        <Skeleton width="40%" height="0.75rem" />
        <Skeleton width="60%" height="1.8rem" />
        <Skeleton width="80%" height="0.65rem" />
      </div>
    </div>

    <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <KpiCard
        icon="pi-calendar-clock"
        icon-color="bg-blue-100 text-blue-600"
        :value="stats.kpis.citasHoy"
        label="Citas hoy"
        sub="del día en curso"
      />
      <KpiCard
        icon="pi-calendar"
        icon-color="bg-indigo-100 text-indigo-600"
        :value="stats.kpis.citasRango"
        :label="'Citas · ' + rangeLabel"
        sub="en el período"
      />
      <KpiCard
        icon="pi-users"
        icon-color="bg-teal-100 text-teal-600"
        :value="stats.kpis.pacientes"
        label="Pacientes"
        sub="registrados"
      />
      <KpiCard
        icon="pi-user"
        icon-color="bg-purple-100 text-purple-600"
        :value="stats.kpis.medicosActivos"
        label="Médicos activos"
        sub="disponibles"
      />
      <!-- Tasa de asistencia -->
      <div class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col gap-1">
        <div class="flex items-center gap-2">
          <span class="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
            :class="tasaColor.bg">
            <i class="pi pi-chart-line" :class="tasaColor.text"></i>
          </span>
          <span class="text-xs text-gray-400 leading-tight">Tasa de asistencia</span>
        </div>
        <p class="text-2xl font-bold" :class="tasaColor.text">
          {{ stats.kpis.tasaAsistencia !== null ? stats.kpis.tasaAsistencia + '%' : '—' }}
        </p>
        <p class="text-xs text-gray-400">
          {{ stats.kpis.completadas }} completadas /
          {{ stats.kpis.completadas + stats.kpis.noAsistio }} realizadas
        </p>
      </div>
    </div>

    <!-- Gráficos fila 1 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

      <!-- Donut: citas por estado -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p class="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
          <i class="pi pi-chart-pie text-indigo-400"></i> Distribución por estado
        </p>
        <div v-if="loading" class="flex justify-center py-8">
          <Skeleton shape="circle" size="10rem" />
        </div>
        <div v-else-if="donutData.datasets[0].data.every(v => v === 0)"
          class="flex flex-col items-center justify-center py-10 text-gray-300 gap-2">
          <i class="pi pi-chart-pie text-4xl"></i>
          <p class="text-sm">Sin citas en este período</p>
        </div>
        <Chart v-else type="doughnut" :data="donutData" :options="donutOptions" class="max-h-64 mx-auto" />
      </div>

      <!-- Line: tendencia -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p class="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
          <i class="pi pi-chart-line text-blue-400"></i> Tendencia de citas
          <span class="ml-auto text-xs text-gray-400 font-normal">{{ trendLabel }}</span>
        </p>
        <div v-if="loading" class="space-y-2 py-4">
          <Skeleton v-for="i in 4" :key="i" width="100%" height="0.6rem" />
        </div>
        <Chart v-else type="line" :data="lineData" :options="lineOptions" class="max-h-64" />
      </div>
    </div>

    <!-- Gráficos fila 2 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

      <!-- Bar horizontal: especialidades -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p class="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
          <i class="pi pi-th-large text-purple-400"></i> Citas por especialidad
        </p>
        <div v-if="loading" class="space-y-2 py-4">
          <Skeleton v-for="i in 5" :key="i" width="100%" height="0.8rem" />
        </div>
        <div v-else-if="!stats.citasPorEspecialidad?.length"
          class="flex flex-col items-center justify-center py-10 text-gray-300 gap-2">
          <i class="pi pi-th-large text-4xl"></i>
          <p class="text-sm">Sin datos de especialidades</p>
        </div>
        <Chart v-else type="bar" :data="barData" :options="barOptions" class="max-h-72" />
      </div>

      <!-- Top médicos -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p class="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
          <i class="pi pi-star text-amber-400"></i> Top 5 médicos
        </p>
        <div v-if="loading" class="space-y-3">
          <div v-for="i in 5" :key="i" class="flex items-center gap-3">
            <Skeleton shape="circle" size="2rem" />
            <div class="flex-1 space-y-1">
              <Skeleton width="70%" height="0.75rem" />
              <Skeleton width="45%" height="0.6rem" />
            </div>
            <Skeleton width="2rem" height="1.4rem" borderRadius="1rem" />
          </div>
        </div>
        <div v-else-if="!stats.topMedicos?.length"
          class="flex flex-col items-center justify-center py-10 text-gray-300 gap-2">
          <i class="pi pi-star text-4xl"></i>
          <p class="text-sm">Sin datos de médicos</p>
        </div>
        <ul v-else class="space-y-2">
          <li
            v-for="(doc, idx) in stats.topMedicos"
            :key="idx"
            class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition"
          >
            <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              :class="rankClass(idx)">
              {{ idx + 1 }}
            </span>
            <Avatar
              :label="getInitials(doc.name)"
              shape="circle"
              size="normal"
              class="shrink-0 text-xs font-semibold"
              :class="avatarClass(idx)"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-800 truncate">{{ doc.name }}</p>
              <p class="text-xs text-gray-400 truncate">{{ doc.specialty }}</p>
            </div>
            <Tag :value="doc.count + ' citas'" severity="secondary" class="text-xs shrink-0" />
          </li>
        </ul>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { storeToRefs } from "pinia";
import Chart from "primevue/chart";
import Button from "primevue/button";
import Skeleton from "primevue/skeleton";
import Tag from "primevue/tag";
import Avatar from "primevue/avatar";
import Select from "primevue/select";
import SelectButton from "primevue/selectbutton";
import { useUserStore } from "@/stores/user";
import { useHealthStore } from "@/stores/healths";
import { getDashboardStats } from "@/api/dashboardApi";

// Sub-componente KpiCard inline
const KpiCard = {
  props: { icon: String, iconColor: String, value: [Number, String], label: String, sub: String },
  template: `
    <div class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col gap-1">
      <div class="flex items-center gap-2">
        <span class="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0" :class="iconColor">
          <i class="pi" :class="icon"></i>
        </span>
        <span class="text-xs text-gray-400 leading-tight">{{ label }}</span>
      </div>
      <p class="text-2xl font-bold text-gray-800">{{ value ?? 0 }}</p>
      <p class="text-xs text-gray-400">{{ sub }}</p>
    </div>
  `,
};

// Stores
const userStore = useUserStore();
const healthStore = useHealthStore();
const { user } = storeToRefs(userStore);
const { healths } = storeToRefs(healthStore);

const isAdmin = computed(() => user.value?.admin === true);

const healthSelectOptions = computed(() =>
  (healths.value ?? []).map((h) => ({ label: h.label, value: h.id }))
);

// Estado
const range = ref("month");
const selectedHealth = ref(null);
const loading = ref(false);
const stats = ref({
  kpis: { citasHoy: 0, citasRango: 0, pacientes: 0, medicosActivos: 0, tasaAsistencia: null, completadas: 0, noAsistio: 0 },
  citasPorEstado: [],
  tendenciaPorDia: [],
  citasPorEspecialidad: [],
  topMedicos: [],
});

const rangeOptions = [
  { label: "Hoy", value: "today" },
  { label: "Semana", value: "week" },
  { label: "Mes", value: "month" },
];

const rangeLabel = computed(() => {
  if (range.value === "today") return "hoy";
  if (range.value === "week") return "esta semana";
  return "este mes";
});

const trendLabel = computed(() => {
  if (range.value === "today") return "Horas del día";
  if (range.value === "week") return "Últimos 7 días";
  return "Últimos 30 días";
});

// Carga de datos
const load = async () => {
  loading.value = true;
  try {
    const params = { range: range.value };
    if (isAdmin.value && selectedHealth.value) params.health = selectedHealth.value;
    stats.value = await getDashboardStats(params);
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

watch(range, load);

onMounted(async () => {
  await userStore.getUser();
  if (isAdmin.value) await healthStore.getHealths();
  await load();
});

// ─── Colores del estado ────────────────────────────────
const STATE_COLORS = {
  Pendiente:    "#F59E0B",
  Completada:   "#10B981",
  Cancelada:    "#EF4444",
  Reprogramada: "#3B82F6",
  "No asistio": "#8B5CF6",
};
const STATE_ORDER = ["Pendiente", "Completada", "Cancelada", "Reprogramada", "No asistio"];

// ─── Tasa de asistencia color ──────────────────────────
const tasaColor = computed(() => {
  const t = stats.value.kpis.tasaAsistencia;
  if (t === null) return { bg: "bg-gray-100", text: "text-gray-400" };
  if (t >= 80)   return { bg: "bg-green-100", text: "text-green-600" };
  if (t >= 60)   return { bg: "bg-amber-100", text: "text-amber-500" };
  return { bg: "bg-red-100", text: "text-red-500" };
});

// ─── Donut chart ───────────────────────────────────────
const donutData = computed(() => {
  const map = {};
  for (const e of stats.value.citasPorEstado ?? []) map[e._id] = e.count;
  return {
    labels: STATE_ORDER,
    datasets: [{
      data: STATE_ORDER.map((s) => map[s] ?? 0),
      backgroundColor: STATE_ORDER.map((s) => STATE_COLORS[s]),
      hoverOffset: 6,
      borderWidth: 2,
      borderColor: "#fff",
    }],
  };
});

const donutOptions = {
  plugins: {
    legend: {
      position: "bottom",
      labels: { font: { size: 11 }, padding: 14, usePointStyle: true },
    },
  },
  cutout: "65%",
};

// ─── Line chart ────────────────────────────────────────
function buildDateRange(days) {
  const result = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    result.push(d.toISOString().slice(0, 10));
  }
  return result;
}

const lineData = computed(() => {
  const days = range.value === "today" ? 1 : range.value === "week" ? 7 : 30;
  const dates = buildDateRange(days);
  const map = {};
  for (const e of stats.value.tendenciaPorDia ?? []) map[e._id] = e.count;

  const labels = dates.map((d) => {
    const dt = new Date(d + "T12:00:00");
    return dt.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
  });

  return {
    labels,
    datasets: [{
      label: "Citas",
      data: dates.map((d) => map[d] ?? 0),
      borderColor: "#6366F1",
      backgroundColor: "rgba(99, 102, 241, 0.08)",
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointHoverRadius: 5,
    }],
  };
});

const lineOptions = {
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 } }, grid: { color: "#F3F4F6" } },
    x: { ticks: { font: { size: 10 } }, grid: { display: false } },
  },
};

// ─── Bar horizontal chart ──────────────────────────────
const BAR_PALETTE = [
  "#6366F1", "#8B5CF6", "#EC4899", "#14B8A6",
  "#F59E0B", "#10B981", "#3B82F6", "#EF4444",
];

const barData = computed(() => {
  const items = stats.value.citasPorEspecialidad ?? [];
  return {
    labels: items.map((e) => e._id ?? "Sin especialidad"),
    datasets: [{
      label: "Citas",
      data: items.map((e) => e.count),
      backgroundColor: items.map((_, i) => BAR_PALETTE[i % BAR_PALETTE.length]),
      borderRadius: 4,
    }],
  };
});

const barOptions = {
  indexAxis: "y",
  plugins: { legend: { display: false } },
  scales: {
    x: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 } }, grid: { color: "#F3F4F6" } },
    y: { ticks: { font: { size: 11 } }, grid: { display: false } },
  },
};

// ─── Helpers de UI ─────────────────────────────────────
function getInitials(name = "") {
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function rankClass(i) {
  const c = ["bg-amber-100 text-amber-600", "bg-gray-100 text-gray-500", "bg-orange-100 text-orange-500"];
  return c[i] ?? "bg-indigo-50 text-indigo-400";
}

function avatarClass(i) {
  const c = [
    "bg-indigo-100 text-indigo-700",
    "bg-teal-100 text-teal-700",
    "bg-purple-100 text-purple-700",
    "bg-blue-100 text-blue-700",
    "bg-pink-100 text-pink-700",
  ];
  return c[i % c.length];
}
</script>