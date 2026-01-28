<template>
  <div
    class="h-full bg-white shadow-lg rounded-lg p-10 w-full max-w-lg border border-gray-300"
  >
    <h1 class="text-4xl font-bold text-gray-800 text-center">
      Crear una cuenta
    </h1>
    <p class="text-lg text-gray-600 text-center mt-2 mb-6">
      Crea una cuenta en GAMPA
    </p>

    <FormKit
      id="registerForm"
      type="form"
      :actions="false"
      @submit="handleSubmit"
      incomplete-message="No se pudo enviar el formulario, revisa los campos"
      class="space-y-4"
    >
      <FormKit
        type="text"
        label="Nombre"
        name="name"
        placeholder="Tu nombre"
        validation="required|length:3"
        :validation-messages="{
          required: 'El nombre es obligatorio',
          length: 'El nombre es muy corto',
        }"
        label-class="text-gray-700 font-medium"
        input-class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
      />

      <FormKit
        type="email"
        label="Email"
        name="email"
        placeholder="email de registro"
        validation="required|email"
        :validation-messages="{
          required: 'El email es obligatorio',
          email: 'email no valido',
        }"
        label-class="text-gray-700 font-medium"
        input-class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
      />

      <FormKit
        type="select"
        label="Centro de salud"
        name="codigo"
        placeholder="Seleccione el centro de salud al que pertenece"
        :options="healths"
        validation="required"
        :validation-messages="{
          required: 'Debe seleccionar un centro de salud',
        }"
        label-class="text-gray-700 font-medium"
        input-class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
      />

      <FormKit
        type="text"
        label="Código SUS"
        name="susCode"
        placeholder="ingrese el código único del sus"
        validation="required|length:3"
        :validation-messages="{
          required: 'El código sus es obligario',
          length: 'El código es muy corto',
        }"
        label-class="text-gray-700 font-medium"
        input-class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
      />

      <FormKit
        type="password"
        label="Contraseña"
        name="password"
        placeholder="Ingresa una contraseña"
        validation="required|length:8"
        :validation-messages="{
          required: 'la contraseña es obligatoria',
          length: 'la contraseña minima es de 8 caracteres',
        }"
        label-class="text-gray-700 font-medium"
        input-class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
      />

      <FormKit
        type="password"
        label="Repetir contraseña"
        name="password_confirm"
        placeholder="Repite la contraseña"
        validation="required|confirm"
        :validation-messages="{
          required: 'la contraseña es obligatoria',
          confirm: 'las contraseñas no son iguales',
        }"
        label-class="text-gray-700 font-medium"
        input-class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
      />

      <FormKit
        type="submit"
        input-class="w-full p-3 mt-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        Crear cuenta
      </FormKit>
    </FormKit>
  </div>
</template>

<script setup>
import AuthApi from "@/api/AuthApi";
import { inject, onMounted } from "vue";
import { reset } from "@formkit/vue";
import { useHealthStore } from "@/stores/healths";
import { storeToRefs } from "pinia";

const healthStore = useHealthStore();
const { getHealths } = healthStore;
const { healths } = storeToRefs(healthStore);
const toast = inject("toast");

onMounted(async () => {
  await getHealths();
});
const handleSubmit = async ({ password_confirm, ...values }) => {
  console.log(values);
  try {
    const { data } = await AuthApi.register(values);
    toast.open({
      message: data.msg,
      type: "success",
    });
    reset("registerForm");
  } catch (error) {
    toast.open({
      message: error?.response?.data?.msg,
      type: "error",
    });
  }
};
</script>
