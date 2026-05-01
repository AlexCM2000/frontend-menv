<template>
  <div class="page-wrapper">
    <!-- ═══════════════════════════════════════════════════
         MOBILE — Tabs + formularios apilados
    ════════════════════════════════════════════════════════ -->
    <div class="lg:hidden w-full max-w-sm px-4">
      <!-- Brand -->
      <div class="flex justify-center items-center gap-3 mb-7">
        <div
          class="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"
        >
          <i class="pi pi-heart text-white text-xl"></i>
        </div>
        <div>
          <p class="font-bold text-gray-900 text-base leading-tight">
            SIGMED-PA
          </p>
          <p class="text-xs text-gray-400">G.A.M.P.A. — La Paz, Bolivia</p>
        </div>
      </div>

      <!-- Tab switcher -->
      <div
        class="flex bg-white rounded-2xl p-1 mb-4 shadow-sm border border-gray-100"
      >
        <button
          @click="setMode(false)"
          class="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
          :class="
            !isActive
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          "
        >
          Iniciar sesión
        </button>
        <button
          @click="setMode(true)"
          class="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
          :class="
            isActive
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          "
        >
          Registrarse
        </button>
      </div>

      <!-- Tarjeta con formulario -->
      <div
        class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <Transition name="fade-form" mode="out-in">
          <!-- ── Login (mobile) ── -->
          <div v-if="!isActive" key="ml" class="p-7">
            <h3 class="text-xl font-bold text-gray-900 mb-0.5">Bienvenido</h3>
            <p class="text-xs text-gray-400 uppercase tracking-widest mb-6">
              Sistema de Salud G.A.M.P.A.
            </p>

            <div
              v-if="login.serverError"
              class="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-3 text-sm text-red-700"
            >
              <i class="pi pi-exclamation-circle flex-shrink-0 mt-0.5"></i>
              <span>{{ login.serverError }}</span>
            </div>

            <form @submit.prevent="handleLogin" novalidate class="space-y-4">
              <div>
                <label class="field-label">Correo electrónico *</label>
                <InputText
                  v-model="login.email"
                  type="email"
                  placeholder="tu@correo.com"
                  class="w-full"
                  :class="login.errors.email ? 'p-invalid' : ''"
                  autocomplete="email"
                />
                <p v-if="login.errors.email" class="field-error">
                  {{ login.errors.email }}
                </p>
              </div>
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <label class="field-label !mb-0">Contraseña *</label>
                  <RouterLink
                    :to="{ name: 'forgot-password' }"
                    class="text-xs text-indigo-500 hover:text-indigo-700 font-medium"
                    >¿Olvidaste tu contraseña?</RouterLink
                  >
                </div>
                <div class="relative">
                  <InputText
                    v-model="login.password"
                    :type="login.showPwd ? 'text' : 'password'"
                    placeholder="Tu contraseña"
                    class="w-full pr-10"
                    :class="login.errors.password ? 'p-invalid' : ''"
                    autocomplete="current-password"
                  />
                  <button
                    type="button"
                    @click="login.showPwd = !login.showPwd"
                    class="pwd-toggle"
                    tabindex="-1"
                  >
                    <i
                      :class="login.showPwd ? 'pi pi-eye-slash' : 'pi pi-eye'"
                      class="text-sm"
                    ></i>
                  </button>
                </div>
                <p v-if="login.errors.password" class="field-error">
                  {{ login.errors.password }}
                </p>
              </div>
              <Button
                type="submit"
                label="Iniciar sesión"
                icon="pi pi-sign-in"
                :loading="login.loading"
                class="w-full"
                size="large"
              />
            </form>
          </div>

          <!-- ── Register (mobile) ── -->
          <div v-else key="mr" class="p-7 max-h-[74vh] overflow-y-auto">
            <h3 class="text-xl font-bold text-gray-900 mb-0.5">Crear cuenta</h3>

            <div
              v-if="register.serverError"
              class="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-3 text-sm text-red-700"
            >
              <i class="pi pi-exclamation-circle flex-shrink-0 mt-0.5"></i>
              <span>{{ register.serverError }}</span>
            </div>

            <form @submit.prevent="handleRegister" novalidate class="space-y-3">
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="field-label">Primer apellido *</label>
                  <InputText
                    v-model="register.primerApellido"
                    placeholder="Mamani"
                    class="w-full"
                    :class="register.errors.primerApellido ? 'p-invalid' : ''"
                  />
                  <p v-if="register.errors.primerApellido" class="field-error">
                    {{ register.errors.primerApellido }}
                  </p>
                </div>
                <div>
                  <label class="field-label">Segundo apellido</label>
                  <InputText
                    v-model="register.segundoApellido"
                    placeholder="Quispe"
                    class="w-full"
                  />
                </div>
              </div>
              <div>
                <label class="field-label">Nombres *</label>
                <InputText
                  v-model="register.nombres"
                  placeholder="Juan Carlos"
                  class="w-full"
                  :class="register.errors.nombres ? 'p-invalid' : ''"
                />
                <p v-if="register.errors.nombres" class="field-error">
                  {{ register.errors.nombres }}
                </p>
              </div>
              <div>
                <label class="field-label">Centro de salud *</label>
                <Select
                  v-model="register.codigo"
                  :options="healthSelectOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Seleccione un centro..."
                  class="w-full"
                  :class="register.errors.codigo ? 'p-invalid' : ''"
                  appendTo="body"
                />
                <p v-if="register.errors.codigo" class="field-error">
                  {{ register.errors.codigo }}
                </p>
              </div>
              <div>
                <label class="field-label">Código SUS *</label>
                <InputText
                  v-model="register.susCode"
                  placeholder="Código único SUS"
                  class="w-full"
                  :class="register.errors.susCode ? 'p-invalid' : ''"
                />
                <p v-if="register.errors.susCode" class="field-error">
                  {{ register.errors.susCode }}
                </p>
              </div>
              <div>
                <label class="field-label">Correo electrónico *</label>
                <InputText
                  v-model="register.email"
                  type="email"
                  placeholder="tu@correo.com"
                  class="w-full"
                  :class="register.errors.email ? 'p-invalid' : ''"
                  autocomplete="email"
                />
                <p v-if="register.errors.email" class="field-error">
                  {{ register.errors.email }}
                </p>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="field-label">Contraseña *</label>
                  <div class="relative">
                    <InputText
                      v-model="register.password"
                      :type="register.showPwd ? 'text' : 'password'"
                      placeholder="Mín. 8"
                      class="w-full pr-8"
                      :class="register.errors.password ? 'p-invalid' : ''"
                      autocomplete="new-password"
                    />
                    <button
                      type="button"
                      @click="register.showPwd = !register.showPwd"
                      class="pwd-toggle"
                      tabindex="-1"
                    >
                      <i
                        :class="
                          register.showPwd ? 'pi pi-eye-slash' : 'pi pi-eye'
                        "
                        class="text-xs"
                      ></i>
                    </button>
                  </div>
                  <p v-if="register.errors.password" class="field-error">
                    {{ register.errors.password }}
                  </p>
                </div>
                <div>
                  <label class="field-label">Confirmar *</label>
                  <div class="relative">
                    <InputText
                      v-model="register.confirm"
                      :type="register.showConfirm ? 'text' : 'password'"
                      placeholder="Repite"
                      class="w-full pr-8"
                      :class="register.errors.confirm ? 'p-invalid' : ''"
                      autocomplete="new-password"
                    />
                    <button
                      type="button"
                      @click="register.showConfirm = !register.showConfirm"
                      class="pwd-toggle"
                      tabindex="-1"
                    >
                      <i
                        :class="
                          register.showConfirm ? 'pi pi-eye-slash' : 'pi pi-eye'
                        "
                        class="text-xs"
                      ></i>
                    </button>
                  </div>
                  <p v-if="register.errors.confirm" class="field-error">
                    {{ register.errors.confirm }}
                  </p>
                </div>
              </div>
              <Button
                type="submit"
                label="Crear cuenta"
                icon="pi pi-user-plus"
                :loading="register.loading"
                class="w-full"
                size="large"
              />
            </form>
          </div>
        </Transition>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════
         DESKTOP — Sliding panel (efecto AsmrProg)
    ════════════════════════════════════════════════════════ -->
    <div class="hidden lg:block">
      <div class="auth-container" :class="{ active: isActive }">
        <!-- SIGN-UP — Register form (left half, initially hidden behind toggle) -->
        <div class="form-container sign-up">
          <div class="form-scroll">
            <h2 class="form-title pb-5">Crear cuenta</h2>

            <div
              v-if="register.serverError"
              class="w-full mb-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-xs text-red-700"
            >
              <i class="pi pi-exclamation-circle flex-shrink-0 mt-0.5"></i>
              <span>{{ register.serverError }}</span>
            </div>

            <form
              @submit.prevent="handleRegister"
              novalidate
              class="w-full space-y-3"
            >
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="field-label">Primer apellido *</label>
                  <InputText
                    v-model="register.primerApellido"
                    placeholder="Mamani"
                    class="w-full"
                    :class="register.errors.primerApellido ? 'p-invalid' : ''"
                  />
                  <p v-if="register.errors.primerApellido" class="field-error">
                    {{ register.errors.primerApellido }}
                  </p>
                </div>
                <div>
                  <label class="field-label">Segundo apellido</label>
                  <InputText
                    v-model="register.segundoApellido"
                    placeholder="Quispe"
                    class="w-full"
                  />
                </div>
              </div>
              <div>
                <label class="field-label">Nombres *</label>
                <InputText
                  v-model="register.nombres"
                  placeholder="Juan Carlos"
                  class="w-full"
                  :class="register.errors.nombres ? 'p-invalid' : ''"
                />
                <p v-if="register.errors.nombres" class="field-error">
                  {{ register.errors.nombres }}
                </p>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="field-label">Centro de salud *</label>
                  <Select
                    v-model="register.codigo"
                    :options="healthSelectOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Seleccione un centro..."
                    class="w-full"
                    :class="register.errors.codigo ? 'p-invalid' : ''"
                    appendTo="body"
                  />
                  <p v-if="register.errors.codigo" class="field-error">
                    {{ register.errors.codigo }}
                  </p>
                </div>
                <div>
                  <label class="field-label">Código SUS *</label>
                  <InputText
                    v-model="register.susCode"
                    placeholder="Código único SUS"
                    class="w-full"
                    :class="register.errors.susCode ? 'p-invalid' : ''"
                  />
                  <p v-if="register.errors.susCode" class="field-error">
                    {{ register.errors.susCode }}
                  </p>
                </div>
              </div>
              <div>
                <label class="field-label">Correo electrónico *</label>
                <InputText
                  v-model="register.email"
                  type="email"
                  placeholder="tu@correo.com"
                  class="w-full"
                  :class="register.errors.email ? 'p-invalid' : ''"
                  autocomplete="email"
                />
                <p v-if="register.errors.email" class="field-error">
                  {{ register.errors.email }}
                </p>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="field-label">Contraseña *</label>
                  <div class="relative">
                    <InputText
                      v-model="register.password"
                      :type="register.showPwd ? 'text' : 'password'"
                      placeholder="Mín. 8 caracteres"
                      class="w-full pr-8"
                      :class="register.errors.password ? 'p-invalid' : ''"
                      autocomplete="new-password"
                    />
                    <button
                      type="button"
                      @click="register.showPwd = !register.showPwd"
                      class="pwd-toggle"
                      tabindex="-1"
                    >
                      <i
                        :class="
                          register.showPwd ? 'pi pi-eye-slash' : 'pi pi-eye'
                        "
                        class="text-xs"
                      ></i>
                    </button>
                  </div>
                  <p v-if="register.errors.password" class="field-error">
                    {{ register.errors.password }}
                  </p>
                </div>
                <div>
                  <label class="field-label">Confirmar *</label>
                  <div class="relative">
                    <InputText
                      v-model="register.confirm"
                      :type="register.showConfirm ? 'text' : 'password'"
                      placeholder="Repite"
                      class="w-full pr-8"
                      :class="register.errors.confirm ? 'p-invalid' : ''"
                      autocomplete="new-password"
                    />
                    <button
                      type="button"
                      @click="register.showConfirm = !register.showConfirm"
                      class="pwd-toggle"
                      tabindex="-1"
                    >
                      <i
                        :class="
                          register.showConfirm ? 'pi pi-eye-slash' : 'pi pi-eye'
                        "
                        class="text-xs"
                      ></i>
                    </button>
                  </div>
                  <p v-if="register.errors.confirm" class="field-error">
                    {{ register.errors.confirm }}
                  </p>
                </div>
              </div>
              <Button
                type="submit"
                label="Crear cuenta"
                icon="pi pi-user-plus"
                :loading="register.loading"
                class="w-full"
              />
            </form>
          </div>
        </div>

        <!-- SIGN-IN — Login form (left half, initially visible) -->
        <div class="form-container sign-in">
          <div class="form-inner">
            <h2 class="form-title">Bienvenido</h2>
            <p class="form-subtitle">Sistema de Salud G.A.M.P.A.</p>

            <div
              v-if="login.serverError"
              class="w-full mb-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-sm text-red-700"
            >
              <i class="pi pi-exclamation-circle flex-shrink-0 mt-0.5"></i>
              <span>{{ login.serverError }}</span>
            </div>

            <form
              @submit.prevent="handleLogin"
              novalidate
              class="w-full space-y-4"
            >
              <div>
                <label class="field-label">Correo electrónico *</label>
                <InputText
                  v-model="login.email"
                  type="email"
                  placeholder="tu@correo.com"
                  class="w-full"
                  :class="login.errors.email ? 'p-invalid' : ''"
                  autocomplete="email"
                />
                <p v-if="login.errors.email" class="field-error">
                  {{ login.errors.email }}
                </p>
              </div>
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <label class="field-label !mb-0">Contraseña *</label>
                  <RouterLink
                    :to="{ name: 'forgot-password' }"
                    class="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </RouterLink>
                </div>
                <div class="relative">
                  <InputText
                    v-model="login.password"
                    :type="login.showPwd ? 'text' : 'password'"
                    placeholder="Tu contraseña"
                    class="w-full pr-10"
                    :class="login.errors.password ? 'p-invalid' : ''"
                    autocomplete="current-password"
                  />
                  <button
                    type="button"
                    @click="login.showPwd = !login.showPwd"
                    class="pwd-toggle"
                    tabindex="-1"
                  >
                    <i
                      :class="login.showPwd ? 'pi pi-eye-slash' : 'pi pi-eye'"
                      class="text-sm"
                    ></i>
                  </button>
                </div>
                <p v-if="login.errors.password" class="field-error">
                  {{ login.errors.password }}
                </p>
              </div>
              <Button
                type="submit"
                label="Iniciar sesión"
                icon="pi pi-sign-in"
                :loading="login.loading"
                class="w-full"
              />
            </form>
          </div>
        </div>

        <!-- ─── PANEL DESLIZANTE ─── -->
        <div class="toggle-container">
          <div class="toggle">
            <!-- Panel izquierdo: se muestra cuando el registro está activo -->
            <div class="toggle-panel toggle-left">
              <div class="toggle-icon">
                <i class="pi pi-heart text-white text-2xl"></i>
              </div>
              <h1>¡Bienvenido<br />de vuelta!</h1>
              <p>
                Ingresa tus credenciales para acceder al sistema de gestión
                médica
              </p>
              <button @click="setMode(false)" class="toggle-btn">
                Iniciar sesión
              </button>
              <span class="toggle-brand">SIGMED-PA · G.A.M.P.A.</span>
            </div>

            <!-- Panel derecho: se muestra cuando el login está activo (estado inicial) -->
            <div class="toggle-panel toggle-right">
              <div class="toggle-icon">
                <i class="pi pi-heart text-white text-2xl"></i>
              </div>
              <h1>¡Hola,<br />bienvenido!</h1>
              <p>Regístrate y comienza a gestionar tu información de salud</p>
              <button @click="setMode(true)" class="toggle-btn">
                Registrarse
              </button>
              <span class="toggle-brand">SIGMED-PA · G.A.M.P.A.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, inject } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Select from "primevue/select";
