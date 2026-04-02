<template>
  <!-- Stepper de pasos -->
  <div class="my-5">
    <div class="flex items-stretch rounded-2xl overflow-hidden border border-gray-200 shadow-sm">

      <!-- Paso 1 -->
      <RouterLink
        :to="{ name: 'new-appointment' }"
        class="flex-1 flex items-center gap-2.5 px-4 py-3 transition-colors"
        :class="isStep1
          ? 'bg-blue-600 text-white'
          : 'bg-white text-gray-500 hover:bg-gray-50'"
      >
        <span
          class="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 transition-colors"
          :class="isStep1 ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'"
        >1</span>
        <div class="min-w-0">
          <p class="text-xs font-bold leading-none" :class="isStep1 ? 'text-blue-100' : 'text-gray-400'">Paso 1</p>
          <p class="text-sm font-semibold leading-tight mt-0.5 truncate">Especialidad</p>
        </div>
        <i v-if="step1Done" class="pi pi-check-circle ml-auto text-sm"
          :class="isStep1 ? 'text-blue-200' : 'text-green-500'"></i>
      </RouterLink>

      <!-- Separador -->
      <div class="flex items-center justify-center w-8 bg-gray-50 shrink-0">
        <i class="pi pi-chevron-right text-gray-300 text-xs"></i>
      </div>

      <!-- Paso 2 -->
      <component
        :is="step1Done ? RouterLink : 'div'"
        :to="step1Done ? { name: 'appointment-details' } : undefined"
        class="flex-1 flex items-center gap-2.5 px-4 py-3 transition-colors"
        :class="isStep2
          ? 'bg-blue-600 text-white'
          : step1Done
            ? 'bg-white text-gray-600 hover:bg-gray-50 cursor-pointer'
            : 'bg-gray-50 text-gray-300 cursor-not-allowed'"
      >
        <span
          class="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 transition-colors"
          :class="isStep2 ? 'bg-white/25 text-white' : step1Done ? 'bg-gray-100 text-gray-500' : 'bg-gray-100 text-gray-300'"
        >2</span>
        <div class="min-w-0">
          <p class="text-xs font-bold leading-none" :class="isStep2 ? 'text-blue-100' : 'text-gray-400'">Paso 2</p>
          <p class="text-sm font-semibold leading-tight mt-0.5 truncate">Fecha y Hora</p>
        </div>
      </component>

    </div>
  </div>

  <div class="space-y-5">
    <router-view />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAppointmentsStore } from '@/stores/appointments'
import { storeToRefs } from 'pinia'

const route = useRoute()
const store = useAppointmentsStore()
const { services } = storeToRefs(store)

const isStep1 = computed(() => ['new-appointment', 'service-item'].includes(route.name))
const isStep2 = computed(() => route.name === 'appointment-details')
const step1Done = computed(() => services.value.length > 0)

onMounted(() => {
  store.clearAppointmentsData()
})
</script>