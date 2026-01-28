<template>
  <div class="mx-auto lg:w-3/5 flex flex-col items-center">
    <RouterView />
    <nav
      class="mt-10 flex w-full flex-col items-center space-y-5 lg:flex-row lg:justify-between lg:space-y-0"
    >
      <RouterLink
        v-for="authRoute in authRoutes"
        class="uppercase font-bold text-[#3A3A3A]"
        :to="{ name: authRoute.name }"
        :class="{ hidden: route.name === authRoute.name }"
      >
        {{ authRoute.name }}
      </RouterLink>
    </nav>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";

const route = useRoute();
const authRoutes = [
  {
    name: "register",
    text: "Crear una cuenta",
  },
  {
    name: "login",
    text: "Iniciar sesión",
  },
  {
    name: "forgot-password",
    text: "Olvide mi contraseña",
  },
];
</script>
