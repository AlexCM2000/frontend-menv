<template>
  <div
    class="relative p-4 rounded-xl cursor-pointer select-none border-2 transition-all duration-150
           active:scale-[0.96]"
    :class="isServiceSelected(service._id)
      ? 'bg-blue-600 border-blue-600 shadow-md shadow-blue-100'
      : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-sm'"
    @click="onServiceSelected(service)"
  >
    <!-- Check icon cuando está seleccionado -->
    <div
      v-if="isServiceSelected(service._id)"
      class="absolute top-3 right-3 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm"
    >
      <i class="pi pi-check text-blue-600 text-[10px] font-black"></i>
    </div>

    <p
      class="text-sm font-semibold leading-snug pr-7 mb-2"
      :class="isServiceSelected(service._id) ? 'text-white' : 'text-gray-800'"
    >
      {{ service.name }}
    </p>
    <p
      class="text-base font-black"
      :class="isServiceSelected(service._id) ? 'text-blue-100' : 'text-blue-600'"
    >
      {{ formatCurrency(service.price) }}
    </p>
  </div>
</template>

<script setup>
import { formatCurrency } from '@/helpers'
import { useAppointmentsStore } from '@/stores/appointments'

const { onServiceSelected, isServiceSelected } = useAppointmentsStore()

defineProps({
  service: { type: Object }
})
</script>