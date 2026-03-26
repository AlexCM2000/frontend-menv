import { defineStore } from "pinia";
import { ref, computed, onMounted,inject, watch } from "vue";
import AppointmentApi from "../api/AppointmentApi";
import { convertToDDMMYYYY, convertToISO } from "@/helpers/date";
import { useRouter } from "vue-router";
import { useUserStore } from "./user";
import Appointment from "@/components/Appointment.vue";


export const useAppointmentsStore = defineStore("appointments", () => {
  const services = ref([]);
  const appointmentID = ref("");
  const date =ref("");
  const hours= ref([]);
  const time = ref('');
  const toast=inject('toast')
  const router = useRouter()
  const appointmentsByDate=ref([])
  const maxAppointments=ref(false)
  const state = ref("Pendiente")
  const doctor = ref(null)

  const user = useUserStore()

  onMounted(() => {
    // Primer intervalo: de 8:30 a 12:30
    const firstStartHour = 8; // Hora de inicio
    const firstEndHour = 12;   // Hora de fin
  
    for (let hour = firstStartHour; hour <= firstEndHour; hour++) {
      // Manejar los minutos específicos para la primera hora
      const startMinutes = hour === firstStartHour ? 30 : 0; // Comienza en 30 para 8:30
      for (let minutes = startMinutes; minutes < 60; minutes += 20) {
        const formattedHour = `${hour}:${minutes.toString().padStart(2, '0')}`;
        hours.value.push(formattedHour);
      }
    }
  
    // Segundo intervalo: de 2:30 a 6:00
    const secondStartHour = 14; // Hora de inicio
    const secondEndHour = 18;    // Hora de fin
  
    for (let hour = secondStartHour; hour <= secondEndHour; hour++) {
      // Manejar los minutos específicos para la segunda hora
      const startMinutes = hour === secondStartHour ? 30 : 0; // Comienza en 30 para 2:30
      for (let minutes = startMinutes; minutes < 60; minutes += 20) {
        const formattedHour = `${hour}:${minutes.toString().padStart(2, '0')}`;
        hours.value.push(formattedHour);
      }
    }
  });
  
watch(()=>date.value,async()=>{
  time.value=""
  if(date.value=="") return
  const {data}= await AppointmentApi.getByDate(date.value)
  if(appointmentID.value){
    appointmentsByDate.value=data.filter((appointment)=>appointment._id!==appointmentID.value)
    time.value = data.filter((appointment)=>appointment._id===appointmentID?.value)[0]?.time
  }else{
    appointmentsByDate.value=data
  }
},{deep:true})

const setSelectedAppointment = (appointment)=>{
  services.value=appointment.services
  time.value=appointment.time
  date.value = convertToDDMMYYYY(appointment.date)
  appointmentID.value=appointment._id
  state.value=appointment.state
  doctor.value=appointment.doctor?._id ?? appointment.doctor ?? null
}

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

  const totalAmount = computed(()=>{
    return services.value.reduce((total, service)=> total + service.price, 0)
  })

  const isValidReservation =computed(()=>{
    return services.value.length && date.value.length && time?.value?.length
  })

  const isDateSelected =computed(()=>{
    return date.value ? true : false  
  })

  const disableTime =computed(()=>{
    return (hour)=>{
      return appointmentsByDate.value.find((appointment)=>appointment.time===hour)
    }
  })

  const saveAppointment=async()=>{
    const appointment={
      services:services.value.map((service)=>service._id),
      date:convertToISO(date.value),
      time:time.value,
      totalAmount:totalAmount.value,
      state:state.value,
      doctor:doctor.value || null
    }

    if(appointmentID.value){
      try {

        const {data}=  await AppointmentApi.update(appointmentID.value,appointment)
        //mostrar mensaje
        toast.open({
          message:data.msg,
          type:'success'
        })
      } catch (error) {
        console.log(error)
      }
    }else{
      try {
        const {data}=  await AppointmentApi.create(appointment)
        toast.open({
          message:data.msg,
          type:'success'
        })
     
  
      } catch (error) {
        console.log(error)
      }
    }
    clearAppointmentsData()
    await user.getUserAppointments()
    //redireccionar
    router.push({name:'my-appointments'})

  }

  const cancelAppointment=async(id)=>{
    if(confirm("¿Deseas cancelar la cita?")) {
      try {
        const {data}= await AppointmentApi.delete(id)
        toast.open({
          message:data.msg,
          type:'success'
        })
        user.userAppointments=user.userAppointments.filter((appointment)=>appointment._id!==id)
      } catch (error) {
        toast.open({
          message:error.response.data.msg,
          type:'error'
        })
      }
    }
  }

  //limpiar datos

  const clearAppointmentsData=()=>{
    appointmentID.value=''
    services.value=[]
    date.value=''
    time.value=''
    doctor.value=null
  }
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
    totalAmount,
    disableTime,
    date,
    hours,
    time,
    isDateSelected,
    doctor,
  };
});
