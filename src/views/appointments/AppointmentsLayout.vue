<template>
  <div class="flex justify-between">
    <h1 class="text-2xl lg:text-6xl font-black text-[#002366]">G.A.M.P.A.</h1>
    <div class="flex flex-col space-y-5">
      <div class="flex gap-2 items-center">
        <p class="text-[#3A3A3A] text-right">Hola: {{ user?.name }}</p>
        <button
          type="button"
          class="bg-red-600 hover:bg-red-700 p-2 text-white uppercase text-xs font-extrabold rounded-lg"
          @click="logout"
        >
          Cerrar Sesión
        </button>
      </div>
      <nav class="flex gap-2 items-center justify-end">
        <RouterLink
          :to="{ name: 'my-appointments' }"
          class="p-3 text-[#3A3A3A] uppercase text-xs font-black rounded-lg"
        >
          Mis Citas
        </RouterLink>
        <RouterLink
          :to="{ name: 'new-appointment' }"
          class="p-3 text-gray-200 uppercase text-xs font-black rounded-lg bg-blue-700"
          >Nueva Cita</RouterLink
        >
      </nav>
    </div>
  </div>
  <main>
    <RouterView />
  </main>
</template>

<script setup>
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onMounted } from "vue";
import { RouterLink } from "vue-router";

const { user } = storeToRefs(useUserStore());
const { getUser, logout } = useUserStore();

onMounted(async () => {
  await getUser();
});
</script>
