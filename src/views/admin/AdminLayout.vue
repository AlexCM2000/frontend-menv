<script setup>
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onMounted } from "vue";
const userAuth = useUserStore();
const { user } = storeToRefs(userAuth);
onMounted(() => {
  userAuth.getUser();
});
</script>

<template>
  <div class="flex justify-between">
    <div>
      <h1 class="text-2xl lg:text-6xl font-black text-[#002366]">App Salón</h1>
      <h2 class="text-xl lg:text-2xl mt-2 font-black text-[#3A3A3A]">
        Panel de Administración
      </h2>
    </div>

    <div class="flex flex-col space-y-5">
      <div class="flex gap-2 items-center">
        <p class="text-[#3A3A3A] font-medium text-xl text-right">
          Bienvenido: {{ user?.name }}
        </p>
        <button
          type="button"
          class="bg-red-600 hover:bg-red-700 p-2 text-white uppercase text-xs font-extrabold rounded-lg"
          @click="userAuth.logout"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  </div>
  <main class="space-y-6">
    <RouterView />
  </main>
</template>
