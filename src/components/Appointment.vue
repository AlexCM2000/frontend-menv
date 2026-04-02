<template>
  <div
    class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden
           cursor-pointer active:scale-[0.98] transition-all duration-150 select-none"
    @click="$emit('open')"
  >
    <!-- Barra de color según estado -->
    <div class="h-1" :style="{ backgroundColor: stateColor }"></div>

    <div class="p-4 flex items-center gap-3">
      <!-- Bloque de fecha con color de estado -->
      <div
        class="shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-xl text-white"
        :style="{ backgroundColor: stateColor }"
      >
        <span class="text-[10px] font-bold leading-none uppercase tracking-wide">{{ dayName }}</span>
        <span class="text-xl font-black leading-tight">{{ dayNumber }}</span>
      </div>

      <!-- Info principal -->
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2">
          <p class="text-sm font-bold text-gray-800 leading-snug truncate">
            {{ appointment.services?.[0]?.name ?? 'Cita médica' }}
          </p>
          <span
            class="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold text-white whitespace-nowrap"
            :style="{ backgroundColor: stateColor }"
          >
            {{ appointment.state }}
          </span>
        </div>

        <p class="text-xs text-gray-500 mt-0.5">
          {{ monthYear }} · {{ appointment.time }} hrs.
        </p>

        <p v-if="appointment.doctor" class="text-xs text-gray-400 mt-0.5 truncate">
          <i class="pi pi-user text-[10px] mr-1"></i>{{ appointment.doctor.name }}
        </p>
      </div>

      <!-- Chevron indicador de detalle -->
      <i class="pi pi-chevron-right text-gray-300 text-xs shrink-0"></i>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

defineEmits(['open'])

const props = defineProps({
  appointment: { type: Object }
})

const STATE_COLORS = {
  'Pendiente':    '#3B82F6',
  'Reprogramada': '#F97316',
  'Cancelada':    '#EF4444',
  'Completada':   '#22C55E',
  'No asistio':   '#6B7280',
}

const stateColor = computed(() => STATE_COLORS[props.appointment?.state] ?? '#6B7280')

const dateObj = computed(() => {
  if (!props.appointment?.date) return null
  return new Date(props.appointment.date)
})

const dayNumber = computed(() => {
  if (!dateObj.value) return ''
  return dateObj.value.getUTCDate()
})

const dayName = computed(() => {
  if (!dateObj.value) return ''
  return dateObj.value.toLocaleDateString('es-ES', { weekday: 'short', timeZone: 'UTC' })
    .replace('.', '')
})

const monthYear = computed(() => {
  if (!dateObj.value) return ''
  return dateObj.value.toLocaleDateString('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' })
})
</script>