<template>
  <h1 class="text-6xl font-extrabold text-white text-center mt-10">
    Olvide mi contraseña
  </h1>
  <p class="text-2xl text-white text-center my-5">
    Recupera el acceso a tu cuenta
  </p>

  <FormKit
    id="loginForm"
    type="form"
    :actions="false"
    @submit="handleSubmit"
    incomplete-message="No se pudo enviar el formulario, revisa los campos"
  >
    <FormKit
      type="email"
      label="Email"
      name="email"
      placeholder="email de usuario"
      validation="required|email"
      :validation-messages="{
        required: 'El email es obligatorio',
        email: 'email no valido',
      }"
    />

    <FormKit type="submit">Enviar instrucciones</FormKit>
  </FormKit>
</template>

<script setup>
import AuthApi from "@/api/AuthApi";
import { inject } from "vue";

const toast = inject("toast");

const handleSubmit = async ({ email }) => {
  try {
    const { data } = await AuthApi.forgotPassword({ email });
    toast.open({
      message: data.msg,
      type: "info",
    });
  } catch (error) {
    toast.open({
      message: error.response.data.msg,
      type: "error",
    });
  }
};
</script>
