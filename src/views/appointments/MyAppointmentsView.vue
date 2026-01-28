<template>
  <h2 class="text-4xl font-extrabold text-[#3A3A3A] mt-10">Mis Citas</h2>
  <p class="text-[#3A3A3A] text-lg mt-5">
    A continuación podrás administrar tus próximas citas
  </p>
  <p v-if="storeUser.loading" class="text-[#3A3A3A] text-2xl text-center mt-5">
    Cargando...
  </p>
  <div v-else>
    <p
      v-if="storeUser.noAppointments"
      class="text-[#3A3A3A] text-2xl text-center mt-5"
    >
      No tienes citas próximas
    </p>
    <div v-else class="grid grid-cols-1 gap-5 mt-10">
      <Appointment
        v-for="appointment in storeUser.userAppointments"
        :key="appointment._id"
        :appointment="appointment"
      />
    </div>
  </div>
</template>
<script setup>
import Appointment from "@/components/Appointment.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onMounted } from "vue";
import AuthApi from "@/api/AuthApi";

const storeUser = useUserStore();
const { loading } = storeToRefs(storeUser);
const { user } = storeToRefs(storeUser);

onMounted(async () => {
  try {
    const { data } = await AuthApi.auth();
    user.value = data;
    await storeUser.getUserAppointments(user.value._id);
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
});
</script>
