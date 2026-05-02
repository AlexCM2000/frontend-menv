<template>
  <div class="min-h-screen flex">

    <!-- ═══════════════════════════════════════════
         PANEL IZQUIERDO — Branding (solo desktop)
    ════════════════════════════════════════════════ -->
    <aside class="hidden lg:flex lg:w-[42%] xl:w-2/5 flex-col bg-gradient-to-br from-indigo-900 via-indigo-700 to-teal-600 relative overflow-hidden">
      <!-- Círculos decorativos -->
      <div class="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/5"></div>
      <div class="absolute top-1/3 -left-16 w-56 h-56 rounded-full bg-teal-500/10"></div>
      <div class="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-indigo-500/10"></div>
      <div class="absolute bottom-24 -right-12 w-40 h-40 rounded-full bg-white/5"></div>

      <!-- Contenido -->
      <div class="relative z-10 flex flex-col h-full p-10">
        <!-- Logo -->
        <div class="flex items-center gap-3 mb-14">
          <img src="/img/empresa/SIGMED-PA_icono_claro.svg" class="w-12 h-12 shrink-0" alt="SIGMED-PA" />
          <div>
            <p class="text-white font-bold text-lg leading-tight">SIGMED-PA</p>
            <p class="text-indigo-300 text-xs">Sistema de gestión médica</p>
          </div>
        </div>

        <!-- Titular -->
        <div class="mb-10">
          <h1 class="text-white text-3xl font-bold leading-snug mb-4">
            Gestión médica digital para tu municipio
          </h1>
          <p class="text-indigo-200 text-sm leading-relaxed">
            Plataforma integral para centros de salud de primer nivel. Administra citas,
            historiales clínicos y pacientes desde un único sistema seguro.
          </p>
        </div>

        <!-- Características -->
        <ul class="space-y-4">
          <li v-for="f in features" :key="f.text" class="flex items-center gap-3">
            <div class="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10">
              <i :class="f.icon" class="text-teal-300 text-sm"></i>
            </div>
            <span class="text-indigo-100 text-sm">{{ f.text }}</span>
          </li>
        </ul>

        <!-- Spacer -->
        <div class="flex-1"></div>

        <!-- Footer panel -->
        <div class="border-t border-white/10 pt-6">
          <p class="text-indigo-400 text-xs font-medium">G.A.M.P.A. — La Paz, Bolivia</p>
          <p class="text-indigo-500 text-xs mt-0.5">© 2025 Todos los derechos reservados</p>
        </div>
      </div>
    </aside>

    <!-- ═══════════════════════════════════════════
         PANEL DERECHO — Formulario
    ════════════════════════════════════════════════ -->
    <main class="flex-1 flex flex-col min-h-screen bg-slate-50 overflow-y-auto">
      <!-- Header móvil (oculto en desktop) -->
      <div class="lg:hidden flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-indigo-700 to-teal-600 shadow-sm">
        <img src="/img/empresa/SIGMED-PA_icono_claro.svg" class="w-9 h-9" alt="SIGMED-PA" />
        <div>
          <p class="text-white font-semibold text-sm leading-tight">SIGMED-PA</p>
          <p class="text-indigo-200 text-xs">G.A.M.P.A. — La Paz, Bolivia</p>
        </div>
      </div>

      <!-- Área del formulario -->
      <div class="flex-1 flex items-start lg:items-center justify-center px-5 sm:px-8 py-10">
        <div class="w-full" :class="route.name === 'register' ? 'max-w-xl' : 'max-w-md'">
          <RouterView />
        </div>
      </div>

      <!-- Footer inferior -->
      <div class="py-4 text-center">
        <p class="text-xs text-gray-400">
          ¿Necesitas ayuda? Contacta al administrador de tu centro de salud
        </p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";

const route = useRoute();

const features = [
  { icon: "pi pi-calendar-clock", text: "Gestión de citas médicas en tiempo real" },
  { icon: "pi pi-file-edit",      text: "Historiales clínicos digitales seguros" },
  { icon: "pi pi-users",          text: "Administración completa de pacientes" },
  { icon: "pi pi-shield",         text: "Acceso seguro con verificación de identidad" },
];
</script>