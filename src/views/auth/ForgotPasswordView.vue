<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

    <!-- Cabecera -->
    <div class="px-8 pt-8 pb-6 border-b border-gray-100">
      <div class="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center mb-4">
        <i class="pi pi-lock text-amber-500 text-lg"></i>
      </div>
      <h2 class="text-2xl font-bold text-gray-900">Recuperar contraseña</h2>
      <p class="text-gray-500 text-sm mt-1">
        Te enviaremos un enlace para restablecer tu acceso
      </p>
    </div>

    <!-- Cuerpo -->
    <div class="px-8 py-7">

      <!-- Estado: enviado -->
      <Transition name="fade-up" mode="out-in">
        <div v-if="sent" class="text-center py-4">
          <div class="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 ring-4 ring-emerald-100">
            <i class="pi pi-check-circle text-emerald-500 text-3xl"></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">¡Correo enviado!</h3>
          <p class="text-gray-500 text-sm leading-relaxed mb-6">
            Revisa tu bandeja de entrada. Si el correo existe en el sistema,
            recibirás las instrucciones para restablecer tu contraseña.
          </p>
          <RouterLink
            :to="{ name: 'login' }"
            class="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            <i class="pi pi-arrow-left text-xs"></i>
            Volver al inicio de sesión
          </RouterLink>
        </div>

        <!-- Estado: formulario -->
        <div v-else>
          <!-- Aviso informativo -->
          <div class="mb-5 flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700">
            <i class="pi pi-info-circle text-blue-400 flex-shrink-0 mt-0.5"></i>
            <span>
              Ingresa el correo electrónico registrado en tu cuenta y te enviaremos
              un enlace de recuperación.
            </span>
          </div>

          <!-- Alerta de error -->
          <div
            v-if="errorMsg"
            class="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm"
          >
            <i class="pi pi-exclamation-circle text-red-400 flex-shrink-0 mt-0.5"></i>
            <span>{{ errorMsg }}</span>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-5" novalidate>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Correo electrónico <span class="text-red-500">*</span>
              </label>
              <InputText
                v-model="email"
                type="email"
                placeholder="tu@correo.com"
                autocomplete="email"
                class="w-full"
                :class="emailError ? 'p-invalid' : ''"
                @blur="validateEmail"
              />
              <p v-if="emailError" class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <i class="pi pi-exclamation-circle text-xs"></i>{{ emailError }}
              </p>
            </div>

            <Button
              type="submit"
              label="Enviar enlace de recuperación"
              icon="pi pi-send"
              :loading="loading"
              class="w-full"
              size="large"
            />
          </form>

          <!-- Volver -->
          <RouterLink
            :to="{ name: 'login' }"
            class="mt-5 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <i class="pi pi-arrow-left text-xs"></i>
            Volver al inicio de sesión
          </RouterLink>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { RouterLink } from "vue-router";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import AuthApi from "@/api/AuthApi";
import { inject } from "vue";

const toast = inject("toast");

const email = ref("");
const emailError = ref("");
const errorMsg = ref("");
const loading = ref(false);
const sent = ref(false);

const validateEmail = () => {
  if (!email.value) {
    emailError.value = "El correo electrónico es obligatorio";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = "Correo electrónico inválido";
  } else {
    emailError.value = "";
  }
};

const handleSubmit = async () => {
  validateEmail();
  if (emailError.value) return;

  loading.value = true;
  errorMsg.value = "";
  try {
    const { data } = await AuthApi.forgotPassword({ email: email.value });
    sent.value = true;
    toast.open({ message: data.msg, type: "info" });
  } catch (error) {
    errorMsg.value = error?.response?.data?.msg || "Error al enviar el correo. Intenta nuevamente.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.3s ease;
}
.fade-up-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>