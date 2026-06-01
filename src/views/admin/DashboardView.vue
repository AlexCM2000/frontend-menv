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

    <!-- DatePicker rango personalizado (fila independiente) -->
    <div v-if="range === 'custom'" class="flex justify-end">
      <DatePicker
        v-model="customDateRange"
        selectionMode="range"
        :manualInput="false"
        showButtonBar
        showIcon
        dateFormat="dd/mm/yy"
        placeholder="Fecha inicio – Fecha fin"
        class="w-full sm:w-72 text-sm"
      />
    </div>

    <!-- KPI Cards -->
    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <div v-for="i in 5" :key="i" class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-3">
        <Skeleton width="40%" height="0.75rem" />
        <Skeleton width="60%" height="1.8rem" />
        <Skeleton width="80%" height="0.65rem" />
      </div>
    </div>

    <div v-else :class="isDoctor ? 'grid grid-cols-2 sm:grid-cols-2 gap-3' : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3'">
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
      <!-- Solo admin/branchManager -->
      <KpiCard
        v-if="!isDoctor"
        icon="pi-users"
        icon-color="bg-teal-100 text-teal-600"
        :value="stats.kpis.pacientes"
        label="Pacientes"
        sub="registrados"
      />
      <KpiCard
        v-if="!isDoctor"
        icon="pi-user"
        icon-color="bg-purple-100 text-purple-600"
        :value="stats.kpis.medicosActivos"
        label="Médicos activos"
        sub="disponibles"
      />
      <!-- Tasa de asistencia (solo admin/branchManager) -->
      <div v-if="!isDoctor" class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col gap-1">
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

      <!-- Top médicos (solo admin/branchManager) -->
      <div v-if="!isDoctor" class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
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

    <!-- Alertas de stock bajo mínimo -->
    <div
      v-if="canSeeStock && stats.stockAlerts?.length"
      class="bg-white rounded-xl border border-orange-200 shadow-sm overflow-hidden"
    >
      <div class="flex items-center gap-2.5 px-5 py-3.5 border-b border-orange-100 bg-orange-50">
        <i class="pi pi-exclamation-triangle text-orange-500 text-sm"></i>
        <h3 class="text-sm font-semibold text-orange-800">Alertas de stock bajo mínimo</h3>
        <span class="text-xs font-semibold bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full">
          {{ stats.stockAlerts.length }}
        </span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-orange-50/50 border-b border-orange-100">
              <th class="text-left px-4 py-2.5 text-[10px] font-semibold text-orange-700 uppercase tracking-wide">Medicamento</th>
              <th class="text-left px-4 py-2.5 text-[10px] font-semibold text-orange-700 uppercase tracking-wide hidden sm:table-cell">Categoría</th>
              <th class="text-center px-4 py-2.5 text-[10px] font-semibold text-orange-700 uppercase tracking-wide">Disponible</th>
              <th class="text-center px-4 py-2.5 text-[10px] font-semibold text-orange-700 uppercase tracking-wide">Mínimo</th>
              <th class="text-left px-4 py-2.5 text-[10px] font-semibold text-orange-700 uppercase tracking-wide hidden md:table-cell" v-if="isAdmin">Centro</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-orange-50">
            <tr v-for="med in stats.stockAlerts" :key="med._id" class="hover:bg-orange-50/30 transition-colors">
              <td class="px-4 py-2.5 font-semibold text-gray-800">{{ med.name }}</td>
              <td class="px-4 py-2.5 text-xs text-gray-500 hidden sm:table-cell capitalize">{{ med.category }}</td>
              <td class="px-4 py-2.5 text-center">
                <span class="font-bold" :class="med.availableQuantity === 0 ? 'text-red-600' : 'text-orange-600'">
                  {{ med.availableQuantity }} {{ med.unit }}
                </span>
              </td>
              <td class="px-4 py-2.5 text-center text-xs text-gray-400">{{ med.minimumQuantity }} {{ med.unit }}</td>
              <td class="px-4 py-2.5 text-xs text-gray-400 hidden md:table-cell" v-if="isAdmin">{{ med.health?.name ?? '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="px-5 py-2.5 bg-orange-50/30 border-t border-orange-100">
        <router-link :to="{ name: 'admin-stock' }" class="text-xs text-orange-700 font-semibold hover:underline flex items-center gap-1">
          <i class="pi pi-arrow-right text-[10px]"></i> Gestionar stock
        </router-link>
      </div>
    </div>

    <!-- Alertas de vencimientos próximos (5 días o ya vencidos) -->
    <div
      v-if="canSeeStock && stats.expirationAlerts?.length"
      class="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden"
    >
      <div class="flex items-center gap-2.5 px-5 py-3.5 border-b border-red-100 bg-red-50">
        <i class="pi pi-calendar-times text-red-500 text-sm"></i>
        <h3 class="text-sm font-semibold text-red-800">Medicamentos próximos a vencer</h3>
        <span class="text-xs font-semibold bg-red-200 text-red-800 px-2 py-0.5 rounded-full">
          {{ stats.expirationAlerts.length }}
        </span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-red-50/50 border-b border-red-100">
              <th class="text-left px-4 py-2.5 text-[10px] font-semibold text-red-700 uppercase tracking-wide">Medicamento</th>
              <th class="text-left px-4 py-2.5 text-[10px] font-semibold text-red-700 uppercase tracking-wide hidden sm:table-cell">Categoría</th>
              <th class="text-center px-4 py-2.5 text-[10px] font-semibold text-red-700 uppercase tracking-wide">Vence</th>
              <th class="text-center px-4 py-2.5 text-[10px] font-semibold text-red-700 uppercase tracking-wide hidden sm:table-cell">Estado</th>
              <th class="text-left px-4 py-2.5 text-[10px] font-semibold text-red-700 uppercase tracking-wide hidden md:table-cell" v-if="isAdmin">Centro</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-red-50">
            <tr v-for="med in stats.expirationAlerts" :key="med._id" class="hover:bg-red-50/30 transition-colors">
              <td class="px-4 py-2.5 font-semibold text-gray-800">{{ med.name }}</td>
              <td class="px-4 py-2.5 text-xs text-gray-500 hidden sm:table-cell capitalize">{{ med.category }}</td>
              <td class="px-4 py-2.5 text-center text-sm font-medium" :class="isPast(new Date(med.expirationDate)) ? 'text-red-700' : 'text-amber-700'">
                {{ format(new Date(med.expirationDate), 'dd/MM/yyyy', { locale: es }) }}
              </td>
              <td class="px-4 py-2.5 text-center hidden sm:table-cell">
                <Tag
                  v-if="isPast(new Date(med.expirationDate))"
                  value="VENCIDO"
                  severity="danger"
                  class="text-xs"
                />
                <Tag
                  v-else
                  :value="`${differenceInDays(new Date(med.expirationDate), new Date())} días`"
                  severity="warn"
                  class="text-xs"
                />
              </td>
              <td class="px-4 py-2.5 text-xs text-gray-400 hidden md:table-cell" v-if="isAdmin">{{ med.health?.name ?? '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="px-5 py-2.5 bg-red-50/30 border-t border-red-100">
        <router-link :to="{ name: 'admin-stock' }" class="text-xs text-red-700 font-semibold hover:underline flex items-center gap-1">
          <i class="pi pi-arrow-right text-[10px]"></i> Gestionar stock
        </router-link>
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
import DatePicker from "primevue/datepicker";
import { format, isPast, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { useUserStore } from "@/stores/user";
import { useHealthStore } from "@/stores/healths";
import { getDashboardStats } from "@/api/dashboardApi";
import KpiCard from "@/components/KpiCard.vue";

// Stores
const userStore = useUserStore();
const healthStore = useHealthStore();
const { user } = storeToRefs(userStore);
const { healths } = storeToRefs(healthStore);

const isAdmin       = computed(() => user.value?.admin === true);
const isBranchMgr   = computed(() => user.value?.branchManager === true);
const isDoctor      = computed(() => user.value?.doctor === true && !user.value?.admin && !user.value?.branchManager);
const isPharmacist  = computed(() => user.value?.pharmacist === true);
const canSeeStock   = computed(() => isAdmin.value || isBranchMgr.value || isPharmacist.value);

const healthSelectOptions = computed(() =>
  (healths.value ?? []).map((h) => ({ label: h.label, value: h.id }))
);

// Estado
const range = ref("month");
const customDateRange = ref(null);
const selectedHealth = ref(null);
const loading = ref(false);
const stats = ref({
  kpis: { citasHoy: 0, citasRango: 0, pacientes: 0, medicosActivos: 0, tasaAsistencia: null, completadas: 0, noAsistio: 0 },
  citasPorEstado: [],
  tendenciaPorDia: [],
  citasPorEspecialidad: [],
  topMedicos: [],
  stockAlerts: [],
  expirationAlerts: [],
});

const rangeOptions = [
  { label: "Hoy", value: "today" },
  { label: "Semana", value: "week" },
  { label: "Mes", value: "month" },
  { label: "Personalizado", value: "custom" },
];

const rangeLabel = computed(() => {
  if (range.value === "today") return "hoy";
  if (range.value === "week") return "esta semana";
  if (range.value === "custom") {
    const [from, to] = customDateRange.value ?? [];
    if (from && to) {
      const fmt = (d) => d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
      return `${fmt(from)} – ${fmt(to)}`;
    }
    return "rango personalizado";
  }
  return "este mes";
});

const trendLabel = computed(() => {
  if (range.value === "today") return "Horas del día";
  if (range.value === "week") return "Últimos 7 días";
  if (range.value === "custom") return "Rango seleccionado";
  return "Últimos 30 días";
});

// Carga de datos
const load = async () => {
  if (range.value === "custom" && !(customDateRange.value?.[0] && customDateRange.value?.[1])) return;
  loading.value = true;
  try {
    const params = { range: range.value };
    if (isAdmin.value && selectedHealth.value) params.health = selectedHealth.value;
    if (range.value === "custom" && customDateRange.value?.[0] && customDateRange.value?.[1]) {
      params.date_from = customDateRange.value[0].toISOString();
      params.date_to   = customDateRange.value[1].toISOString();
    }
    stats.value = await getDashboardStats(params);
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

watch(range, (val) => {
  if (val !== "custom") customDateRange.value = null;
  load();
});

watch(customDateRange, (val) => {
  if (val && val[0] && val[1]) load();
});

onMounted(async () => {
  await userStore.getUser();
  if (isAdmin.value) await healthStore.getHealths();
  await load();
});

// Colores del estado
const STATE_COLORS = {
  Pendiente:    "#F59E0B",
  Completada:   "#10B981",
  Cancelada:    "#EF4444",
  Reprogramada: "#3B82F6",
  "No asistio": "#8B5CF6",
};
const STATE_ORDER = ["Pendiente", "Completada", "Cancelada", "Reprogramada", "No asistio"];

// Tasa de asistencia — color según porcentaje
const tasaColor = computed(() => {
  const t = stats.value.kpis.tasaAsistencia;
  if (t === null) return { bg: "bg-gray-100", text: "text-gray-400" };
  if (t >= 80)   return { bg: "bg-green-100", text: "text-green-600" };
  if (t >= 60)   return { bg: "bg-amber-100", text: "text-amber-500" };
  return { bg: "bg-red-100", text: "text-red-500" };
});

// Gráfico donut de citas por estado
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

// Gráfico de líneas — citas por día
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

function buildCustomRange(from, to) {
  const result = [];
  const current = new Date(from);
  current.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(23, 59, 59, 999);
  while (current <= end) {
    result.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }
  return result;
}

const lineData = computed(() => {
  let dates;
  if (range.value === "custom" && customDateRange.value?.[0] && customDateRange.value?.[1]) {
    dates = buildCustomRange(customDateRange.value[0], customDateRange.value[1]);
  } else {
    const days = range.value === "today" ? 1 : range.value === "week" ? 7 : 30;
    dates = buildDateRange(days);
  }
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

// Gráfico de barras — citas por especialidad
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

// Helpers de UI
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