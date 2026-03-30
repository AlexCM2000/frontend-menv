<script setup>
import { ref, computed } from "vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { RouterLink } from "vue-router";

const userAuth = useUserStore();
const { user } = storeToRefs(userAuth);

const isAdmin = computed(() => user.value?.admin === true);
const isBranchManager = computed(() => user.value?.branchManager === true);

const menuOpen = ref(false);

const navLinks = computed(() => {
  const links = [
    { name: "admin-dashboard",   icon: "pi-chart-bar",     label: "Dashboard" },
    { name: "admin-appointments",icon: "pi-calendar",       label: "Citas" },
    { name: "admin-calendar",    icon: "pi-calendar-clock", label: "Calendario" },
    { name: "my-health-records", icon: "pi-file-edit",      label: "Historial Clínico" },
    { name: "patients-list",     icon: "pi-users",          label: "Pacientes" },
    { name: "doctors-list",      icon: "pi-user",           label: "Médicos" },
    { name: "users",             icon: "pi-user-edit",      label: "Usuarios" },
  ];
  if (isAdmin.value || isBranchManager.value) {
    links.push(
      { name: "admin-categories", icon: "pi-tag",    label: "Categorías" },
      { name: "admin-services",   icon: "pi-list",   label: "Servicios" },
    );
  }
  return links;
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">

    <!-- Top Bar -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div class="flex items-center gap-3 px-4 py-3">

        <!-- Logo / nombre -->
        <div class="flex items-center gap-2 mr-4">
          <span class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <i class="pi pi-heart text-white text-sm"></i>
          </span>
          <span class="font-bold text-blue-700 text-base hidden sm:inline">MQV Salud</span>
        </div>

        <!-- Nav desktop -->
        <nav class="hidden lg:flex items-center gap-1 flex-1 flex-wrap">
          <RouterLink
            v-for="link in navLinks"
            :key="link.name"
            :to="{ name: link.name }"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            active-class="bg-blue-50 text-blue-700 font-semibold"
          >
            <i class="pi text-sm" :class="link.icon"></i>
            {{ link.label }}
          </RouterLink>
        </nav>

        <!-- Spacer mobile -->
        <div class="flex-1 lg:hidden" />

        <!-- Usuario + logout -->
        <div class="flex items-center gap-2 shrink-0">
          <span class="hidden sm:flex items-center gap-2 text-sm text-gray-700">
            <i class="pi pi-user text-gray-400"></i>
            {{ user?.name }}
          </span>
          <button
            type="button"
            class="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            @click="userAuth.logout"
          >
            <i class="pi pi-sign-out text-sm"></i>
            <span class="hidden sm:inline">Salir</span>
          </button>
          <!-- Hamburger mobile -->
          <button
            type="button"
            class="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            @click="menuOpen = !menuOpen"
          >
            <i class="pi text-gray-600" :class="menuOpen ? 'pi-times' : 'pi-bars'"></i>
          </button>
        </div>
      </div>

      <!-- Nav mobile desplegable -->
      <nav v-if="menuOpen" class="lg:hidden border-t border-gray-100 px-4 pb-3 pt-2 flex flex-wrap gap-1">
        <RouterLink
          v-for="link in navLinks"
          :key="link.name"
          :to="{ name: link.name }"
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          active-class="bg-blue-50 text-blue-700 font-semibold"
          @click="menuOpen = false"
        >
          <i class="pi text-sm" :class="link.icon"></i>
          {{ link.label }}
        </RouterLink>
      </nav>
    </header>

    <!-- Contenido principal -->
    <main class="flex-1">
      <RouterView />
    </main>

  </div>
</template>