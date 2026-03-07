<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="modalTitle"
    :style="{ width: '28rem' }"
    :breakpoints="{ '640px': '95vw' }"
    :pt="{ header: { class: 'pb-2' } }"
  >
    <div class="space-y-4">
      <!-- Estado badge -->
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-500 font-medium">Estado</span>
        <span
          class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white"
          :style="{ backgroundColor: stateColor }"
        >
          {{ appointment?.state }}
        </span>
      </div>

      <hr class="border-gray-100" />

      <!-- Servicio -->
      <div class="flex flex-col gap-1">
        <span class="text-xs text-gray-400 uppercase tracking-wide font-semibold">Servicio</span>
        <p class="text-gray-800 font-semibold">{{ appointment?.services?.[0]?.category }}</p>
        <p class="text-gray-600 text-sm">{{ appointment?.services?.[0]?.name }}</p>
      </div>

      <!-- Fecha y hora -->
      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
          <span class="text-xs text-gray-400 uppercase tracking-wide font-semibold">Fecha</span>
          <div class="flex items-center gap-2">
            <i class="pi pi-calendar text-blue-500 text-sm"></i>
            <p class="text-gray-700 text-sm font-medium">{{ formattedDate }}</p>
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-xs text-gray-400 uppercase tracking-wide font-semibold">Hora</span>
          <div class="flex items-center gap-2">
            <i class="pi pi-clock text-blue-500 text-sm"></i>
            <p class="text-gray-700 text-sm font-medium">{{ appointment?.time }}</p>
          </div>
        </div>
      </div>

      <!-- Paciente -->
      <div v-if="appointment?.user?.name" class="flex flex-col gap-1">
        <span class="text-xs text-gray-400 uppercase tracking-wide font-semibold">Paciente</span>
        <div class="flex items-center gap-2">
          <i class="pi pi-user text-blue-500 text-sm"></i>
          <p class="text-gray-700 text-sm font-medium">{{ appointment?.user?.name }}</p>
        </div>
      </div>

      <!-- Centro médico -->
      <div v-if="appointment?.health?.name" class="flex flex-col gap-1">
        <span class="text-xs text-gray-400 uppercase tracking-wide font-semibold">Centro médico</span>
        <div class="flex items-center gap-2">
          <i class="pi pi-building text-blue-500 text-sm"></i>
          <p class="text-gray-700 text-sm font-medium">{{ appointment?.health?.name }}</p>
        </div>
      </div>

      <!-- Total -->
      <div v-if="appointment?.totalAmount" class="flex flex-col gap-1">
        <span class="text-xs text-gray-400 uppercase tracking-wide font-semibold">Total</span>
        <p class="text-gray-700 text-sm font-semibold">{{ formatCurrency(appointment.totalAmount) }}</p>
      </div>
    </div>

    <template #footer>
      <Button label="Cerrar" severity="secondary" @click="visible = false" size="small" />
    </template>
  </Dialog>
</template>

<script setup>
import { formatCurrency } from '@/helpers'
import { formatDate } from '@/helpers/date'
import { computed } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'

const props = defineProps({
  appointment: { type: Object, default: null }
})

const visible = defineModel('visible', { default: false })

const STATE_COLORS = {
  'Pendiente':    '#3B82F6',
  'Reprogramada': '#F97316',
  'Cancelada':    '#EF4444',
  'Completada':   '#22C55E',
  'No asistio':   '#6B7280',
}

const stateColor = computed(() => STATE_COLORS[props.appointment?.state] ?? '#6B7280')

const modalTitle = computed(() => props.appointment?.services?.[0]?.name || 'Detalle de Cita')

const formattedDate = computed(() => {
  if (!props.appointment?.date) return ''
  return formatDate(props.appointment.date)
})
</script>
