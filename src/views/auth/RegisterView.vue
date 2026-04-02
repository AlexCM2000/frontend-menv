<template>
  <div class="w-full max-w-lg">
    <!-- Card principal -->
    <div class="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">

      <!-- Header decorativo -->
      <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <i class="pi pi-user-plus text-white text-lg"></i>
          </div>
          <div>
            <h1 class="text-xl font-bold text-white leading-tight">Crear una cuenta</h1>
            <p class="text-blue-100 text-xs mt-0.5">Completa el formulario para registrarte</p>
          </div>
        </div>
      </div>

      <!-- Formulario -->
      <div class="px-8 py-6">
        <FormKit
          id="registerForm"
          type="form"
          :actions="false"
          @submit="handleSubmit"
          incomplete-message="Revisa los campos marcados en rojo"
          class="space-y-5"
        >
          <!-- Sección: Datos personales -->
          <div>
            <div class="flex items-center gap-2 mb-3">
              <div class="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
                <i class="pi pi-id-card text-blue-600 text-xs"></i>
              </div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Datos personales</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Primer apellido -->
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
                  input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                  messages-class="mt-1 text-xs text-red-500"
                />
              </div>

              <!-- Segundo apellido -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Segundo apellido <span class="text-gray-400 text-xs font-normal">(opcional)</span>
                </label>
                <FormKit
                  type="text"
                  name="segundoApellido"
                  placeholder="Ej. Quispe"
                  input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                  messages-class="mt-1 text-xs text-red-500"
                />
              </div>

              <!-- Nombres -->
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
                  input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                  messages-class="mt-1 text-xs text-red-500"
                />
              </div>
            </div>
          </div>

          <div class="border-t border-gray-100"></div>

          <!-- Sección: Centro de salud y SUS -->
          <div>
            <div class="flex items-center gap-2 mb-3">
              <div class="w-5 h-5 bg-teal-100 rounded flex items-center justify-center">
                <i class="pi pi-building text-teal-600 text-xs"></i>
              </div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Centro de salud y SUS</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Centro de salud <span class="text-red-500">*</span>
                </label>
                <FormKit
                  type="select"
                  name="codigo"
                  :options="[{ label: 'Seleccione un centro', value: '' }, ...healths]"
                  validation="required"
                  :validation-messages="{ required: 'Seleccione un centro de salud' }"
                  input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition bg-white"
                  messages-class="mt-1 text-xs text-red-500"
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
                  input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                  messages-class="mt-1 text-xs text-red-500"
                />
              </div>
            </div>
          </div>

          <div class="border-t border-gray-100"></div>

          <!-- Sección: Credenciales -->
          <div>
            <div class="flex items-center gap-2 mb-3">
              <div class="w-5 h-5 bg-violet-100 rounded flex items-center justify-center">
                <i class="pi pi-lock text-violet-600 text-xs"></i>
              </div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Credenciales de acceso</p>
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
                    email: 'Correo inválido',
                  }"
                  input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                  messages-class="mt-1 text-xs text-red-500"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                    messages-class="mt-1 text-xs text-red-500"
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
                    input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                    messages-class="mt-1 text-xs text-red-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Botón submit -->
          <button
            type="submit"
            class="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 flex items-center justify-center gap-2 shadow-md"
          >
            <i class="pi pi-user-plus text-sm"></i>
            Crear cuenta
          </button>
        </FormKit>

        <!-- Link a login -->
        <p class="text-center text-sm text-gray-500 mt-4">
          ¿Ya tienes una cuenta?
          <RouterLink to="/auth/login" class="text-blue-600 font-medium hover:underline">
            Inicia sesión
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import AuthApi from "@/api/AuthApi";
import { inject, onMounted } from "vue";
import { reset } from "@formkit/vue";
import { RouterLink } from "vue-router";
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