import AuthApi from "@/api/AuthApi";
import { useUserStore } from "@/stores/user.js";
import { useHealthStore } from "@/stores/healths";
import { storeToRefs } from "pinia";

const toast = inject("toast");
const router = useRouter();
const route = useRoute();

const userStore = useUserStore();
const { getUserAppointments } = userStore;

const healthStore = useHealthStore();
const { healths } = storeToRefs(healthStore);
const { getHealths } = healthStore;

// ── Modo: false = login, true = register ────────────────
const isActive = ref(route.name === "register");

const setMode = (toRegister) => {
  isActive.value = toRegister;
  router.replace({ name: toRegister ? "register" : "login" });
};

// ── Opciones de centros de salud ────────────────────────
const healthSelectOptions = computed(() => [
  { label: "Seleccione un centro de salud", value: "" },
  ...(healths.value ?? []),
]);

// ── Estado del login ────────────────────────────────────
const login = reactive({
  email: "",
  password: "",
  showPwd: false,
  loading: false,
  serverError: "",
  errors: { email: "", password: "" },
});

// ── Estado del registro ─────────────────────────────────
const register = reactive({
  primerApellido: "",
  segundoApellido: "",
  nombres: "",
  codigo: "",
  susCode: "",
  email: "",
  password: "",
  confirm: "",
  showPwd: false,
  showConfirm: false,
  loading: false,
  serverError: "",
  errors: {},
});

