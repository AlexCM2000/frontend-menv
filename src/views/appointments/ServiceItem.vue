<template>
  <!-- Header de la categoría -->
  <div class="flex items-start justify-between gap-3">
    <div>
      <h2 class="text-2xl font-extrabold text-gray-800">{{ appointments.selectedCategory }}</h2>
      <p class="text-sm text-gray-400 mt-0.5">Selecciona el servicio para tu cita</p>
    </div>
    <Message
      v-if="maxAppointments"
      icon="pi pi-exclamation-triangle"
      severity="info"
      closable
      :life="5000"
      class="shrink-0"
    >Solo un servicio por cita.</Message>
  </div>

  <!-- Estado vacío -->
  <div v-if="services.length === 0"
    class="mt-6 text-center py-14 bg-white rounded-2xl border border-gray-100">
    <i class="pi pi-inbox text-5xl text-gray-200 mb-3 block"></i>
    <p class="text-gray-500 font-medium">No hay servicios disponibles</p>
    <p class="text-gray-400 text-sm mt-1">Contacta al administrador para que agregue servicios.</p>
    <RouterLink
      :to="{ name: 'new-appointment' }"
      class="inline-block mt-5 px-5 py-2 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600"
    >
      Volver a categorías
    </RouterLink>
  </div>

  <!-- Grid de servicios -->
  <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
    <ServiceItem
      v-for="service in services"
      :key="service._id"
      :service="service"
    />
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import ServiceItem from '@/components/ServiceItem.vue'
import { useAppointmentsStore } from '@/stores/appointments'
import { useServicesStore } from '@/stores/services'
import { storeToRefs } from 'pinia'
import Message from 'primevue/message'

const { services } = storeToRefs(useServicesStore())
const { maxAppointments } = storeToRefs(useAppointmentsStore())
const appointments = useAppointmentsStore()
</script>