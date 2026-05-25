<template>
  <Dialog
    v-model:visible="visible"
    modal
    :closable="true"
    :style="{ width: '26rem' }"
    :breakpoints="{ '640px': '95vw' }"
    :pt="{
      header: { class: 'hidden' },
      content: { class: 'p-0 overflow-hidden rounded-2xl' },
    }"
  >
    <div class="voucher-wrap select-none" ref="voucherEl">

      <!-- Header / Banner -->
      <div
        class="relative overflow-hidden px-5 pt-5 pb-6"
        :style="{ background: headerGradient }"
      >
        <!-- Decorative circles -->
        <div class="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10 bg-white" />
        <div class="absolute -bottom-10 -left-6 w-24 h-24 rounded-full opacity-10 bg-white" />

        <div class="relative z-10 flex items-start justify-between">
          <div>
            <div class="flex items-center gap-1.5 mb-0.5">
              <img src="/img/empresa/SIGMED-PA_icono_claro.svg" class="w-4 h-4" alt="" />
              <p class="text-white/70 text-[10px] font-semibold uppercase tracking-widest">SIGMED-PA</p>
            </div>
            <h2 class="text-white text-lg font-extrabold leading-tight mt-0.5">
              Comprobante de Cita
            </h2>
          </div>
          <span
            class="text-[11px] font-bold px-3 py-1 rounded-full border border-white/30 text-white/90 backdrop-blur-sm bg-white/10"
          >
            {{ appointment?.state ?? '—' }}
          </span>
        </div>

        <!-- Service name -->
        <div class="relative z-10 mt-4">
          <p class="text-white/60 text-[10px] uppercase tracking-wide">Servicio</p>
          <p class="text-white font-bold text-base leading-tight">
            {{ appointment?.services?.[0]?.name ?? '—' }}
          </p>
          <p class="text-white/60 text-[11px] mt-0.5">
            {{ appointment?.services?.[0]?.category ?? '' }}
          </p>
        </div>

        <!-- Zigzag notch bottom -->
        <svg class="absolute bottom-0 left-0 w-full" viewBox="0 0 400 16" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,16 L0,8 Q10,0 20,8 Q30,16 40,8 Q50,0 60,8 Q70,16 80,8 Q90,0 100,8 Q110,16 120,8 Q130,0 140,8 Q150,16 160,8 Q170,0 180,8 Q190,16 200,8 Q210,0 220,8 Q230,16 240,8 Q250,0 260,8 Q270,16 280,8 Q290,0 300,8 Q310,16 320,8 Q330,0 340,8 Q350,16 360,8 Q370,0 380,8 Q390,16 400,8 L400,16 Z" fill="white"/>
        </svg>
      </div>

      <!-- Body -->
      <div class="bg-white px-5 pb-0 pt-4 space-y-4">

        <!-- Date / Time -->
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-gray-50 rounded-xl px-3 py-2.5">
            <p class="text-[9px] text-gray-400 uppercase font-semibold tracking-wide mb-1">Fecha</p>
            <div class="flex items-center gap-1.5">
              <i class="pi pi-calendar text-xs" :style="{ color: accentColor }" />
              <p class="text-sm font-bold text-gray-800">{{ formattedDate }}</p>
            </div>
          </div>
          <div class="bg-gray-50 rounded-xl px-3 py-2.5">
            <p class="text-[9px] text-gray-400 uppercase font-semibold tracking-wide mb-1">Hora</p>
            <div class="flex items-center gap-1.5">
              <i class="pi pi-clock text-xs" :style="{ color: accentColor }" />
              <p class="text-sm font-bold text-gray-800">{{ appointment?.time ?? '—' }} hrs.</p>
            </div>
          </div>
        </div>

        <!-- Doctor + Health center -->
        <div class="space-y-2">
          <div v-if="appointment?.doctor" class="flex items-center gap-2.5 bg-gray-50 rounded-xl px-3 py-2.5">
            <div class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ background: accentLight }">
              <i class="pi pi-user text-xs" :style="{ color: accentColor }" />
            </div>
            <div class="min-w-0">
              <p class="text-xs font-semibold text-gray-800 truncate">{{ appointment.doctor.name }}</p>
              <p class="text-[10px] text-gray-400 truncate">{{ appointment.doctor.specialty }}</p>
            </div>
          </div>
          <div v-if="appointment?.health?.name" class="flex items-center gap-2.5 bg-gray-50 rounded-xl px-3 py-2.5">
            <div class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ background: accentLight }">
              <i class="pi pi-building text-xs" :style="{ color: accentColor }" />
            </div>
            <p class="text-xs font-semibold text-gray-800 truncate">{{ appointment.health.name }}</p>
          </div>
        </div>

        <!-- Dashed separator -->
        <div class="flex items-center gap-2">
          <div class="flex-1 border-t border-dashed border-gray-200" />
          <div class="w-4 h-4 rounded-full border border-dashed border-gray-300 flex items-center justify-center">
            <div class="w-1.5 h-1.5 rounded-full bg-gray-200" />
          </div>
          <div class="flex-1 border-t border-dashed border-gray-200" />
        </div>

        <!-- QR + Code -->
        <div class="flex items-center justify-between gap-4 pb-5">
          <div class="flex flex-col gap-1.5">
            <p class="text-[9px] text-gray-400 uppercase font-semibold tracking-wide">Código de verificación</p>
            <p class="font-mono text-xs font-bold text-gray-700 tracking-widest">SIGMED-{{ shortId }}</p>
            <p class="text-[9px] text-gray-400 leading-snug max-w-[140px]">
              Muestra el QR al personal al momento de tu cita
            </p>
          </div>
          <div class="flex-shrink-0">
            <div v-if="qrLoading" class="w-20 h-20 bg-gray-100 rounded-xl animate-pulse flex items-center justify-center">
              <i class="pi pi-spin pi-spinner text-gray-300" />
            </div>
            <img
              v-else-if="qrDataUrl"
              :src="qrDataUrl"
              alt="QR de verificación"
              class="w-20 h-20 rounded-xl border border-gray-100"
            />
          </div>
        </div>
      </div>

      <!-- Patient strip (bottom) -->
      <div class="relative overflow-hidden" :style="{ background: headerGradient }">
        <!-- Zigzag top -->
        <svg class="w-full -mt-px" viewBox="0 0 400 16" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="transform: scaleY(-1)">
          <path d="M0,16 L0,8 Q10,0 20,8 Q30,16 40,8 Q50,0 60,8 Q70,16 80,8 Q90,0 100,8 Q110,16 120,8 Q130,0 140,8 Q150,16 160,8 Q170,0 180,8 Q190,16 200,8 Q210,0 220,8 Q230,16 240,8 Q250,0 260,8 Q270,16 280,8 Q290,0 300,8 Q310,16 320,8 Q330,0 340,8 Q350,16 360,8 Q370,0 380,8 Q390,16 400,8 L400,16 Z" fill="white"/>
        </svg>
        <div class="px-5 pt-0 pb-4 flex items-center justify-between">
          <div>
            <p class="text-white/60 text-[9px] uppercase tracking-wide">Paciente</p>
            <p class="text-white text-xs font-bold truncate max-w-[180px]">{{ patientName }}</p>
            <p v-if="susCode" class="text-white/60 text-[9px] mt-0.5">SUS: {{ susCode }}</p>
          </div>
          <div class="text-right">
            <p class="text-white/60 text-[9px] uppercase tracking-wide">Centro</p>
            <p class="text-white text-[10px] font-semibold truncate max-w-[110px]">
              {{ appointment?.health?.name ?? '—' }}
            </p>
          </div>
        </div>
      </div>

    </div>

    <!-- Footer buttons -->
    <div class="bg-white border-t border-gray-100 px-4 py-3 flex gap-2 justify-end rounded-b-2xl">
      <Button label="Cerrar" severity="secondary" outlined size="small" @click="visible = false" />
    </div>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import { displayDate } from "@/helpers/date";
