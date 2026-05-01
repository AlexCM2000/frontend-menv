<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="appointment?.services?.[0]?.name || 'Detalle de Cita'"
    :style="{ width: '30rem' }"
    :breakpoints="{ '640px': '95vw' }"
    :draggable="false"
  >
    <div v-if="appointment" class="space-y-4">

      <!-- Estado -->
      <div class="flex items-center justify-between">
        <span class="text-xs text-gray-400 uppercase font-semibold tracking-wide">Estado</span>
        <span
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white"
          :style="{ backgroundColor: stateColor }"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-white/70"></span>
          {{ appointment.state }}
        </span>
      </div>

      <hr class="border-gray-100" />

      <!-- Fecha y hora -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <p class="text-xs text-gray-400 uppercase font-semibold tracking-wide mb-1.5">Fecha</p>
          <div class="flex items-center gap-2">
            <i class="pi pi-calendar text-blue-500 text-sm"></i>
            <span class="text-gray-800 text-sm font-semibold">{{ formattedDate }}</span>
          </div>
        </div>
        <div>
          <p class="text-xs text-gray-400 uppercase font-semibold tracking-wide mb-1.5">Hora</p>
          <div class="flex items-center gap-2">
            <i class="pi pi-clock text-blue-500 text-sm"></i>
            <span class="text-gray-800 text-sm font-semibold">{{ appointment.time }} hrs.</span>
          </div>
        </div>
      </div>

      <!-- Servicio(s) -->
      <div>
        <p class="text-xs text-gray-400 uppercase font-semibold tracking-wide mb-1.5">Servicio</p>
        <div class="space-y-1.5">
          <div
            v-for="service in appointment.services"
            :key="service._id"
            class="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2"
          >
            <i class="pi pi-heart text-indigo-400 text-xs"></i>
            <span class="text-gray-800 text-sm font-medium">{{ service.name }}</span>
            <span v-if="service.category" class="text-gray-400 text-xs ml-auto">{{ service.category }}</span>
          </div>
        </div>
      </div>

      <!-- Médico -->
      <div v-if="appointment.doctor">
        <p class="text-xs text-gray-400 uppercase font-semibold tracking-wide mb-1.5">Médico asignado</p>
        <div class="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
          <i class="pi pi-user text-indigo-400 text-sm"></i>
          <span class="text-gray-800 text-sm font-medium">{{ appointment.doctor.name }}</span>
          <span class="text-gray-400 text-xs ml-auto">{{ appointment.doctor.specialty }}</span>
        </div>
      </div>

      <!-- Centro médico -->
      <div v-if="appointment.health?.name">
        <p class="text-xs text-gray-400 uppercase font-semibold tracking-wide mb-1.5">Centro médico</p>
        <div class="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
          <i class="pi pi-building text-indigo-400 text-sm"></i>
          <span class="text-gray-800 text-sm font-medium">{{ appointment.health.name }}</span>
        </div>
      </div>

      <!-- Motivo -->
      <div v-if="appointment.notes">
        <p class="text-xs text-gray-400 uppercase font-semibold tracking-wide mb-1.5">Motivo de consulta</p>
        <p class="text-gray-700 text-sm bg-gray-50 rounded-lg px-3 py-2.5 italic leading-relaxed">
          {{ appointment.notes }}
        </p>
      </div>

    </div>

    <template #footer>
      <!-- Sin acciones disponibles -->
      <div v-if="!canEdit" class="flex justify-between gap-2 w-full">
        <Button
          label="Ver comprobante"
          icon="pi pi-qrcode"
          severity="secondary"
          size="small"
          outlined
          @click="showVoucher = true"
        />
        <Button
          label="Cerrar"
          severity="secondary"
          @click="visible = false"
          size="small"
        />
      </div>

      <!-- Con acciones disponibles (Pendiente o Reprogramada) -->
      <div v-else class="flex flex-col sm:flex-row gap-2 w-full">
        <Button
          label="Comprobante"
          icon="pi pi-qrcode"
          severity="secondary"
          outlined
          size="small"
          class="sm:flex-none"
          @click="showVoucher = true"
        />
        <div class="flex gap-2 flex-1">
          <Button
            label="Cancelar cita"
            severity="danger"
            outlined
            size="small"
            class="flex-1"
            :loading="cancelling"
            @click="onCancel"
          />
          <RouterLink
            :to="{ name: 'edit-appointment-details', params: { id: appointment._id } }"
            class="flex-1"
          >
            <Button
              label="Editar"
              size="small"
              class="w-full"
              icon="pi pi-pencil"
            />
          </RouterLink>
        </div>
      </div>
    </template>
  </Dialog>

  <!-- Comprobante digital -->
  <AppointmentVoucher
    v-model:visible="showVoucher"
    :appointment="appointment"
  />
</template>

<script setup>
import { computed, ref } from 'vue'
import { displayDate } from '@/helpers/date'
import { useAppointmentsStore } from '@/stores/appointments'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import { RouterLink } from 'vue-router'
import AppointmentVoucher from '@/components/AppointmentVoucher.vue'

const props = defineProps({
  appointment: { type: Object, default: null }
})

const visible = defineModel('visible', { default: false })

const store = useAppointmentsStore()
const cancelling = ref(false)
const showVoucher = ref(false)

const STATE_COLORS = {
  'Pendiente':    '#3B82F6',
  'Reprogramada': '#F97316',
  'Cancelada':    '#EF4444',
  'Completada':   '#22C55E',
  'No asistio':   '#6B7280',
}

const EDITABLE_STATES = ['Pendiente', 'Reprogramada']

const stateColor = computed(() => STATE_COLORS[props.appointment?.state] ?? '#6B7280')
const canEdit = computed(() => EDITABLE_STATES.includes(props.appointment?.state))

const formattedDate = computed(() => {
  if (!props.appointment?.date) return ''
  return displayDate(props.appointment.date)
})

const onCancel = async () => {
  cancelling.value = true
  await store.cancelAppointment(props.appointment._id)
  cancelling.value = false
  visible.value = false
}
</script>