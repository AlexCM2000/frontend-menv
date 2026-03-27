<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center px-4 py-10">
    <div class="w-full max-w-md">

      <!-- Logo -->
      <div class="flex flex-col items-center mb-8">
        <span
          class="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-3 shadow-lg"
        >
          <i class="pi pi-heart text-white text-2xl"></i>
        </span>
        <h1 class="text-white font-bold text-2xl tracking-tight">MQV Salud</h1>
        <p class="text-blue-200 text-sm mt-1">Sistema de gestión médica</p>
      </div>

      <!-- Tarjeta de contenido -->
      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <RouterView />
      </div>

      <!-- Links de navegación entre vistas auth -->
      <nav class="mt-6 flex justify-center gap-4 flex-wrap">
        <RouterLink
          v-for="link in authLinks"
          :key="link.name"
          :to="{ name: link.name }"
          class="text-blue-200 hover:text-white text-xs font-medium transition-colors underline-offset-2 hover:underline"
          :class="{ hidden: route.name === link.name }"
        >
          {{ link.text }}
        </RouterLink>
      </nav>

    </div>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { RouterLink } from "vue-router";

const route = useRoute();

const authLinks = [
  { name: "register",         text: "Crear una cuenta"      },
  { name: "login",            text: "Iniciar sesión"        },
  { name: "forgot-password",  text: "Olvidé mi contraseña"  },
];
</script>