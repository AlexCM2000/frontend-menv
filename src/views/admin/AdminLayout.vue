<script setup>
import { ref, computed, onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { RouterLink } from "vue-router";

const userAuth = useUserStore();
const { user, getUserName } = storeToRefs(userAuth);

const isAdmin = computed(() => user.value?.admin === true);
const isBranchMgr = computed(() => user.value?.branchManager === true);
const isDoctor = computed(() => user.value?.doctor === true);
const isStaff = computed(() => isAdmin.value || isBranchMgr.value);

const collapsed = ref(false); // sólo desktop
const mobileOpen = ref(false); // drawer mobile

/* ─── Secciones de navegación por rol ─────────────── */
const navSections = computed(() => {
  const sections = [
    {
      id: "principal",
      title: "Principal",
      links: [
        { name: "admin-dashboard", icon: "pi-chart-bar", label: "Dashboard" },
      ],
    },
    {
      id: "clinico",
      title: "Clínico",
      links: [
        { name: "admin-appointments", icon: "pi-calendar", label: "Citas" },
        {
          name: "admin-calendar",
          icon: "pi-calendar-clock",
          label: "Calendario",
        },
        {
          name: "my-health-records",
          icon: "pi-file-edit",
          label: "Historial Clínico",
        },
      ],
    },
    {
      id: "personas",
      title: "Personas",
      links: [
        ...(isStaff.value || isDoctor.value
          ? [{ name: "patients-list", icon: "pi-users", label: "Pacientes" }]
          : []),
        ...(isStaff.value
          ? [
              {
                name: "doctors-list",
                icon: "pi-heart",
                label: "Perfiles médicos",
              },
            ]
          : []),
        ...(isStaff.value
          ? [{ name: "users", icon: "pi-user-edit", label: "Usuarios" }]
          : []),
      ],
    },
    ...(isStaff.value
      ? [
          {
            id: "config",
            title: "Configuración",
            links: [
              { name: "admin-categories", icon: "pi-tag", label: "Categorías" },
              { name: "admin-services", icon: "pi-list", label: "Servicios" },
            ],
          },
        ]
      : []),
  ];
  return sections;
});

/* ─── Datos del usuario ────────────────────────────── */
const roleLabel = computed(() => {
  if (isAdmin.value) return "Administrador";
  if (isBranchMgr.value) return "Gestor";
  if (isDoctor.value) return "Médico";
  return "Usuario";
});

/* Badges adaptados al tema oscuro del sidebar */
const roleBadgeClass = computed(() => {
  if (isAdmin.value) return "bg-sky-500/20 text-sky-300";
  if (isBranchMgr.value) return "bg-violet-500/20 text-violet-300";
  if (isDoctor.value) return "bg-teal-500/20 text-teal-300";
  return "bg-slate-600/60 text-slate-300";
});

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase() || "?";
}