import QRCode from "qrcode";

const props = defineProps({
  appointment: { type: Object, default: null },
});

const visible = defineModel("visible", { default: false });

const qrDataUrl = ref("");
const qrLoading = ref(false);

const STATE_GRADIENTS = {
  Pendiente:    "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
  Reprogramada: "linear-gradient(135deg, #1e3a5f 0%, #7c3aed 100%)",
  Cancelada:    "linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)",
  Completada:   "linear-gradient(135deg, #064e3b 0%, #059669 100%)",
  "No asistio": "linear-gradient(135deg, #1f2937 0%, #6b7280 100%)",
};
const STATE_ACCENT = {
  Pendiente:    "#2563eb",
  Reprogramada: "#7c3aed",
  Cancelada:    "#dc2626",
  Completada:   "#059669",
  "No asistio": "#6b7280",
};
const STATE_ACCENT_LIGHT = {
  Pendiente:    "#eff6ff",
  Reprogramada: "#f5f3ff",
  Cancelada:    "#fef2f2",
  Completada:   "#ecfdf5",
  "No asistio": "#f9fafb",
};

const headerGradient = computed(
  () => STATE_GRADIENTS[props.appointment?.state] ?? STATE_GRADIENTS.Pendiente
);
const accentColor = computed(
  () => STATE_ACCENT[props.appointment?.state] ?? STATE_ACCENT.Pendiente
);
const accentLight = computed(
  () => STATE_ACCENT_LIGHT[props.appointment?.state] ?? STATE_ACCENT_LIGHT.Pendiente
);

const formattedDate = computed(() => {
  if (!props.appointment?.date) return "—";
  return displayDate(props.appointment.date);
});

const patientName = computed(() => {
  const src = props.appointment?.patient ?? props.appointment?.user;
  if (!src) return "—";
  return [src.primerApellido, src.segundoApellido, src.nombres]
    .filter(Boolean)
    .join(" ");
});

const susCode = computed(
  () => props.appointment?.patient?.susCode ?? props.appointment?.user?.susCode ?? null
);

const shortId = computed(
  () => props.appointment?._id?.slice(-8).toUpperCase() ?? "—"
);

const generateQR = async () => {
  if (!props.appointment?._id) return;
  qrLoading.value = true;
  try {
    qrDataUrl.value = await QRCode.toDataURL(
      `SIGMED-PA-${props.appointment._id}`,
      { width: 160, margin: 1, color: { dark: "#1e3a5f", light: "#ffffff" } }
    );
  } catch (e) {
    console.error("Error generando QR:", e);
  } finally {
    qrLoading.value = false;
  }
};

watch(
  () => [visible.value, props.appointment?._id],
  ([isVisible]) => {
    if (isVisible && props.appointment?._id) generateQR();
  },
  { immediate: true }
);
</script>
