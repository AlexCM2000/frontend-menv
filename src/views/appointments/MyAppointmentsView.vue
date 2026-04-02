<template>
  <div class="space-y-5 py-2">

    <!-- Header -->
    <div class="flex items-start justify-between gap-3">
      <div>
        <h2 class="text-2xl font-extrabold text-gray-800">Mis Citas</h2>
        <p class="text-gray-500 text-sm mt-0.5">Gestiona tus citas médicas</p>
      </div>
      <RouterLink
        :to="{ name: 'new-appointment' }"
        class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white
               px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors
               min-h-[44px] shrink-0 shadow-sm shadow-blue-200"
      >
        <i class="pi pi-plus text-sm"></i>
        <span>Nueva Cita</span>
      </RouterLink>
    </div>

    <!-- Tabs Próximas / Historial -->
    <div class="flex rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm p-1 gap-1">
      <button
        @click="switchTab(false)"
        class="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-semibold transition-colors"
        :class="!storeUser.showHistory
          ? 'bg-blue-600 text-white shadow-sm'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'"
      >
        <i class="pi pi-calendar text-xs"></i>
        Próximas
      </button>
      <button
        @click="switchTab(true)"
        class="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-semibold transition-colors"
        :class="storeUser.showHistory
          ? 'bg-blue-600 text-white shadow-sm'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'"
      >
        <i class="pi pi-history text-xs"></i>
        Historial
        <span class="text-[10px] font-normal opacity-75">(90 días)</span>
      </button>
    </div>

    <!-- Skeleton loader -->
    <template v-if="storeUser.loading">
      <div v-for="i in 3" :key="i"
        class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        <Skeleton height="4px" class="w-full" />
        <div class="p-4 flex items-center gap-3">
          <Skeleton width="48px" height="48px" class="rounded-xl shrink-0" />
          <div class="flex-1 space-y-2">
            <div class="flex justify-between gap-2">
              <Skeleton height="13px" width="55%" />
              <Skeleton height="18px" width="72px" class="rounded-full" />
            </div>
            <Skeleton height="11px" width="42%" />
          </div>
          <Skeleton width="14px" height="14px" class="rounded" />
        </div>
      </div>
    </template>

    <!-- Sin citas -->
    <div v-else-if="storeUser.noAppointments"
      class="text-center py-14 bg-white rounded-2xl border border-gray-100">
      <div class="inline-flex items-center justify-center w-14 h-14 bg-blue-50 rounded-2xl mb-3">
        <i class="pi pi-calendar text-blue-400 text-2xl"></i>
      </div>
      <h3 class="text-gray-700 font-semibold text-sm mb-1">
        {{ storeUser.showHistory ? 'Sin historial en los últimos 90 días' : 'No tienes citas próximas' }}
      </h3>
      <p class="text-gray-400 text-xs mb-4 max-w-[220px] mx-auto">
        {{ storeUser.showHistory
          ? 'No se encontraron citas completadas o canceladas.'
          : '¿Necesitas atención médica? Reserva tu cita ahora.' }}
      </p>
      <RouterLink
        v-if="!storeUser.showHistory"
        :to="{ name: 'new-appointment' }"
        class="inline-flex items-center gap-1.5 bg-blue-600 text-white
               px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
      >
        <i class="pi pi-plus text-xs"></i>
        Reservar cita
      </RouterLink>
    </div>

    <!-- Lista de citas -->
    <template v-else>
      <p class="text-xs text-gray-400 font-medium px-0.5">
        {{ storeUser.totalRecords }}
        {{ storeUser.totalRecords === 1 ? 'cita encontrada' : 'citas encontradas' }}
        <span v-if="storeUser.showHistory" class="ml-1 text-gray-300">· últimos 90 días</span>
      </p>

      <div class="grid grid-cols-1 gap-3">
        <Appointment
          v-for="appointment in storeUser.userAppointments"
          :key="appointment._id"
          :appointment="appointment"
          @open="openDetail(appointment)"
        />
      </div>

      <Paginator
        v-if="storeUser.totalRecords > storeUser.page_size"
        :rows="storeUser.page_size"
        :totalRecords="storeUser.totalRecords"
        :first="storeUser.page_first"
        @page="storeUser.onPage($event)"
        :pt="{
          root: { class: 'bg-transparent border-0 p-0 justify-center mt-2' },
          pageButton: { class: 'rounded-xl min-w-[36px] h-9' },
        }"
      />
    </template>

    <!-- Modal detalle -->
    <AppointmentDetailModal
      v-model:visible="showDetail"
      :appointment="selectedAppointment"
    />

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import AuthApi from '@/api/AuthApi'
import { useUserStore } from '@/stores/user'
import Appointment from '@/components/Appointment.vue'
import AppointmentDetailModal from '@/components/AppointmentDetailModal.vue'
import Skeleton from 'primevue/skeleton'
import Paginator from 'primevue/paginator'

const storeUser = useUserStore()
const { user } = storeToRefs(storeUser)

const showDetail = ref(false)
const selectedAppointment = ref(null)

const openDetail = (appointment) => {
  selectedAppointment.value = appointment
  showDetail.value = true
}

const switchTab = async (history) => {
  if (storeUser.showHistory === history) return
  await storeUser.setShowHistory(history)
}

onMounted(async () => {
  try {
    storeUser.loading = true
    const { data } = await AuthApi.auth()
    user.value = data
    // Resetear a tab "Próximas" al entrar
    storeUser.showHistory = false
    await storeUser.getUserAppointments(user.value._id)
  } catch (error) {
    console.log(error)
  } finally {
    storeUser.loading = false
  }
})
</script>