<script setup>
import { ref, computed, onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { RouterLink } from "vue-router";

const userAuth = useUserStore();
const { user } = storeToRefs(userAuth);

const isAdmin       = computed(() => user.value?.admin         === true);
const isBranchMgr   = computed(() => user.value?.branchManager === true);
const isStaff       = computed(() => isAdmin.value || isBranchMgr.value);

const collapsed  = ref(false); // sólo desktop
const mobileOpen = ref(false); // drawer mobile

/* ─── Secciones de navegación por rol ─────────────── */
const navSections = computed(() => {
  const sections = [
    {
      id: "principal",
      title: "Principal",
      links: [
        { name: "admin-dashboard",    icon: "pi-chart-bar",     label: "Dashboard"        },
      ],
    },
    {
      id: "clinico",
      title: "Clínico",
      links: [
        { name: "admin-appointments", icon: "pi-calendar",       label: "Citas"            },
        { name: "admin-calendar",     icon: "pi-calendar-clock", label: "Calendario"       },
        { name: "my-health-records",  icon: "pi-file-edit",      label: "Historial Clínico"},
      ],
    },
    {
      id: "personas",
      title: "Personas",
      links: [
        { name: "patients-list",      icon: "pi-users",          label: "Pacientes"        },
        { name: "doctors-list",       icon: "pi-heart",          label: "Médicos"          },
        ...(isStaff.value
          ? [{ name: "users", icon: "pi-user-edit", label: "Usuarios" }]
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
  ];
  return sections;
});

/* ─── Datos del usuario ────────────────────────────── */
const roleLabel = computed(() => {
  if (isAdmin.value)    return "Administrador";
  if (isBranchMgr.value) return "Gestor";
  return "Usuario";
});

const roleBadgeClass = computed(() => {
  if (isAdmin.value)    return "bg-blue-100 text-blue-700";
  if (isBranchMgr.value) return "bg-violet-100 text-violet-700";
  return "bg-gray-100 text-gray-600";
});

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : (name.slice(0, 2)).toUpperCase() || "?";
}

onMounted(() => userAuth.getUser());
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-gray-50">

    <!-- ── Backdrop mobile ────────────────────────────── -->
    <Transition name="t-fade">
      <div
        v-if="mobileOpen"
        class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        @click="mobileOpen = false"
      />
    </Transition>

    <!-- ═══════════════════ SIDEBAR ═══════════════════ -->
    <aside
      class="fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-100 shadow-lg
             transition-all duration-300 ease-in-out overflow-hidden"
      :class="[
        collapsed ? 'w-[68px]' : 'w-64',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ]"
    >
      <!-- Logo -->
      <div
        class="flex items-center gap-3 h-16 px-4 border-b border-gray-100 shrink-0"
        :class="collapsed && 'justify-center px-2'"
      >
        <span
          class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600
                 flex items-center justify-center shrink-0 shadow-md shadow-blue-200"
        >
          <i class="pi pi-heart text-white text-sm"></i>
        </span>
        <div v-show="!collapsed" class="overflow-hidden whitespace-nowrap">
          <p class="font-bold text-gray-800 text-sm leading-none">MQV Salud</p>
          <p class="text-[11px] text-gray-400 mt-0.5 leading-none">Sistema médico</p>
        </div>
      </div>

      <!-- Navegación -->
      <nav class="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5">
        <template v-for="(section, si) in navSections" :key="section.id">

          <!-- Título de sección -->
          <div
            v-if="!collapsed"
            class="px-3 pb-1 select-none"
            :class="si === 0 ? 'pt-1' : 'pt-4'"
          >
            <p class="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              {{ section.title }}
            </p>
          </div>
          <div v-else class="my-2 mx-1 border-t border-gray-100" />

          <!-- Link individual -->
          <RouterLink
            v-for="link in section.links"
            :key="link.name"
            :to="{ name: link.name }"
            class="flex items-center gap-3 rounded-xl text-sm font-medium
                   text-gray-500 border-l-[3px] border-transparent
                   hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200
                   transition-all duration-150 group"
            active-class="!bg-blue-50 !text-blue-700 !border-blue-500 font-semibold"
            :class="collapsed ? 'justify-center py-3 px-0 mx-1' : 'py-2.5 px-3'"
            v-tooltip.right="collapsed ? link.label : null"
            @click="mobileOpen = false"
          >
            <i
              class="pi text-[17px] shrink-0 transition-transform duration-150
                     group-hover:scale-110"
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
      <div class="border-t border-gray-100 p-3 shrink-0">

        <!-- Expandido -->
        <div v-show="!collapsed" class="flex items-center gap-3 rounded-xl px-2 py-2">
          <div
            class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500
                   flex items-center justify-center text-white font-bold text-sm shrink-0 select-none"
          >
            {{ getInitials(user?.name ?? '') }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-800 truncate leading-tight">
              {{ user?.name }}
            </p>
            <span
              class="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5"
              :class="roleBadgeClass"
            >
              {{ roleLabel }}
            </span>
          </div>
          <button
            v-tooltip.top="'Cerrar sesión'"
            class="w-8 h-8 rounded-lg flex items-center justify-center
                   text-gray-400 hover:bg-red-50 hover:text-red-500 transition shrink-0"
            @click="userAuth.logout"
          >
            <i class="pi pi-sign-out text-sm"></i>
          </button>
        </div>

        <!-- Colapsado -->
        <div v-show="collapsed" class="flex flex-col items-center gap-2 py-1">
          <div
            class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500
                   flex items-center justify-center text-white font-bold text-sm select-none"
            v-tooltip.right="user?.name"
          >
            {{ getInitials(user?.name ?? '') }}
          </div>
          <button
            v-tooltip.right="'Cerrar sesión'"
            class="w-9 h-9 rounded-xl flex items-center justify-center
                   text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
            @click="userAuth.logout"
          >
            <i class="pi pi-sign-out text-sm"></i>
          </button>
        </div>
      </div>

      <!-- ── Toggle colapsar (solo desktop) ─────────── -->
      <button
        class="hidden lg:flex absolute -right-3 top-[72px] w-6 h-6 bg-white
               border border-gray-200 rounded-full items-center justify-center
               shadow-sm hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600
               text-gray-400 transition-all z-10"
        @click="collapsed = !collapsed"
      >
        <i
          class="pi text-[10px] transition-transform duration-300"
          :class="collapsed ? 'pi-chevron-right' : 'pi-chevron-left'"
        ></i>
      </button>
    </aside>

    <!-- ═══════════════ ÁREA DE CONTENIDO ═══════════ -->
    <div
      class="flex flex-col flex-1 min-w-0 overflow-hidden transition-[margin] duration-300 ease-in-out"
      :class="collapsed ? 'lg:ml-[68px]' : 'lg:ml-64'"
    >
      <!-- Top bar mobile -->
      <header
        class="lg:hidden flex items-center gap-3 h-14 px-4 bg-white border-b
               border-gray-100 shadow-sm shrink-0 z-30"
      >
        <button
          class="w-9 h-9 rounded-xl flex items-center justify-center
                 hover:bg-gray-100 transition text-gray-600"
          @click="mobileOpen = true"
        >
          <i class="pi pi-bars text-lg"></i>
        </button>

        <div class="flex items-center gap-2">
          <span
            class="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600
                   flex items-center justify-center shadow-sm"
          >
            <i class="pi pi-heart text-white text-xs"></i>
          </span>
          <span class="font-bold text-blue-700 text-sm">MQV Salud</span>
        </div>

        <div class="ml-auto flex items-center gap-2">
          <div
            class="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500
                   flex items-center justify-center text-white font-bold text-xs select-none"
          >
            {{ getInitials(user?.name ?? '') }}
          </div>
          <button
            class="w-9 h-9 rounded-xl flex items-center justify-center
                   text-red-400 hover:bg-red-50 transition"
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
.t-fade-leave-active { transition: opacity 0.25s ease; }
.t-fade-enter-from,
.t-fade-leave-to     { opacity: 0; }
</style>