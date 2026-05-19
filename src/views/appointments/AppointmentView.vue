<template>
  <div class="space-y-6">

    <!-- Sin servicios seleccionados -->
    <div
      v-if="appointments.noServicesSelected"
      class="text-center py-16 text-blue-600 text-lg font-medium"
    >
      No hay servicios seleccionados
    </div>

    <template v-else>

      <!-- Servicio seleccionado -->
      <div>
        <p class="text-xs text-gray-400 uppercase font-semibold tracking-wide mb-2">Servicio seleccionado</p>
        <div class="space-y-2">
          <SelectedService
            v-for="service in appointments.services"
            :key="service._id"
            :service="service"
          />
        </div>
      </div>

      <!-- Médico -->
      <div>
        <p class="text-xs text-gray-400 uppercase font-semibold tracking-wide mb-2">
          Médico <span class="text-red-500 ml-1">*</span>
        </p>

        <!-- Aviso: sin médicos para la especialidad -->
        <div
          v-if="appointments.availabilityLoaded && availableDoctors.length === 0"
          class="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-3.5"
        >
          <i class="pi pi-exclamation-triangle text-red-500 text-sm mt-0.5 shrink-0"></i>
          <div>
            <p class="text-red-700 font-semibold text-sm">Sin médicos disponibles</p>
            <p class="text-red-600 text-xs mt-0.5">
              No hay médicos registrados para
              <strong>{{ appointments.selectedCategory }}</strong> en este centro.
            </p>
          </div>
        </div>

        <div v-else class="max-w-sm">
          <select
            :value="appointments.doctor"
            @change="onDoctorChange"
            class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   bg-white appearance-none"
          >
            <option :value="null" disabled>— Seleccione un médico —</option>
            <option
              v-for="doc in availableDoctors"
              :key="doc._id"
              :value="doc._id"
            >
              {{ doc.name }} — {{ doc.specialty }}
            </option>
          </select>
        </div>
      </div>

      <!-- Fecha y hora -->
      <div>
        <p class="text-xs text-gray-400 uppercase font-semibold tracking-wide mb-3">Fecha y Hora</p>

        <!-- Sin médico seleccionado -->
        <div v-if="!appointments.doctor"
          class="flex flex-col items-center justify-center py-10 text-center
                 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <i class="pi pi-user text-3xl text-gray-300 mb-2"></i>
          <p class="text-gray-400 text-sm font-medium">Selecciona primero un médico</p>
          <p class="text-gray-300 text-xs mt-1">para ver las fechas disponibles</p>
        </div>

        <div v-else class="flex flex-col lg:flex-row gap-6 items-start">

          <!-- Calendario -->
          <div class="w-full lg:w-auto flex justify-center">
            <VueTailwindDatepicker
              i18n="es"
              as-single
              no-input
              :disable-date="disabledDate"
              :disable-in-range="true"
              :formatter="formatter"
              v-model="appointments.date"
            />
          </div>

          <!-- Horarios -->
          <div class="flex-1 w-full">

            <!-- Sin fecha seleccionada -->
            <div v-if="!appointments.isDateSelected"
              class="flex flex-col items-center justify-center py-10 text-center
                     bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <i class="pi pi-calendar text-3xl text-gray-300 mb-2"></i>
              <p class="text-gray-400 text-sm font-medium">Selecciona una fecha</p>
              <p class="text-gray-300 text-xs mt-1">para ver los horarios disponibles</p>
            </div>

            <!-- Cargando disponibilidad -->
            <div v-else-if="!appointments.availabilityLoaded"
              class="flex flex-col items-center justify-center py-10 gap-3">
              <i class="pi pi-spin pi-spinner text-blue-500 text-2xl"></i>
              <p class="text-gray-400 text-sm">Verificando disponibilidad...</p>
            </div>

            <!-- Horarios cargados -->
            <div v-else class="space-y-4">

              <!-- Bloque: Mañana -->
              <div>
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <span class="text-amber-400">☀</span> Mañana
                </p>
                <div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                  <button
                    v-for="hour in morningHours"
                    :key="hour"
                    class="flex items-center justify-center rounded-xl text-sm font-bold
                           min-h-[44px] transition-all duration-100 active:scale-95"
                    :class="getTimeClass(hour)"
                    :disabled="!appointments.isDateSelected || appointments.disableTime(hour)"
                    @click="appointments.time = hour"
                  >
                    {{ hour }}
                  </button>
                </div>
              </div>

              <!-- Bloque: Tarde -->
              <div>
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <span class="text-indigo-400">🌙</span> Tarde
                </p>
                <div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                  <button
                    v-for="hour in afternoonHours"
                    :key="hour"
                    class="flex items-center justify-center rounded-xl text-sm font-bold
                           min-h-[44px] transition-all duration-100 active:scale-95"
                    :class="getTimeClass(hour)"
                    :disabled="!appointments.isDateSelected || appointments.disableTime(hour)"
                    @click="appointments.time = hour"
                  >
                    {{ hour }}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <!-- Motivo de consulta -->
      <div>
        <p class="text-xs text-gray-400 uppercase font-semibold tracking-wide mb-2">
          Motivo de consulta
          <span class="normal-case font-normal ml-1">(opcional)</span>
        </p>
        <textarea
          v-model="appointments.notes"
          rows="3"
          maxlength="300"
          placeholder="Describe brevemente el motivo de tu consulta..."
          class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                 resize-none placeholder:text-gray-300"
        />
        <p class="text-xs text-gray-300 text-right mt-1">
          {{ appointments.notes?.length ?? 0 }}/300
        </p>
      </div>

      <!-- Botón confirmar -->
      <div v-if="appointments.isValidReservation" class="flex justify-end pb-4">
        <button
          class="w-full sm:w-auto flex items-center justify-center gap-2
                 bg-blue-600 text-white font-bold rounded-xl
                 px-6 py-3 transition-colors min-h-[48px] shadow-sm shadow-blue-200
                 disabled:opacity-60 disabled:cursor-not-allowed hover:enabled:bg-blue-700"
          :disabled="appointments.saving"
          @click="appointments.saveAppointment()"
        >
          <i
            class="text-sm"
            :class="appointments.saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'"
          ></i>
          {{ appointments.saving ? 'Guardando...' : 'Confirmar reservación' }}
        </button>
      </div>

    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import SelectedService from '@/components/SelectedService.vue'
