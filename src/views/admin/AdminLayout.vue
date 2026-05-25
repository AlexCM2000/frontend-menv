<script setup>
import { ref, computed, onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { RouterLink, useRoute } from "vue-router";

const userAuth = useUserStore();
const { user, getUserName } = storeToRefs(userAuth);
const route = useRoute();

const isAdmin      = computed(() => user.value?.admin === true);
const isBranchMgr  = computed(() => user.value?.branchManager === true);
const isDoctor     = computed(() => user.value?.doctor === true);
const isPharmacist = computed(() => user.value?.pharmacist === true);
const isStaff      = computed(() => isAdmin.value || isBranchMgr.value);

const collapsed  = ref(false);
const mobileOpen = ref(false);

// Secciones de navegación por rol
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
        ...(!isPharmacist.value
          ? [
              { name: "admin-appointments", icon: "pi-calendar",       label: "Citas" },
              { name: "admin-calendar",     icon: "pi-calendar-clock", label: "Calendario" },
            ]
          : []),
        { name: "my-health-records", icon: "pi-file-edit", label: "Historial Clínico" },
      ],
    },
    {
      id: "personas",
      title: "Personas",
      links: [
        ...(isStaff.value || isDoctor.value || isPharmacist.value
          ? [{ name: "patients-list", icon: "pi-users",    label: "Pacientes" }]
          : []),
        ...(isStaff.value
          ? [{ name: "doctors-list", icon: "pi-heart",     label: "Perfiles médicos" }]
          : []),
        ...(isStaff.value
          ? [{ name: "users",        icon: "pi-user-edit", label: "Usuarios" }]
          : []),
      ],
    },
    ...(isStaff.value
      ? [{
          id: "config",
          title: "Configuración",
          links: [
            { name: "admin-categories", icon: "pi-tag",  label: "Categorías" },
            { name: "admin-services",   icon: "pi-list", label: "Servicios"  },
          ],
        }]
      : []),
    ...(isStaff.value || isPharmacist.value
      ? [{
          id: "farmacia",
          title: "Farmacia",
          links: [
            { name: "admin-stock",         icon: "pi-box",       label: "Stock"   },
            { name: "admin-prescriptions", icon: "pi-file-edit", label: "Recetas" },
          ],
        }]
      : []),
    ...(isAdmin.value
      ? [{
          id: "sistema",
          title: "Sistema",
          links: [
            { name: "admin-audit",        icon: "pi-shield",    label: "Auditoría"    },
            { name: "admin-cdss-config",  icon: "pi-sliders-h", label: "Config. CDSS" },
          ],
        }]
      : []),
  ];
  return sections;
});

// Datos del usuario
const roleLabel = computed(() => {
  if (isAdmin.value)      return "Administrador";
  if (isBranchMgr.value)  return "Gestor";
  if (isDoctor.value)     return "Médico";
  if (isPharmacist.value) return "Farmacéutico";
  return "Usuario";
});

const roleBadgeClass = computed(() => {
  if (isAdmin.value)      return "bg-sky-100 text-sky-700";
  if (isBranchMgr.value)  return "bg-violet-100 text-violet-700";
  if (isDoctor.value)     return "bg-teal-100 text-teal-700";
  if (isPharmacist.value) return "bg-emerald-100 text-emerald-700";
  return "bg-gray-100 text-gray-600";
});

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase() || "?";
}

// Breadcrumbs
const breadcrumbMap = {
  "admin-dashboard":      [{ label: "Principal" }, { label: "Dashboard" }],
  "admin-appointments":   [{ label: "Clínico" },   { label: "Citas" }],
  "admin-calendar":       [{ label: "Clínico" },   { label: "Calendario" }],
  "my-health-records":    [{ label: "Clínico" },   { label: "Historial Clínico" }],
  "health-record-detail": [
    { label: "Clínico" },
    { label: "Historial Clínico", to: "my-health-records" },
    { label: "Detalle" },
  ],
  "patients-list":    [{ label: "Personas" },      { label: "Pacientes" }],
  "doctors-list":     [{ label: "Personas" },      { label: "Perfiles médicos" }],
  "users":            [{ label: "Personas" },      { label: "Usuarios" }],
  "admin-categories": [{ label: "Configuración" }, { label: "Categorías" }],
  "admin-services":   [{ label: "Configuración" }, { label: "Servicios" }],
  "admin-profile":    [{ label: "Mi perfil" }],
  "admin-audit":          [{ label: "Sistema" },  { label: "Auditoría"    }],
  "admin-cdss-config":    [{ label: "Sistema" },  { label: "Config. CDSS" }],
  "admin-stock":          [{ label: "Farmacia" }, { label: "Stock"        }],
  "admin-prescriptions":  [{ label: "Farmacia" }, { label: "Recetas"      }],
};

const breadcrumbs = computed(() => breadcrumbMap[route.name] ?? []);

// Toggle sidebar
const toggleSidebar = () => {
  if (typeof window !== "undefined" && window.innerWidth >= 1024) {
    collapsed.value = !collapsed.value;
  } else {
    mobileOpen.value = true;
  }
};

