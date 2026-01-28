<template>
  <h2 class="text-4xl font-extrabold text-[#3A3A3A]">
    Detalles cita y resumen
  </h2>
  <p class="text-gray-500 text-lg">
    A continuación verifica la informacion y confirma la cita
  </p>
  <h3 class="text-3xl font-extrabold text-withe">
    <p
      v-if="appointments.noServicesSelected"
      class="text-[#2054b6] mt-28 text-2xl text-center"
    >
      No hay servicios seleccionados
    </p>

    <div v-else class="grid gap-5">
      <SelectedService
        v-for="service in appointments.services"
        :key="service._id"
        :service="service"
      />

      <p class="hidden text-right text-white text-2xl">
        Total a pagar:
        <span class="font-black">{{
          formatCurrency(appointments.totalAmount)
        }}</span>
      </p>
    </div>
  </h3>

  <div v-if="!appointments.noServicesSelected" class="space-y-8">
    <h3 class="text-3xl font-extrabold text-[#3A3A3A]">Fecha y Hora</h3>

    <div class="lg:flex gap-5 items-start">
      <div class="w-full lg:w-96 flex justify-center rounded-lg">
        <VueTailwindDatepicker
          i18n="es-es"
          as-single
          no-input
          :disable-date="disabledDate"
          :disable-in-range="true"
          :formatter="formatter"
          v-model="appointments.date"
          :language="esLocale"
        />
      </div>
      <div class="flex-1 grid grid-cols-2 xl:grid-cols-3 gap-5 mt-10 lg:mt-0">
        <button
          v-for="hour in appointments.hours"
          class="block text-blue-500 rounded-lg text-xl font-black p-3 disabled:opacity-10"
          :class="
            appointments.time === hour
              ? 'bg-blue-500 text-white'
              : 'bg-[#E0E0E0]'
          "
          @click="appointments.time = hour"
          :disabled="
            !appointments.isDateSelected || appointments.disableTime(hour)
          "
        >
          {{ hour }}
        </button>
      </div>
    </div>

    <div class="flex justify-end" v-if="appointments.isValidReservation">
      <button
        class="w-full md:w-auto bg-blue-500 p-3 rounded-lg uppercase font-black text-white"
        @click="appointments.saveAppointment()"
      >
        Confirmar reservación
      </button>
    </div>
  </div>
</template>

<script setup>
import SelectedService from "@/components/SelectedService.vue";
import { formatCurrency } from "@/helpers";
import { useAppointmentsStore } from "@/stores/appointments";
import { onMounted, ref } from "vue";
import VueTailwindDatepicker from "vue-tailwind-datepicker";
import { es as esLocale } from "date-fns/locale";
import { addDays, nextFriday, isWithinInterval } from "date-fns";
import { useRoute } from "vue-router";

const appointments = useAppointmentsStore();

const formatter = ref({
  date: "DD/MM/YYYY",
  month: "MMMM",
});

const disabledDate = (date) => {
  const today = new Date();
  const startDate = addDays(today, 1); // Un día después del día actual
  const endDate = nextFriday(today); // Ajusta el último día habilitado al viernes de esta semana

  return !isWithinInterval(date, { start: startDate, end: endDate });
};
const route = useRoute();
onMounted(() => {
  console.log(route.params.id);
});
</script>
