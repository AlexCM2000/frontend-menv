<template>
  <div
    class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
  >
    <!-- Cabecera de la tarjeta -->
    <div class="px-8 pt-8 pb-6 border-b border-gray-100">
      <div
        class="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center mb-4"
      >
        <i class="pi pi-user-plus text-indigo-600 text-lg"></i>
      </div>
      <h2 class="text-2xl font-bold text-gray-900">Crear una cuenta</h2>
      <p class="text-gray-500 text-sm mt-1">
        Completa el formulario para registrarte en el sistema
      </p>
    </div>

    <!-- Formulario -->
    <div class="px-8 py-6">
      <FormKit
        id="registerForm"
        type="form"
        :actions="false"
        @submit="handleSubmit"
        incomplete-message="Revisa los campos marcados en rojo"
        class="space-y-6"
      >
        <!-- ── Datos personales ── -->
        <div>
          <div class="flex items-center gap-2 mb-4">
            <div
              class="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0"
            >
              <i class="pi pi-id-card text-indigo-600 text-xs"></i>
            </div>
            <p
              class="text-xs font-semibold text-gray-500 uppercase tracking-wider"
            >
              Datos personales
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Primer apellido <span class="text-red-500">*</span>
              </label>
              <FormKit
                type="text"
                name="primerApellido"
                placeholder="Ej. Mamani"
                validation="required|length:2"
                :validation-messages="{
                  required: 'El primer apellido es obligatorio',
                  length: 'Mínimo 2 caracteres',
                }"
                input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                messages-class="mt-1.5 text-xs text-red-500"
                outer-class="!mb-0"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Segundo apellido
                <span class="text-gray-400 text-xs font-normal ml-1"
                  >(opcional)</span
                >
              </label>
              <FormKit
                type="text"
                name="segundoApellido"
                placeholder="Ej. Quispe"
                input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                messages-class="mt-1.5 text-xs text-red-500"
                outer-class="!mb-0"
              />
            </div>

            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Nombres <span class="text-red-500">*</span>
              </label>
              <FormKit
                type="text"
                name="nombres"
                placeholder="Ej. Juan Carlos"
                validation="required|length:2"
                :validation-messages="{
                  required: 'Los nombres son obligatorios',
                  length: 'Mínimo 2 caracteres',
                }"
                input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                messages-class="mt-1.5 text-xs text-red-500"
                outer-class="!mb-0"
              />
            </div>
          </div>
        </div>

        <div class="border-t border-gray-100"></div>

        <!-- ── Centro de salud y SUS ── -->
        <div>
          <div class="flex items-center gap-2 mb-4">
            <div
              class="w-6 h-6 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0"
            >
              <i class="pi pi-building text-teal-600 text-xs"></i>
            </div>
            <p
              class="text-xs font-semibold text-gray-500 uppercase tracking-wider"
            >
              Centro de salud y código SUS
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Centro de salud <span class="text-red-500">*</span>
              </label>
              <FormKit
                type="select"
                name="codigo"
                :options="[
                  { label: 'Seleccione un centro', value: '' },
                  ...healths,
                ]"
                validation="required"
                :validation-messages="{
                  required: 'Seleccione un centro de salud',
                }"
                input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                messages-class="mt-1.5 text-xs text-red-500"
                outer-class="!mb-0"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Código SUS <span class="text-red-500">*</span>
              </label>
              <FormKit
                type="text"
                name="susCode"
                placeholder="Código único SUS"
                validation="required|length:3"
                :validation-messages="{
                  required: 'El código SUS es obligatorio',
                  length: 'Mínimo 3 caracteres',
                }"
                input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                messages-class="mt-1.5 text-xs text-red-500"
                outer-class="!mb-0"
              />
            </div>
          </div>

          <p class="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
            <i class="pi pi-info-circle text-xs"></i>
            El código SUS es el identificador único de tu afiliación al Sistema
            Único de Salud de Bolivia.
          </p>
        </div>

        <div class="border-t border-gray-100"></div>

        <!-- ── Credenciales de acceso ── -->
        <div>
          <div class="flex items-center gap-2 mb-4">
            <div
              class="w-6 h-6 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0"
            >
              <i class="pi pi-lock text-violet-600 text-xs"></i>
            </div>
            <p
              class="text-xs font-semibold text-gray-500 uppercase tracking-wider"
            >
              Credenciales de acceso
            </p>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico <span class="text-red-500">*</span>
              </label>
              <FormKit
                type="email"
                name="email"
                placeholder="tu@correo.com"
                validation="required|email"
                :validation-messages="{
                  required: 'El correo es obligatorio',
                  email: 'Correo electrónico inválido',
                }"
                input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                messages-class="mt-1.5 text-xs text-red-500"
                outer-class="!mb-0"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-5">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña <span class="text-red-500">*</span>
                </label>
                <FormKit
                  type="password"
                  name="password"
                  placeholder="Mínimo 8 caracteres"
                  validation="required|length:8"
                  :validation-messages="{
                    required: 'La contraseña es obligatoria',
                    length: 'Mínimo 8 caracteres',
                  }"
                  input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  messages-class="mt-1.5 text-xs text-red-500"
                  outer-class="!mb-0"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Repetir contraseña <span class="text-red-500">*</span>
                </label>
                <FormKit
                  type="password"
                  name="password_confirm"
                  placeholder="Repite la contraseña"
                  validation="required|confirm"
                  :validation-messages="{
                    required: 'Repite la contraseña',
                    confirm: 'Las contraseñas no coinciden',
                  }"
                  input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  messages-class="mt-1.5 text-xs text-red-500"
                  outer-class="!mb-0"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Botón de registro -->
        <button
          type="submit"
          class="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <i class="pi pi-user-plus text-sm"></i>
          Crear cuenta
        </button>
      </FormKit>

      <!-- Separador -->
      <div class="my-5 flex items-center gap-3">
        <div class="flex-1 h-px bg-gray-100"></div>
        <span class="text-xs text-gray-400 whitespace-nowrap"
          >¿Ya tienes cuenta?</span
        >
        <div class="flex-1 h-px bg-gray-100"></div>
      </div>

      <!-- Link a login -->
      <RouterLink
        :to="{ name: 'login' }"
        class="flex items-center justify-center gap-2 w-full py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
      >
        <i class="pi pi-sign-in text-sm text-gray-400"></i>
        Iniciar sesión
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { inject, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { reset } from "@formkit/vue";
import { useHealthStore } from "@/stores/healths";
import { storeToRefs } from "pinia";
import AuthApi from "@/api/AuthApi";

const healthStore = useHealthStore();
const { getHealths } = healthStore;
const { healths } = storeToRefs(healthStore);
const toast = inject("toast");

onMounted(async () => {
  await getHealths();
});

const handleSubmit = async ({ password_confirm, ...values }) => {
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
