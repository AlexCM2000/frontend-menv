<template>
  <div class="flex justify-between items-center">
    <h2 class="flex items-center text-4xl font-extrabold text-[#3A3A3A] mt-0">
      {{ appointments.selectedCategory }}
    </h2>
    <div class="flex items-center justify-end">
      <Message
        icon="pi pi-exclamation-triangle"
        v-if="maxAppointments"
        severity="info"
        closable
        :life="5000"
        >Solo un servicio por cita.</Message
      >
    </div>
  </div>

  <!-- Estado vacío cuando no hay servicios para esa categoría -->
  <div v-if="services.length === 0" class="mt-10 text-center py-16 bg-white rounded-xl shadow-sm">
    <i class="pi pi-inbox text-5xl text-gray-300 mb-4 block"></i>
    <p class="text-gray-500 text-lg font-medium">No hay servicios disponibles para esta categoría.</p>
    <p class="text-gray-400 text-sm mt-1">Contacta al administrador para que agregue servicios.</p>
    <RouterLink
      :to="{ name: 'new-appointment' }"
      class="inline-block mt-6 px-5 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600"
    >
      Volver a categorías
    </RouterLink>
  </div>

  <ServiceItem
    v-else
    v-for="service in services"
    :key="service._id"
    :service="service"
  />
</template>
<script setup>
import ServiceItem from "@/components/ServiceItem.vue";
import { useAppointmentsStore } from "@/stores/appointments";
import { useServicesStore } from "@/stores/services";
import { storeToRefs } from "pinia";
import Message from "primevue/message";
import { RouterLink } from "vue-router";
const { services } = storeToRefs(useServicesStore());
const { maxAppointments } = storeToRefs(useAppointmentsStore());
const appointments = useAppointmentsStore();
</script>