// ── Validaciones login ──────────────────────────────────
const validateLogin = () => {
  login.errors.email = !login.email
    ? "El correo es obligatorio"
    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(login.email)
      ? "Correo electrónico inválido"
      : "";
  login.errors.password = login.password ? "" : "La contraseña es obligatoria";
  return !login.errors.email && !login.errors.password;
};

const handleLogin = async () => {
  if (!validateLogin()) return;
  login.loading = true;
  login.serverError = "";
  try {
    const {
      data: { token },
    } = await AuthApi.login({
      email: login.email,
      password: login.password,
    });
    localStorage.setItem("token", token);
    await getUserAppointments();
    router.push({ name: "my-appointments" });
  } catch (err) {
    login.serverError =
      err?.response?.data?.msg ||
      "Credenciales incorrectas. Intenta nuevamente.";
  } finally {
    login.loading = false;
  }
};

// ── Validaciones registro ───────────────────────────────
const validateRegister = () => {
  const e = {};
  if (!register.primerApellido || register.primerApellido.length < 2)
    e.primerApellido = "Mínimo 2 caracteres";
  if (!register.nombres || register.nombres.length < 2)
    e.nombres = "Mínimo 2 caracteres";
  if (!register.codigo) e.codigo = "Seleccione un centro de salud";
  if (!register.susCode || register.susCode.length < 3)
    e.susCode = "Mínimo 3 caracteres";
  if (!register.email) e.email = "El correo es obligatorio";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(register.email))
    e.email = "Correo electrónico inválido";
  if (!register.password || register.password.length < 8)
    e.password = "Mínimo 8 caracteres";
  if (!register.confirm) e.confirm = "Confirma tu contraseña";
  else if (register.confirm !== register.password)
    e.confirm = "Las contraseñas no coinciden";
  register.errors = e;
  return Object.keys(e).length === 0;
};

