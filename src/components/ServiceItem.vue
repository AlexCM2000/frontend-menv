<template>
  <div
    class="p-5 space-y-5 rounded-lg cursor-pointer"
    :class="
      isServiceSelected(service._id) ? 'bg-blue-500 text-white' : 'bg-white'
    "
    @click="onServiceSelected(service)"
  >
    <p class="text-xl font-light">{{ service.name }}</p>
    <p
      class="text-2xl font-black"
      :class="isServiceSelected(service._id) ? ' text-white' : 'text-blue-600'"
    >
      {{ formatCurrency(service.price) }}
    </p>
  </div>
</template>

<script setup>
import { formatCurrency } from "../helpers";
import { useAppointmentsStore } from "@/stores/appointments";

const appointmentsStore = useAppointmentsStore();
const { onServiceSelected, isServiceSelected } = appointmentsStore;

defineProps({
  service: {
    type: Object,
  },
});
</script>
