<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

    <!-- Cabecera -->
    <div class="px-8 pt-8 pb-6 border-b border-gray-100">
      <div class="w-11 h-11 bg-teal-50 rounded-xl flex items-center justify-center mb-4">
        <i class="pi pi-key text-teal-600 text-lg"></i>
      </div>
      <h2 class="text-2xl font-bold text-gray-900">Nueva contraseña</h2>
      <p class="text-gray-500 text-sm mt-1">
        Ingresa y confirma tu nueva contraseña de acceso
      </p>
    </div>

    <!-- Cuerpo -->
    <div class="px-8 py-7">

      <!-- Estado: éxito -->
      <Transition name="fade-up" mode="out-in">
        <div v-if="success" class="text-center py-4">
          <div class="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 ring-4 ring-emerald-100">
            <i class="pi pi-check-circle text-emerald-500 text-3xl"></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">¡Contraseña actualizada!</h3>
          <p class="text-gray-500 text-sm leading-relaxed mb-2">
            Tu contraseña fue cambiada exitosamente.
          </p>
          <p class="text-xs text-gray-400 mb-6">
            Serás redirigido al inicio de sesión en unos segundos...
          </p>
          <RouterLink
            :to="{ name: 'login' }"
            class="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            <i class="pi pi-sign-in text-xs"></i>
            Ir al inicio de sesión
          </RouterLink>
        </div>

        <!-- Formulario -->
        <div v-else>
          <!-- Error global -->
          <div
            v-if="errorMsg"
            class="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm"
          >
            <i class="pi pi-exclamation-circle text-red-400 flex-shrink-0 mt-0.5"></i>
            <span>{{ errorMsg }}</span>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-5" novalidate>
            <!-- Nueva contraseña -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Nueva contraseña <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <InputText
                  v-model="form.password"
                  :type="showPwd ? 'text' : 'password'"
                  placeholder="Mínimo 8 caracteres"
                  autocomplete="new-password"
                  class="w-full pr-10"
                  :class="errors.password ? 'p-invalid' : ''"
                  @blur="validatePassword"
                />
                <button
                  type="button"
                  @click="showPwd = !showPwd"
                  class="absolute right-3 inset-y-0 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  tabindex="-1"
                >
                  <i :class="showPwd ? 'pi pi-eye-slash' : 'pi pi-eye'" class="text-sm"></i>
                </button>
              </div>
              <p v-if="errors.password" class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <i class="pi pi-exclamation-circle text-xs"></i>{{ errors.password }}
              </p>
              <!-- Indicador de fortaleza -->
              <div v-if="form.password" class="mt-2 flex gap-1">
                <div
                  v-for="i in 4"
                  :key="i"
                  class="flex-1 h-1 rounded-full transition-colors"
                  :class="strengthColor(i)"
                ></div>
              </div>
              <p v-if="form.password" class="text-xs mt-1" :class="strengthTextColor">
                {{ strengthLabel }}
              </p>
            </div>

            <!-- Confirmar contraseña -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Confirmar contraseña <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <InputText
                  v-model="form.confirm"
                  :type="showConfirm ? 'text' : 'password'"
                  placeholder="Repite la contraseña"
                  autocomplete="new-password"
                  class="w-full pr-10"
                  :class="errors.confirm ? 'p-invalid' : ''"
                  @blur="validateConfirm"
                />
                <button
                  type="button"
                  @click="showConfirm = !showConfirm"
                  class="absolute right-3 inset-y-0 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  tabindex="-1"
                >
                  <i :class="showConfirm ? 'pi pi-eye-slash' : 'pi pi-eye'" class="text-sm"></i>
                </button>
              </div>
              <p v-if="errors.confirm" class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <i class="pi pi-exclamation-circle text-xs"></i>{{ errors.confirm }}
              </p>
            </div>

            <Button
              type="submit"
              label="Guardar nueva contraseña"
              icon="pi pi-check"
              :loading="loading"
              class="w-full"
              size="large"
            />
          </form>

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
import { ref, computed } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import AuthApi from "@/api/AuthApi";
import { inject, onMounted } from "vue";

const toast = inject("toast");
const router = useRouter();
const route = useRoute();
const { token } = route.params;

const form = ref({ password: "", confirm: "" });
const errors = ref({ password: "", confirm: "" });
const errorMsg = ref("");
const loading = ref(false);
const success = ref(false);
const showPwd = ref(false);
const showConfirm = ref(false);

// ── Fortaleza de contraseña ──────────────────────────
const strength = computed(() => {
  const pwd = form.value.password;
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
});

const strengthColor = (i) => {
  if (i > strength.value) return "bg-gray-100";
  if (strength.value === 1) return "bg-red-400";
  if (strength.value === 2) return "bg-amber-400";
  if (strength.value === 3) return "bg-yellow-400";
  return "bg-emerald-500";
};

const strengthLabel = computed(() => {
  const labels = ["", "Muy débil", "Débil", "Buena", "Fuerte"];
  return labels[strength.value] || "";
});

const strengthTextColor = computed(() => {
  const colors = ["", "text-red-500", "text-amber-500", "text-yellow-600", "text-emerald-600"];
  return colors[strength.value] || "";
});

// ── Validaciones ─────────────────────────────────────
const validatePassword = () => {
  if (!form.value.password) {
    errors.value.password = "La contraseña es obligatoria";
  } else if (form.value.password.length < 8) {
    errors.value.password = "Mínimo 8 caracteres";
  } else {
    errors.value.password = "";
  }
};

const validateConfirm = () => {
  if (!form.value.confirm) {
    errors.value.confirm = "Confirma tu contraseña";
  } else if (form.value.confirm !== form.value.password) {
    errors.value.confirm = "Las contraseñas no coinciden";
  } else {
    errors.value.confirm = "";
  }
};

// ── Ciclo de vida ─────────────────────────────────────
onMounted(async () => {
  try {
    await AuthApi.verifyPasswordResetToken(token);
  } catch (error) {
    errorMsg.value = error?.response?.data?.msg || "El enlace de recuperación no es válido o ha expirado.";
  }
});

// ── Submit ────────────────────────────────────────────
const handleSubmit = async () => {
  validatePassword();
  validateConfirm();
  if (errors.value.password || errors.value.confirm) return;

  loading.value = true;
  errorMsg.value = "";
  try {
    const { data } = await AuthApi.updatePassword(token, { password: form.value.password });
    success.value = true;
    toast.open({ message: data.msg, type: "success" });
    setTimeout(() => router.push({ name: "login" }), 3000);
  } catch (error) {
    errorMsg.value = error?.response?.data?.msg || "Error al actualizar la contraseña.";
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