const handleRegister = async () => {
  if (!validateRegister()) return;
  register.loading = true;
  register.serverError = "";
  try {
    const { data } = await AuthApi.register({
      primerApellido: register.primerApellido,
      segundoApellido: register.segundoApellido,
      nombres: register.nombres,
      codigo: register.codigo,
      susCode: register.susCode,
      email: register.email,
      password: register.password,
    });
    toast.open({ message: data.msg, type: "success" });
    // Limpiar formulario
    Object.assign(register, {
      primerApellido: "",
      segundoApellido: "",
      nombres: "",
      codigo: "",
      susCode: "",
      email: "",
      password: "",
      confirm: "",
      errors: {},
      serverError: "",
    });
  } catch (err) {
    register.serverError =
      err?.response?.data?.msg || "Error al registrar. Intenta nuevamente.";
  } finally {
    register.loading = false;
  }
};

onMounted(() => {
  getHealths();
});
</script>

<style scoped>
/* ════════════════════════════════════════════
   Página
════════════════════════════════════════════ */
.page-wrapper {
  min-height: 100vh;
  background: linear-gradient(135deg, #dde3f0 0%, #e8effe 50%, #d5e8f8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

/* ════════════════════════════════════════════
   Contenedor desktop (efecto deslizante)
════════════════════════════════════════════ */
.auth-container {
  position: relative;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.13);
  overflow: hidden;
  width: 980px;
  height: 580px; /* altura fija para que height:100% en hijos funcione */
}

/* ── Form containers: posiciones FIJAS y separadas ── */
.form-container {
  position: absolute;
  top: 0;
  height: 100%;
  width: 50%;
  z-index: 1;
}

/* Login: mitad IZQUIERDA — siempre visible */
.sign-in {
  left: 0;
}

/* Registro: mitad DERECHA — cubierto por el toggle al inicio */
.sign-up {
  left: 50%;
}

/* ── Form inner layouts ── */
.form-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 2.75rem;
  height: 100%;
  width: 100%;
}