onMounted(() => userAuth.getUser());
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-gray-50">

    <!-- Backdrop mobile -->
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
      <!-- Logo -->
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
          <p class="font-bold text-white text-sm leading-none tracking-wide">SIGMED-PA</p>
          <p class="text-[11px] text-slate-500 mt-0.5 leading-none">Sistema médico</p>
        </div>
      </div>

      <!-- Navegación -->
      <nav class="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5 nav-scroll">
        <template v-for="(section, si) in navSections" :key="section.id">
          <!-- Título de sección -->
          <div
            v-if="!collapsed"
            class="px-3 pb-1 select-none"
            :class="si === 0 ? 'pt-1' : 'pt-4'"
          >
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">
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
            <span v-show="!collapsed" class="truncate transition-opacity duration-200">
              {{ link.label }}
            </span>
          </RouterLink>
        </template>
      </nav>
    </aside>

    <!-- ═══════════════ ÁREA DE CONTENIDO ═══════════ -->
    <div
      class="flex flex-col flex-1 min-w-0 overflow-hidden transition-[margin] duration-300 ease-in-out"
      :class="collapsed ? 'lg:ml-[68px]' : 'lg:ml-64'"
    >

      <!-- Header principal -->
      <header class="flex items-center gap-3 h-16 px-4 bg-white border-b border-gray-100 shadow-sm shrink-0 z-30">

        <!-- Toggle sidebar / menú mobile -->
        <button
          class="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-sky-600 transition shrink-0"
          v-tooltip.bottom="collapsed ? 'Expandir panel' : 'Contraer panel'"
          @click="toggleSidebar"
        >
          <i class="pi pi-bars text-lg"></i>
        </button>

        <!-- Breadcrumbs -->
        <div class="flex-1 min-w-0 overflow-hidden">
          <!-- Ruta completa en pantallas sm+ -->
          <nav class="hidden sm:flex items-center gap-0.5 text-sm">
            <template v-for="(crumb, i) in breadcrumbs" :key="i">
              <span v-if="i > 0" class="px-1 text-gray-300 shrink-0 select-none">/</span>

              <!-- Crumb con enlace (nivel intermedio navegable) -->
              <RouterLink
                v-if="crumb.to"
                :to="{ name: crumb.to }"
                class="px-1 py-0.5 rounded text-gray-500 hover:text-sky-600 hover:bg-sky-50 transition whitespace-nowrap"
              >
                {{ crumb.label }}
              </RouterLink>

              <!-- Crumb intermedio sin enlace -->
              <span
                v-else-if="i < breadcrumbs.length - 1"
                class="px-1 text-gray-400 whitespace-nowrap"
              >
                {{ crumb.label }}
              </span>

              <!-- Crumb final (página actual) -->
              <span v-else class="px-1 text-gray-700 font-semibold whitespace-nowrap">
                {{ crumb.label }}
              </span>
            </template>
          </nav>

          <!-- Solo la página actual en mobile -->
          <p class="sm:hidden text-sm font-semibold text-gray-700 truncate">
            {{ breadcrumbs[breadcrumbs.length - 1]?.label ?? "SIGMED-PA" }}
          </p>
        </div>

        <!-- Perfil de usuario -->
        <div class="flex items-center gap-1.5 shrink-0">
          <!-- Nombre + cargo (solo md+) -->
          <div class="hidden md:block text-right mr-1">
            <p class="text-sm font-semibold text-gray-800 leading-tight truncate max-w-[180px]">
              {{ getUserName }}
            </p>
            <span
              class="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5"
              :class="roleBadgeClass"
            >
              {{ roleLabel }}
            </span>
          </div>

          <!-- Avatar -->
          <div
            class="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0 select-none shadow-sm"
            v-tooltip.bottom="getUserName"
          >
            {{ getInitials(getUserName) }}
          </div>

          <!-- Editar perfil (oculto en xs) -->
          <RouterLink
            :to="{ name: 'admin-profile' }"
            v-tooltip.bottom="'Mi perfil'"
            class="hidden sm:flex w-9 h-9 rounded-xl items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-sky-600 transition"
          >
            <i class="pi pi-user-edit text-sm"></i>
          </RouterLink>

          <!-- Cerrar sesión -->
          <button
            v-tooltip.bottom="'Cerrar sesión'"
            class="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition"
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
.t-fade-leave-active { transition: opacity 0.25s ease; }
.t-fade-enter-from,
.t-fade-leave-to     { opacity: 0; }

/* Fondo sidebar azul-gris oscuro neutro */
.sidebar { background-color: #1e293b; }

/* Scrollbar sutil en el área de navegación */
.nav-scroll::-webkit-scrollbar       { width: 3px; }
.nav-scroll::-webkit-scrollbar-track { background: transparent; }
.nav-scroll::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.1);
  border-radius: 4px;
}
.nav-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }

/* Hover de los links de navegación en tema oscuro */
.nav-link:hover {
  background-color: rgba(255,255,255,0.05);
  color: #f1f5f9;
  border-left-color: rgba(255,255,255,0.15);
}
</style>