onMounted(() => userAuth.getUser());
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-gray-50">
    <!-- ── Backdrop mobile ────────────────────────────── -->
    <Transition name="t-fade">
      <div
        v-if="mobileOpen"
        class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        @click="mobileOpen = false"
      />
    </Transition>

    <!-- ═══════════════════ SIDEBAR ═══════════════════ -->
    <aside
      class="sidebar fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/[0.07] shadow-2xl transition-all duration-300 ease-in-out overflow-hidden"
      :class="[
        collapsed ? 'w-[68px]' : 'w-64',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ]"
    >
      <!-- ── Logo ────────────────────────────────────── -->
      <div
        class="flex items-center gap-3 h-16 px-4 border-b border-white/[0.07] shrink-0"
        :class="collapsed && 'justify-center px-2'"
      >
        <img
          src="/img/empresa/SIGMED-PA_icono_claro.svg"
          class="w-9 h-9 shrink-0"
          alt="SIGMED-PA"
        />
        <div v-show="!collapsed" class="overflow-hidden whitespace-nowrap">
          <p class="font-bold text-white text-sm leading-none tracking-wide">
            SIGMED-PA
          </p>
          <p class="text-[11px] text-slate-500 mt-0.5 leading-none">
            Sistema médico
          </p>
        </div>
      </div>

      <!-- ── Navegación ──────────────────────────────── -->
      <nav
        class="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5 nav-scroll"
      >
        <template v-for="(section, si) in navSections" :key="section.id">
          <!-- Título de sección -->
          <div
            v-if="!collapsed"
            class="px-3 pb-1 select-none"
            :class="si === 0 ? 'pt-1' : 'pt-4'"
          >
            <p
              class="text-[10px] font-bold uppercase tracking-widest text-slate-400"
            >
              {{ section.title }}
            </p>
          </div>
          <div v-else class="my-2 mx-1 border-t border-white/[0.07]" />

          <!-- Link individual -->
          <RouterLink
            v-for="link in section.links"
            :key="link.name"
            :to="{ name: link.name }"
            class="nav-link flex items-center gap-3 rounded-lg text-sm font-medium text-slate-400 border-l-[3px] border-transparent transition-all duration-150 group"
            active-class="!bg-sky-400/10 !text-sky-300 !border-sky-400 font-semibold"
            :class="collapsed ? 'justify-center py-3 px-0 mx-1' : 'py-2.5 px-3'"
            v-tooltip.right="collapsed ? link.label : null"
            @click="mobileOpen = false"
          >
            <i
              class="pi text-[17px] shrink-0 transition-transform duration-150 group-hover:scale-105"
              :class="link.icon"
            ></i>
            <span
              v-show="!collapsed"
              class="truncate transition-opacity duration-200"
            >
              {{ link.label }}
            </span>
          </RouterLink>
        </template>
      </nav>

      <!-- ── Perfil de usuario ──────────────────────── -->
      <div class="border-t border-white/[0.07] p-3 shrink-0">
        <!-- Expandido -->
        <div
          v-show="!collapsed"
          class="flex items-center gap-2.5 rounded-xl px-2.5 py-2 bg-white/[0.04]"
        >
          <div
            class="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0 select-none shadow-sm"
          >
            {{ getInitials(getUserName) }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-white truncate leading-tight">
              {{ getUserName }}
            </p>
            <span
              class="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5"
              :class="roleBadgeClass"
            >
              {{ roleLabel }}
            </span>
          </div>
          <RouterLink
            :to="{ name: 'admin-profile' }"
            v-tooltip.top="'Mi perfil'"
            class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-white/10 hover:text-white transition-all shrink-0"
          >
            <i class="pi pi-user-edit text-sm"></i>
          </RouterLink>
          <button
            v-tooltip.top="'Cerrar sesión'"
            class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-red-500/15 hover:text-red-400 transition-all shrink-0"
            @click="userAuth.logout"
          >
            <i class="pi pi-sign-out text-sm"></i>
          </button>
        </div>

        <!-- Colapsado -->
        <div v-show="collapsed" class="flex flex-col items-center gap-2 py-1">
          <div
            class="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm select-none shadow-sm"
            v-tooltip.right="getUserName"
          >
            {{ getInitials(getUserName) }}
          </div>
          <RouterLink
            :to="{ name: 'admin-profile' }"
            v-tooltip.right="'Mi perfil'"
            class="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-white/10 hover:text-white transition-all"
          >
            <i class="pi pi-user-edit text-sm"></i>
          </RouterLink>
          <button
            v-tooltip.right="'Cerrar sesión'"
            class="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-red-500/15 hover:text-red-400 transition-all"
            @click="userAuth.logout"
          >
            <i class="pi pi-sign-out text-sm"></i>
          </button>
        </div>
      </div>

    </aside>

    <!-- ── Toggle colapsar (solo desktop) ─────────── -->
    <!-- Fuera del <aside> para evitar el recorte de overflow-hidden -->
    <button
      class="sidebar-toggle hidden lg:flex fixed top-[72px] z-[51] w-7 h-7 rounded-full bg-white border border-slate-200 items-center justify-center text-slate-400 hover:bg-sky-50 hover:border-sky-400 hover:text-sky-600"
      :style="{
        left: collapsed ? '54px' : '242px',
        transition: 'left 0.3s ease-in-out, background-color 0.15s, border-color 0.15s, color 0.15s',
      }"
      v-tooltip.right="collapsed ? 'Expandir panel' : 'Contraer panel'"
      @click="collapsed = !collapsed"
    >
      <i
        class="pi text-[11px]"
        :class="collapsed ? 'pi-chevron-right' : 'pi-chevron-left'"
      ></i>
    </button>

    <!-- ═══════════════ ÁREA DE CONTENIDO ═══════════ -->
    <div
      class="flex flex-col flex-1 min-w-0 overflow-hidden transition-[margin] duration-300 ease-in-out"
      :class="collapsed ? 'lg:ml-[68px]' : 'lg:ml-64'"
    >
      <!-- Top bar mobile -->
      <header
        class="lg:hidden flex items-center gap-3 h-14 px-4 bg-white border-b border-gray-100 shadow-sm shrink-0 z-30"
      >
        <button
          class="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition text-gray-600"
          @click="mobileOpen = true"
        >
          <i class="pi pi-bars text-lg"></i>
        </button>

        <div class="flex items-center gap-2">
          <img
            src="/img/empresa/SIGMED-PA_icono_oscuro.svg"
            class="w-7 h-7 rounded-lg"
            alt="SIGMED-PA"
          />
          <span class="font-bold text-slate-800 text-sm">SIGMED-PA</span>
        </div>

        <div class="ml-auto flex items-center gap-2">
          <div
            class="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs select-none"
          >
            {{ getInitials(getUserName) }}
          </div>
          <button
            class="w-9 h-9 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-50 transition"
            v-tooltip.left="'Cerrar sesión'"
            @click="userAuth.logout"
          >
            <i class="pi pi-sign-out text-sm"></i>
          </button>
        </div>
      </header>

      <!-- Contenido de la vista -->
      <main class="flex-1 overflow-y-auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Backdrop fade */
.t-fade-enter-active,
.t-fade-leave-active {
  transition: opacity 0.25s ease;
}
.t-fade-enter-from,
.t-fade-leave-to {
  opacity: 0;
}

/* Fondo sidebar azul-gris oscuro neutro */
.sidebar {
  background-color: #1e293b;
}

/* Scrollbar sutil en el área de navegación */
.nav-scroll::-webkit-scrollbar {
  width: 3px;
}
.nav-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.nav-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}
.nav-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.18);
}

/* Botón de colapsar/expandir */
.sidebar-toggle {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.14), 0 0 0 1px rgba(0, 0, 0, 0.04);
}
.sidebar-toggle:hover {
  box-shadow: 0 3px 12px rgba(56, 189, 248, 0.2), 0 0 0 1px rgba(56, 189, 248, 0.15);
}

/* Hover de los links de navegación en tema oscuro */
.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: #f1f5f9;
  border-left-color: rgba(255, 255, 255, 0.15);
}
</style>