.form-scroll {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.25rem 2.5rem;
  height: 100%;
  width: 100%;
  overflow-y: auto;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  text-align: center;
  margin-bottom: 0.125rem;
  width: 100%;
}

.form-subtitle {
  font-size: 0.6875rem;
  color: #9ca3af;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 1.5rem;
  width: 100%;
}

/* ════════════════════════════════════════════
   Panel deslizante (toggle)
════════════════════════════════════════════ */
.toggle-container {
  position: absolute;
  top: 0;
  left: 50%;
  width: 50%;
  height: 100%;
  overflow: hidden;
  transition: all 0.6s ease-in-out;
  border-radius: 150px 0 0 100px;
  z-index: 1000;
}

.auth-container.active .toggle-container {
  transform: translateX(-100%);
  border-radius: 0 150px 100px 0;
}

/* El gradiente tiene 200% de ancho: mitad izquierda visible por defecto */
.toggle {
  background: linear-gradient(to right, #4f46e5, #0d9488);
  height: 100%;
  position: relative;
  left: -100%;
  width: 200%;
  transition: all 0.6s ease-in-out;
}

.auth-container.active .toggle {
  transform: translateX(50%);
}

/* Cada panel ocupa el 50% del .toggle (= 50% del contenedor) */
.toggle-panel {
  position: absolute;
  width: 50%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 2.5rem;
  text-align: center;
  top: 0;
  transition: all 0.6s ease-in-out;
}

.toggle-left {
  transform: translateX(-200%);
}

.auth-container.active .toggle-left {
  transform: translateX(0);
}

.toggle-right {
  right: 0;
  transform: translateX(0);
}

.auth-container.active .toggle-right {
  transform: translateX(200%);
}

/* ── Toggle content ── */
.toggle-icon {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.15);
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.75rem;
}