import { useAppointmentsStore } from '@/stores/appointments'
import VueTailwindDatepicker from 'vue-tailwind-datepicker'
import { addDays } from 'date-fns'
import { getDoctorsForSelect } from '@/modules/doctors/api/doctorsApi'

const appointments = useAppointmentsStore()
const availableDoctors = ref([])

const formatter = ref({
  date: 'DD/MM/YYYY',
  month: 'MMMM',
})

// Nombres de días en español indexados por getDay() (0=Domingo, 1=Lunes, ...)
const DAY_NAMES_ES = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

// Computed para que el datepicker se reactive cuando cambia el horario del médico
const disabledDate = computed(() => {
  const map = appointments.doctorScheduleMap
  const doc = appointments.doctor
  const loaded = appointments.scheduleLoaded

  return (date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (date < addDays(today, 1)) return true   // Pasado o hoy
    // Solo la semana actual: hasta el sábado de la semana Mon-Sáb en curso
    if (date > addDays(today, 6 - today.getDay())) return true
    if (date.getDay() === 0) return true         // Domingo siempre deshabilitado

    if (doc) {
      if (!loaded) return true  // Cargando horario: deshabilitar todo temporalmente
      const hasSchedules = Object.keys(map).length > 0
      if (hasSchedules) {
        // Tiene horario configurado: solo habilitar sus días activos
        const dayName = DAY_NAMES_ES[date.getDay()]
        return !map[dayName]
      }
      // Sin horario configurado: sin disponibilidad
      return true
    }
    return false
  }
})

// Separar horarios en mañana (< 13h) y tarde (>= 13h)
const morningHours = computed(() =>
  appointments.hours.filter(h => parseInt(h.split(':')[0]) < 13)
)
const afternoonHours = computed(() =>
  appointments.hours.filter(h => parseInt(h.split(':')[0]) >= 13)
)

// Clases del botón de hora según estado
const getTimeClass = (hour) => {
  const isSelected = appointments.time === hour
  const isDisabled = !appointments.isDateSelected || appointments.disableTime(hour)

  if (isSelected) return 'bg-blue-600 text-white shadow-md shadow-blue-200'
  if (isDisabled) return 'bg-gray-50 text-gray-200 cursor-not-allowed'
  return 'bg-white border border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50'
}

// Al cambiar médico: limpiar fecha y hora (el horario puede cambiar los días disponibles)
const onDoctorChange = (e) => {
  const newDoctor = e.target.value || null;
  appointments.doctor = newDoctor;
  appointments.time = "";
  appointments.date = "";
};

onMounted(async () => {
  try {
    const params = appointments.selectedCategory
      ? { specialty: appointments.selectedCategory }
      : {}
    availableDoctors.value = await getDoctorsForSelect(params)
  } catch {
    availableDoctors.value = []
  }
})
</script>