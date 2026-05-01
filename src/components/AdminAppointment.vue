<template>
  <div class="bg-white p-5 space-y-3 rounded-lg">
    <p class="text-gray-500 font-black">
      Fecha:
      <span class="font-light"> {{ displayDate(appointment?.date) }} </span>
      Hora: <span class="font-light"> {{ appointment?.time }} Horas.</span>
    </p>

    <p class="text-gray-500 font-black">
      Nombre Cliente:
      <span class="font-light">
        {{ appointment?.user?.name }}
      </span>
      Email:
      <span class="font-light">
        {{ appointment?.user?.email }}
      </span>
    </p>

    <p class="text-lg font-black">Servicios Solicitados en la cita</p>
    <div v-for="service in appointment.services">
      <p>{{ service.name }}</p>
    </div>
  </div>
</template>
<script setup>
import { displayDate } from "../helpers/date";
defineProps({
  appointment: {
    type: Object,
  },
});
</script>