.toggle-panel h1 {
  font-size: 1.625rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.3;
  margin-bottom: 0.875rem;
}

.toggle-panel p {
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.875rem;
  line-height: 1.65;
  margin-bottom: 2rem;
}

.toggle-btn {
  background: transparent;
  border: 2px solid #fff;
  color: #fff;
  border-radius: 50px;
  padding: 0.625rem 2.25rem;
  font-size: 0.8125rem;
  font-weight: 700;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  transition:
    background 0.25s,
    color 0.25s;
  margin-bottom: 2rem;
}

.toggle-btn:hover {
  background: #fff;
  color: #4f46e5;
}

.toggle-brand {
  font-size: 0.6875rem;
  color: rgba(255, 255, 255, 0.45);
  letter-spacing: 0.04em;
}

/* ════════════════════════════════════════════
   Utilidades de formulario
════════════════════════════════════════════ */
.field-label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.375rem;
}

.field-error {
  color: #ef4444;
  font-size: 0.6875rem;
  margin-top: 0.3rem;
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.pwd-toggle {
  position: absolute;
  right: 0.75rem;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  color: #9ca3af;
  transition: color 0.2s;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
}

.pwd-toggle:hover {
  color: #6b7280;
}

/* ════════════════════════════════════════════
   Transición mobile (fade)
════════════════════════════════════════════ */
.fade-form-enter-active,
.fade-form-leave-active {
  transition: all 0.25s ease;
}
.fade-form-enter-from,
.fade-form-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
