<template>
  <h1 class="text-6xl font-extrabold text-white text-center mt-10">
    Nueva contraseña
  </h1>
  <p class="text-2xl text-white text-center my-5">
    Ingresa tu nueva contraseña
  </p>

  <FormKit
    id="newPasswordForm"
    type="form"
    :actions="false"
    @submit="handleSubmit"
    incomplete-message="No se pudo enviar el formulario, revisa los campos"
  >
    <FormKit
      type="password"
      label="Contraseña"
      name="password"
      placeholder="Ingresa una contraseña"
      validation="required"
      :validation-messages="{
        required: 'la contraseña es obligatoria',
      }"
    />

    <FormKit type="submit">Guardar contraseña</FormKit>
  </FormKit>
</template>
<script setup>
import { inject, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import AuthApi from "@/api/AuthApi";

const router = useRouter();
const toast = inject("toast");
const route = useRoute();
const { token } = route.params;

onMounted(async () => {
  try {
    const { data } = await AuthApi.verifyPasswordResetToken(token);
    console.log(data);
  } catch (error) {
    toast.open({
      message: error.response.data.msg,
      type: error,
    });
  }
});

const handleSubmit = async ({ password }) => {
  try {
    const { data } = await AuthApi.updatePassword(token, { password });
    toast.open({
      message: data.msg,
      type: "success",
    });

    setTimeout(() => {
      router.push({ name: "login" });
    }, 3000);
  } catch (error) {
    toast.open({
      message: error.response.data.msg,
      type: "error",
    });
  }
};
</script>
