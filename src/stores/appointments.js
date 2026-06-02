import { defineStore } from "pinia";
import { ref, computed, onMounted, inject, watch } from "vue";
import AppointmentApi from "../api/AppointmentApi";
import DoctorScheduleApi from "@/api/doctorScheduleApi";
import { convertToDDMMYYYY, convertToISO } from "@/helpers/date";
import { useRouter } from "vue-router";
import { useUserStore } from "./user";
import Swal from "sweetalert2";


export const useAppointmentsStore = defineStore("appointments", () => {
  const services = ref([]);
  const appointmentID = ref("");
  const date = ref("");
  const hours = ref([]);
  const time = ref('');
  const toast = inject('toast');
  const router = useRouter();
  const saving = ref(false);
  const maxAppointments = ref(false);
  const state = ref("Pendiente");
  const doctor = ref(null);
  const notes = ref("");
  const selectedCategory = ref(null);
  const availabilityData = ref({ doctors: [], appointments: [], shiftInfo: null });
  const availabilityLoaded = ref(false);
  const doctorScheduleMap = ref({});  // { 'Lunes': { morning, afternoon }, ... }
  const scheduleLoaded = ref(false);

  const user = useUserStore();

  // Genera slots de horario sin exceder el límite de cada turno
  const buildSlots = (startH, startM, endH, endM) => {
    for (let h = startH; h <= endH; h++) {
      const minStart = h === startH ? startM : 0;
      const minEnd   = h === endH   ? endM   : 59;
      for (let m = minStart; m <= minEnd; m += 20) {
        hours.value.push(`${h}:${String(m).padStart(2, '0')}`);
      }
    }
  };

  onMounted(() => {
    buildSlots(8, 30, 12, 30);   // 8:30 – 12:30
    buildSlots(14, 30, 18, 0);   // 14:30 – 18:00
  });
  
watch(() => date.value, async () => {
  time.value = "";
  availabilityLoaded.value = false;
  if (!date.value || !selectedCategory.value) return;
  try {
    const { data } = await AppointmentApi.getAvailability(
      date.value,
      selectedCategory.value,
      appointmentID.value || null,
      doctor.value || null
    );
    availabilityData.value = data;
  } catch (error) {
    console.log(error);
    availabilityData.value = { doctors: [], appointments: [], shiftInfo: null };
  } finally {
    availabilityLoaded.value = true;
  }
}, { deep: true });

// Carga el horario del médico seleccionado para restringir el calendario
watch(() => doctor.value, async (newDoc) => {
  doctorScheduleMap.value = {};
  scheduleLoaded.value = false;
  if (!newDoc) {
    scheduleLoaded.value = true;
    return;
  }
  try {
    const { data } = await DoctorScheduleApi.getSchedules(newDoc);
    const map = {};
    (data || []).forEach(s => {
      if (s.active && (s.morning || s.afternoon)) {
        map[s.dayOfWeek] = { morning: s.morning, afternoon: s.afternoon };
      }
    });
    doctorScheduleMap.value = map;
  } catch {
    doctorScheduleMap.value = {};
  } finally {
    scheduleLoaded.value = true;
  }
});

const setSelectedCategory = (categoryName) => {
  selectedCategory.value = categoryName;
};

const setSelectedAppointment = (appointment) => {
  services.value = appointment.services;
  time.value = appointment.time;
  date.value = convertToDDMMYYYY(appointment.date);
  appointmentID.value = appointment._id;
  state.value = appointment.state;
  doctor.value = appointment.doctor?._id ?? appointment.doctor ?? null;
  notes.value = appointment.notes ?? "";
  selectedCategory.value = appointment.services[0]?.category ?? null;
};

  const onServiceSelected = (service) => {
    if (
      services.value.some(
        (selectedService) => selectedService._id === service._id
      )
    ) {
      services.value = services.value.filter(
        (selectedService) => selectedService._id !== service._id
      );
    } else {
      if (services.value.length === 1) {
        maxAppointments.value=true
        return;
      }
      services.value.push(service);
    }
  };

  const isServiceSelected = computed(() => {
    return (id) => services.value.some((service) => service._id === id);
  });

  const noServicesSelected=computed(()=>services.value.length===0)

  const isValidReservation =computed(()=>{
    return services.value.length && date.value.length && time?.value?.length && doctor.value
  })

  const isDateSelected =computed(()=>{
    return date.value ? true : false  
  })

  const disableTime = computed(() => {
    const { doctors, appointments: appts, shiftInfo } = availabilityData.value;
    const selectedDoc = doctor.value;
    return (hour) => {
      if (!availabilityLoaded.value) return false;
      // Restricción por turno según horario del médico seleccionado
      if (shiftInfo) {
        const hourNum = parseInt(hour.split(':')[0]);
        const isMorning = hourNum < 13;
        if (isMorning && !shiftInfo.morning) return true;
        if (!isMorning && !shiftInfo.afternoon) return true;
      }
      const bookedAtHour = appts.filter(a => a.time === hour);
      if (selectedDoc) {
        // Con médico específico: solo verificar si ese médico tiene ese slot ocupado
        const bookedDoctorIds = bookedAtHour.map(a => a.doctor?.toString()).filter(Boolean);
        return bookedDoctorIds.includes(selectedDoc.toString());
      }
      // Sin médico específico: capacidad colectiva
      if (doctors.length === 0) return true;
      return bookedAtHour.length >= doctors.length;
    };
  });

  const saveAppointment = async () => {
    const appointment = {
      services: services.value.map((service) => service._id),
      date: convertToISO(date.value),
      time: time.value,
      notes: notes.value || "",
      state: state.value,
      doctor: doctor.value || null,
    };

    saving.value = true;

    if (appointmentID.value) {
      try {
        const { data } = await AppointmentApi.update(appointmentID.value, appointment);
        toast.open({ message: data.msg, type: "success" });
      } catch (error) {
        toast.open({
          message: error.response?.data?.msg || "Error al actualizar la cita",
          type: "error",
        });
        saving.value = false;
        return;
      }
    } else {
      try {
        const { data } = await AppointmentApi.create(appointment);
        toast.open({ message: data.msg, type: "success" });
      } catch (error) {
        toast.open({
          message: error.response?.data?.msg || "Error al crear la cita",
          type: "error",
        });
        saving.value = false;
        return;
      }
    }

    clearAppointmentsData();
    await user.getUserAppointments(user.user?._id);
    saving.value = false;
    router.push({ name: "my-appointments" });
  };

  const cancelAppointment = async (id) => {
    const result = await Swal.fire({
      title: "¿Cancelar cita?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      buttonsStyling: false,
      reverseButtons: true,
      confirmButtonText: "Sí, cancelar cita",
      cancelButtonText: "No, mantener",
      customClass: {
        container:       "!z-[99999]",
        popup:           "rounded-2xl shadow-2xl",
        title:           "text-lg font-bold text-gray-800",
        htmlContainer:   "text-sm text-gray-500",
        confirmButton:   "bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors",
        cancelButton:    "bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors",
        actions:         "gap-3 mt-2",
      },
    });

    if (!result.isConfirmed) return;

    try {
      const { data } = await AppointmentApi.update(id, { state: "Cancelada" });
      toast.open({ message: data.msg, type: "success" });
      await user.getUserAppointments(user.user?._id);
    } catch (error) {
      toast.open({
        message: error.response?.data?.msg || "Error al cancelar la cita",
        type: "error",
      });
    }
  };

  const clearAppointmentsData = () => {
    appointmentID.value = '';
    services.value = [];
    date.value = '';
    time.value = '';
    doctor.value = null;
    notes.value = "";
    selectedCategory.value = null;
    doctorScheduleMap.value = {};
    scheduleLoaded.value = false;
  };

  return {
    onServiceSelected,
    maxAppointments,
    isValidReservation,
    isServiceSelected,
    noServicesSelected,
    saveAppointment,
    setSelectedAppointment,
    clearAppointmentsData,
    cancelAppointment,
    services,
    disableTime,
    date,
    hours,
    time,
    isDateSelected,
    doctor,
    notes,
    selectedCategory,
    setSelectedCategory,
    availabilityLoaded,
    saving,
    doctorScheduleMap,
    scheduleLoaded,
  };
});
