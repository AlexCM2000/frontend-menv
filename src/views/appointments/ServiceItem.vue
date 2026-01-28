<template>
  <div class="flex justify-between">
    <h2 class="flex items-center text-4xl font-extrabold text-white mt-0">
      {{ services[0]?.category }}
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
  <ServiceItem
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
import { onMounted } from "vue";
import { useRoute } from "vue-router";
const { services } = storeToRefs(useServicesStore());
const { maxAppointments } = storeToRefs(useAppointmentsStore());
</script>
