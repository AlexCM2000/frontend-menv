<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">

    <!-- Header del paciente -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div class="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">

        <!-- Logo -->
        <div class="flex items-center gap-2 mr-4">
          <span
            class="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600
                   flex items-center justify-center shadow-sm"
          >
            <i class="pi pi-heart text-white text-xs"></i>
          </span>
          <span class="font-bold text-blue-700 text-sm hidden sm:inline">MQV Salud</span>
        </div>

        <!-- Nav -->
        <nav class="flex items-center gap-1 flex-1 flex-wrap">
          <RouterLink
            :to="{ name: 'my-appointments' }"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                   text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            active-class="bg-blue-50 text-blue-700 font-semibold"
          >
            <i class="pi pi-calendar text-sm"></i>
            <span class="hidden sm:inline">Mis Citas</span>
          </RouterLink>

          <RouterLink
            :to="{ name: 'my-calendar' }"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                   text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            active-class="bg-blue-50 text-blue-700 font-semibold"
          >
            <i class="pi pi-calendar-clock text-sm"></i>
            <span class="hidden sm:inline">Calendario</span>
          </RouterLink>

          <RouterLink
            :to="{ name: 'new-appointment' }"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                   bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <i class="pi pi-plus text-sm"></i>
            <span class="hidden sm:inline">Nueva Cita</span>
          </RouterLink>
        </nav>

        <!-- Usuario + logout -->
        <div class="flex items-center gap-2 shrink-0">
          <span class="text-sm text-gray-600 hidden md:inline truncate max-w-[140px]">
            {{ user?.name }}
          </span>
          <button
            class="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600
                   px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            @click="logout"
          >
            <i class="pi pi-sign-out text-sm"></i>
            <span class="hidden sm:inline">Salir</span>
          </button>
        </div>

      </div>
    </header>

    <!-- Contenido -->
    <main class="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
      <RouterView />
    </main>

  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { RouterLink } from "vue-router";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores/user";

const { user } = storeToRefs(useUserStore());
const { getUser, logout } = useUserStore();

onMounted(async () => {
  await getUser();
});
</script>