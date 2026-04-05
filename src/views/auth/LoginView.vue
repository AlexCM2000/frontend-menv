<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

    <!-- Cabecera de la tarjeta -->
    <div class="px-8 pt-8 pb-6 border-b border-gray-100">
      <div class="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
        <i class="pi pi-sign-in text-indigo-600 text-lg"></i>
      </div>
      <h2 class="text-2xl font-bold text-gray-900">Iniciar sesión</h2>
      <p class="text-gray-500 text-sm mt-1">
        Accede a tu cuenta del sistema de salud
      </p>
    </div>

    <!-- Cuerpo -->
    <div class="px-8 py-7">
      <!-- Alerta de error -->
      <Transition name="fade-down">
        <div
          v-if="errorMsg"
          class="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm"
        >
          <i class="pi pi-exclamation-circle text-red-400 flex-shrink-0 mt-0.5"></i>
          <span>{{ errorMsg }}</span>
        </div>
      </Transition>

      <form @submit.prevent="handleSubmit" class="space-y-5" novalidate>
        <!-- Correo electrónico -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">
            Correo electrónico <span class="text-red-500">*</span>
          </label>
          <InputText
            v-model="form.email"
            type="email"
            placeholder="tu@correo.com"
            autocomplete="email"
            class="w-full"
            :class="errors.email ? 'p-invalid' : ''"
            @blur="validateEmail"
          />
          <p v-if="errors.email" class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
            <i class="pi pi-exclamation-circle text-xs"></i>{{ errors.email }}
          </p>
        </div>

        <!-- Contraseña -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="text-sm font-medium text-gray-700">
              Contraseña <span class="text-red-500">*</span>
            </label>
            <RouterLink
              :to="{ name: 'forgot-password' }"
              class="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </RouterLink>
          </div>
          <div class="relative">
            <InputText
              v-model="form.password"
              :type="showPwd ? 'text' : 'password'"
              placeholder="Tu contraseña"
              autocomplete="current-password"
              class="w-full pr-10"
              :class="errors.password ? 'p-invalid' : ''"
              @blur="validatePassword"
            />
            <button
              type="button"
              @click="showPwd = !showPwd"
              class="absolute right-3 inset-y-0 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              tabindex="-1"
              :aria-label="showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            >
              <i :class="showPwd ? 'pi pi-eye-slash' : 'pi pi-eye'" class="text-sm"></i>
            </button>
          </div>
          <p v-if="errors.password" class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
            <i class="pi pi-exclamation-circle text-xs"></i>{{ errors.password }}
          </p>
        </div>

        <!-- Botón principal -->
        <Button
          type="submit"
          label="Iniciar sesión"
          icon="pi pi-sign-in"
          :loading="loading"
          class="w-full"
          size="large"
        />
      </form>

      <!-- Separador -->
      <div class="my-6 flex items-center gap-3">
        <div class="flex-1 h-px bg-gray-100"></div>
        <span class="text-xs text-gray-400 whitespace-nowrap">¿No tienes cuenta?</span>
        <div class="flex-1 h-px bg-gray-100"></div>
      </div>

      <!-- Botón registro secundario -->
      <RouterLink
        :to="{ name: 'register' }"
        class="flex items-center justify-center gap-2 w-full py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
      >
        <i class="pi pi-user-plus text-sm text-gray-400"></i>
        Crear una cuenta nueva
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import AuthApi from "@/api/AuthApi";
import { useUserStore } from "@/stores/user.js";

const userStore = useUserStore();
const { getUserAppointments } = userStore;
const router = useRouter();

const form = ref({ email: "", password: "" });
const errors = ref({ email: "", password: "" });
const errorMsg = ref("");
const loading = ref(false);
const showPwd = ref(false);

const validateEmail = () => {
  if (!form.value.email) {
    errors.value.email = "El correo electrónico es obligatorio";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = "Correo electrónico inválido";
  } else {
    errors.value.email = "";
  }
};

const validatePassword = () => {
  errors.value.password = form.value.password ? "" : "La contraseña es obligatoria";
};

const handleSubmit = async () => {
  validateEmail();
  validatePassword();
  if (errors.value.email || errors.value.password) return;

  loading.value = true;
  errorMsg.value = "";
  try {
    const { data: { token } } = await AuthApi.login(form.value);
    localStorage.setItem("token", token);
    await getUserAppointments();
    router.push({ name: "my-appointments" });
  } catch (error) {
    errorMsg.value = error?.response?.data?.msg || "Credenciales incorrectas. Intenta nuevamente.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.fade-down-enter-active,
.fade-down-leave-active {
  transition: all 0.25s ease;
}
.fade-down-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}
.fade-down-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>