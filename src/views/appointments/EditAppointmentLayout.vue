<template>
  <!-- Stepper de pasos (edición) -->
  <div class="my-5">
    <div class="flex items-stretch rounded-2xl overflow-hidden border border-gray-200 shadow-sm">

      <!-- Paso 1 -->
      <RouterLink
        :to="{ name: 'edit-appointment' }"
        class="flex-1 flex items-center gap-2.5 px-4 py-3 transition-colors"
        :class="isStep1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'"
      >
        <span
          class="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0"
          :class="isStep1 ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'"
        >1</span>
        <div class="min-w-0">
          <p class="text-xs font-bold leading-none" :class="isStep1 ? 'text-blue-100' : 'text-gray-400'">Paso 1</p>
          <p class="text-sm font-semibold leading-tight mt-0.5 truncate">Especialidad</p>
        </div>
      </RouterLink>

      <!-- Separador -->
      <div class="flex items-center justify-center w-8 bg-gray-50 shrink-0">
        <i class="pi pi-chevron-right text-gray-300 text-xs"></i>
      </div>

      <!-- Paso 2 -->
      <RouterLink
        :to="{ name: 'edit-appointment-details' }"
        class="flex-1 flex items-center gap-2.5 px-4 py-3 transition-colors"
        :class="isStep2 ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'"
      >
        <span
          class="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0"
          :class="isStep2 ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'"
        >2</span>
        <div class="min-w-0">
          <p class="text-xs font-bold leading-none" :class="isStep2 ? 'text-blue-100' : 'text-gray-400'">Paso 2</p>
          <p class="text-sm font-semibold leading-tight mt-0.5 truncate">Fecha y Hora</p>
        </div>
      </RouterLink>

    </div>
  </div>

  <div class="space-y-5">
    <router-view />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AppointmentApi from '@/api/AppointmentApi'
import { useAppointmentsStore } from '@/stores/appointments'

const route = useRoute()
const router = useRouter()
const { id } = route.params
const appointments = useAppointmentsStore()

const isStep1 = computed(() => route.name === 'edit-appointment')
const isStep2 = computed(() => route.name === 'edit-appointment-details')

onMounted(async () => {
  try {
    const { data } = await AppointmentApi.getById(id)
    appointments.setSelectedAppointment(data)
  } catch (error) {
    console.log(error)
    router.push({ name: 'my-appointments' })
  }
})
</script>