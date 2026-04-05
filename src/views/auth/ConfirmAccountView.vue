<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
    <div class="px-8 py-12">
      <Transition name="fade-up" mode="out-in">

        <!-- Cargando -->
        <div v-if="status === 'loading'" key="loading" class="text-center space-y-4">
          <div class="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto ring-4 ring-indigo-100">
            <i class="pi pi-spin pi-spinner text-indigo-500 text-2xl"></i>
          </div>
          <h2 class="text-xl font-semibold text-gray-900">Verificando tu cuenta...</h2>
          <p class="text-gray-500 text-sm">Por favor espera un momento</p>
        </div>

        <!-- Éxito -->
        <div v-else-if="status === 'success'" key="success" class="text-center space-y-4">
          <div class="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto ring-4 ring-emerald-100">
            <i class="pi pi-check-circle text-emerald-500 text-3xl"></i>
          </div>
          <h2 class="text-xl font-semibold text-gray-900">¡Cuenta verificada!</h2>
          <p class="text-gray-500 text-sm leading-relaxed">{{ message }}</p>
          <p class="text-xs text-gray-400">
            Serás redirigido al inicio de sesión en unos segundos...
          </p>
          <RouterLink
            :to="{ name: 'login' }"
            class="inline-flex items-center gap-2 mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <i class="pi pi-sign-in text-xs"></i>
            Ir al inicio de sesión
          </RouterLink>
        </div>

        <!-- Error -->
        <div v-else-if="status === 'error'" key="error" class="text-center space-y-4">
          <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto ring-4 ring-red-100">
            <i class="pi pi-times-circle text-red-400 text-3xl"></i>
          </div>
          <h2 class="text-xl font-semibold text-gray-900">Error de verificación</h2>
          <p class="text-gray-500 text-sm leading-relaxed">{{ message }}</p>
          <div class="pt-2 space-y-2">
            <RouterLink
              :to="{ name: 'login' }"
              class="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <i class="pi pi-sign-in text-xs"></i>
              Ir al inicio de sesión
            </RouterLink>
          </div>
        </div>

      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import AuthApi from "@/api/AuthApi";
import { inject } from "vue";

const route = useRoute();
const router = useRouter();
const toast = inject("toast");
const { token } = route.params;

const status = ref("loading");
const message = ref("");

onMounted(async () => {
  try {
    const { data } = await AuthApi.verifyAccount(token);
    status.value = "success";
    message.value = data.msg;
    toast.open({ message: data.msg, type: "success" });
    setTimeout(() => router.push({ name: "login" }), 5000);
  } catch (error) {
    status.value = "error";
    message.value = error?.response?.data?.msg || "El enlace de verificación no es válido o ha expirado.";
    toast.open({ message: message.value, type: "error" });
  }
});
</script>

<style scoped>
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.35s ease;
}
.fade-up-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>