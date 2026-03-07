<template>
  <div class="mt-6 space-y-5">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-2xl font-extrabold text-[#3A3A3A]">Calendario de Citas</h2>
        <p class="text-gray-500 text-sm mt-1">Visualiza y gestiona las citas del centro médico</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="(color, state) in STATE_COLORS"
          :key="state"
          class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-white"
          :style="{ backgroundColor: color }"
        >
          {{ state }}
        </span>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 sm:p-4">
      <FullCalendar ref="calendarRef" :options="calendarOptions" class="fc-custom" />
    </div>

    <AppointmentEventModal v-model:visible="showModal" :appointment="selectedAppointment" />
  </div>
</template>

<script setup>
import AppointmentApi from '@/api/AppointmentApi'
import AppointmentEventModal from '@/components/AppointmentEventModal.vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'
import { ref } from 'vue'

const STATE_COLORS = {
  'Pendiente':    '#3B82F6',
  'Reprogramada': '#F97316',
  'Cancelada':    '#EF4444',
  'Completada':   '#22C55E',
  'No asistio':   '#6B7280',
}

const showModal = ref(false)
const selectedAppointment = ref(null)
const calendarRef = ref(null)

const isMobile = () => window.innerWidth < 640

const mapToEvents = (appointments) =>
  appointments.map((apt) => {
    const dateStr = apt.date ? apt.date.split('T')[0] : ''
    return {
      id: apt._id,
      title: apt.services?.[0]?.name || 'Cita',
      start: apt.time ? `${dateStr}T${apt.time}` : dateStr,
      backgroundColor: STATE_COLORS[apt.state] ?? '#6B7280',
      borderColor: STATE_COLORS[apt.state] ?? '#6B7280',
      textColor: '#ffffff',
      extendedProps: apt,
    }
  })

const calendarOptions = {
  plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
  locale: esLocale,
  initialView: isMobile() ? 'listWeek' : 'dayGridMonth',
  headerToolbar: isMobile()
    ? { left: 'prev,next', center: 'title', right: 'today' }
    : { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,listWeek' },
  buttonText: {
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    list: 'Lista',
  },
  height: 'auto',
  events: (info, successCallback) => {
    AppointmentApi.getCalendar(info.start.toISOString(), info.end.toISOString())
      .then(({ data }) => successCallback(mapToEvents(data)))
      .catch(() => successCallback([]))
  },
  eventClick: ({ event }) => {
    selectedAppointment.value = event.extendedProps
    showModal.value = true
  },
  windowResize: (arg) => {
    const mobile = arg.view.calendar.el.offsetWidth < 640
    const api = calendarRef.value?.getApi()
    if (!api) return
    if (mobile) {
      api.changeView('listWeek')
      api.setOption('headerToolbar', { left: 'prev,next', center: 'title', right: 'today' })
    } else {
      api.changeView('dayGridMonth')
      api.setOption('headerToolbar', { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,listWeek' })
    }
  },
  eventDisplay: 'block',
  dayMaxEvents: 3,
  moreLinkText: (n) => `+${n} más`,
  nowIndicator: true,
  views: {
    listWeek: {
      noEventsText: 'No hay citas esta semana',
    },
    listMonth: {
      noEventsText: 'No hay citas este mes',
    },
  },
}
</script>

<style>
.fc-custom .fc-toolbar-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
}

.fc-custom .fc-button {
  background-color: #002366 !important;
  border-color: #002366 !important;
  font-size: 0.72rem !important;
  padding: 0.3rem 0.6rem !important;
  border-radius: 0.5rem !important;
  text-transform: capitalize !important;
}

.fc-custom .fc-button:hover {
  background-color: #001a4d !important;
  border-color: #001a4d !important;
}

.fc-custom .fc-button-active {
  background-color: #001a4d !important;
  border-color: #001a4d !important;
}

.fc-custom .fc-day-today {
  background-color: #eff6ff !important;
}

.fc-custom .fc-event {
  border-radius: 4px !important;
  font-size: 0.72rem !important;
  padding: 1px 4px !important;
  cursor: pointer;
}

.fc-custom .fc-col-header-cell-cushion,
.fc-custom .fc-daygrid-day-number {
  color: #374151;
  font-weight: 600;
  text-decoration: none;
}

/* Lista (vista móvil) */
.fc-custom .fc-list-event:hover td {
  background-color: #f0f7ff !important;
  cursor: pointer;
}

.fc-custom .fc-list-event-dot {
  border-width: 6px;
}

.fc-custom .fc-list-day-cushion {
  background-color: #f8fafc !important;
  font-size: 0.8rem;
  font-weight: 700;
  color: #475569;
}

@media (max-width: 640px) {
  .fc-custom .fc-toolbar {
    gap: 0.4rem;
  }
  .fc-custom .fc-toolbar-title {
    font-size: 0.9rem;
  }
}
</style>
