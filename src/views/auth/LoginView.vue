<template>
  <div
    class="bg-white shadow-2xl rounded-2xl p-12 max-w-lg w-auto transform transition duration-300 hover:scale-105 border border-transparent hover:border-gradient-to-r from-blue-400 to-purple-600"
  >
    <h1 class="text-5xl font-extrabold text-gray-800 text-center mt-3">
      Iniciar Sesión
    </h1>
    <p class="text-xl text-gray-600 text-center mt-3">
      Si tienes una cuenta en G.A.M.P.A. inicia sesión
    </p>

    <FormKit
      id="loginForm"
      type="form"
      :actions="false"
      @submit="handleSubmit"
      incomplete-message="No se pudo enviar el formulario, revisa los campos"
      class="space-y-8 mt-8"
    >
      <FormKit
        type="email"
        label="Email"
        name="email"
        placeholder="email de usuario"
        validation="required|email"
        :validation-messages="{
          required: 'El email es obligatorio',
          email: 'Email no válido',
        }"
        label-class="text-gray-700 font-medium"
        input-class="w-full m-0 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-400 transition duration-300"
      />

      <FormKit
        type="password"
        label="Contraseña"
        name="password"
        placeholder="Ingresa una contraseña"
        validation="required"
        :validation-messages="{
          required: 'La contraseña es obligatoria',
        }"
        label-class="text-gray-700 font-medium"
        input-class="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-400 transition duration-300"
      />

      <FormKit
        type="submit"
        input-class="w-full p-4 mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:bg-gradient-to-l transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-400"
      >
        Iniciar Sesión
      </FormKit>
    </FormKit>
  </div>
</template>

<script setup>
import AuthApi from "@/api/AuthApi";
import { inject } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user.js";

const userStore = useUserStore();
const { getUserAppointments } = userStore;

const router = useRouter();

const toast = inject("toast");
const handleSubmit = async (values) => {
  try {
    const {
      data: { token },
    } = await AuthApi.login(values);
    localStorage.setItem("token", token);
    await getUserAppointments();
    router.push({ name: "my-appointments" });
  } catch (error) {
    toast.open({
      message: error?.response?.data?.msg,
      type: "error",
    });
  }
};
</script>
