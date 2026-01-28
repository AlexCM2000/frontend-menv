<template>
  <h2 class="text-4xl font-extrabold text-[#3A3A3A] mt-10">Especialidades</h2>
  <p class="text-gray-500 text-lg mt-5">
    A continuación elige una especialidad para tu cita
  </p>

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-5">
    <!-- <ServiceItem
      v-for="service in serviceStore.services"
      :key="service._id"
      :service="service"
    /> -->
    <Category />
  </div>
</template>

<script setup>
import { useServicesStore } from "../../stores/services";
import ServiceItem from "../../components/ServiceItem.vue";
import Category from "./Category.vue";
const serviceStore = useServicesStore();
</script>
