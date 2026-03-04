<template>
  <Dialog v-model:visible="visible" :modal="true" :style="{ width: '680px' }">
    <!-- Header -->
    <template #header>
      <div class="flex items-center gap-4">
        <!-- Avatar -->
        <div
          class="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-semibold"
          :class="avatarBg"
        >
          {{ initials }}
        </div>

        <!-- Name + badges -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-3">
            <h3 class="m-0 text-lg font-semibold truncate">
              {{ user?.name ?? "—" }}
            </h3>

            <div class="flex items-center gap-2 ml-2 flex-wrap">
              <span
                v-if="isVerified"
                class="px-2 py-0.5 rounded text-sm bg-green-100 text-green-800 flex items-center gap-1"
              >
                <i class="pi pi-check"></i>
                Verificado
              </span>

              <span
                v-else
                class="px-2 py-0.5 rounded text-sm bg-gray-100 text-gray-800"
              >
                No verificado
              </span>

              <span
                v-if="isAdmin"
                class="px-2 py-0.5 rounded text-sm bg-purple-100 text-purple-800 flex items-center gap-1"
              >
                <i class="pi pi-star"></i>
                Admin
              </span>

              <span
                v-if="isBranchManager"
                class="px-2 py-0.5 rounded text-sm bg-blue-100 text-blue-800 flex items-center gap-1"
              >
                <i class="pi pi-briefcase"></i>
                Branch Manager
              </span>
            </div>
          </div>

          <p class="text-sm text-gray-500 mt-1 truncate">{{ roleLabel }}</p>
        </div>
      </div>
    </template>

    <!-- Body -->
    <div class="mt-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Left (main) -->
        <section class="md:col-span-2 bg-white rounded-lg p-4 shadow-sm">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Email -->
            <div>
              <label class="block text-xs text-gray-500">Correo</label>
              <p class="font-medium text-sm text-gray-700 break-words">
                {{ user?.email ?? "—" }}
              </p>
            </div>

            <!-- SUS code -->
            <div>
              <label class="block text-xs text-gray-500">Código SUS</label>
              <div class="flex items-center gap-2">
                <p class="font-medium text-sm text-gray-700 mr-2">
                  {{ user?.susCode ?? "—" }}
                </p>
                <Button
                  size="small"
                  class="p-button-sm p-button-outlined"
                  @click="copySus"
                  aria-label="Copiar código SUS"
                >
                  <i class="pi pi-copy"></i>
                </Button>
                <span v-if="copied" class="text-xs text-green-600 ml-2"
                  >¡Copiado!</span
                >
              </div>
            </div>

            <!-- Estado -->
            <div>
              <label class="block text-xs text-gray-500"
                >Estado de la cuenta</label
              >
              <p class="font-medium text-sm text-gray-700">
                <span v-if="user?.active">Activo</span>
                <span v-else-if="user?.active === false">Inactivo</span>
                <span v-else>—</span>
              </p>
            </div>

            <!-- Atributos / roles -->
            <div>
              <label class="block text-xs text-gray-500">Atributos</label>
              <p class="font-medium text-sm text-gray-700">{{ roleDetails }}</p>
            </div>

            <!-- Branch / health short -->
            <div class="sm:col-span-2">
              <label class="block text-xs text-gray-500">Centro asignado</label>
              <p class="font-medium text-sm text-gray-700">
                {{ user?.health?.name ?? "No asignado" }}
              </p>
            </div>
          </div>
        </section>

        <!-- Right (health card) -->
        <aside class="bg-white rounded-lg p-4 shadow-sm">
          <label class="block text-xs text-gray-500">Centro de Salud</label>

          <div v-if="user?.health" class="mt-2">
            <h4 class="font-semibold text-sm text-gray-800">
              {{ user.health.name }}
            </h4>

            <dl class="mt-2 text-xs text-gray-500 space-y-2">
              <div>
                <dt>Nivel</dt>
                <dd class="font-medium text-gray-700">
                  {{ user.health.nivel ?? "—" }}
                </dd>
              </div>
              <div>
                <dt class="block text-xs text-gray-500 mt-2">Dirección</dt>
                <dd class="font-medium text-sm text-gray-700">
                  {{ user.health.direccion ?? "—" }}
                </dd>
              </div>
            </dl>
          </div>

          <div v-else class="mt-2 text-sm text-gray-500">No asignado</div>
        </aside>
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          label="Editar"
          icon="pi pi-pencil"
          class="p-button-warning"
          @click="onEdit"
        />
        <Button label="Cerrar" class="p-button-text" @click="close" />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";

// expose open/close, and emit edit event
const emit = defineEmits(["edit"]);
const visible = ref(false);
const user = ref(null);
const copied = ref(false);

// abrir pasándole el objeto usuario
function open(passedUser = null) {
  user.value = passedUser ?? null;
  copied.value = false;
  visible.value = true;
}
function close() {
  visible.value = false;
  user.value = null;
  copied.value = false;
}

// Copiar SUS code al portapapeles y mostrar indicador
async function copySus() {
  try {
    const sus = user.value?.susCode ?? "";
    if (!sus) return;
    await navigator.clipboard.writeText(sus);
    copied.value = true;
    setTimeout(() => (copied.value = false), 1800);
  } catch (err) {
    console.error("copySus error:", err);
  }
}

// Edit -> emit event so parent can open edit modal or route to edit page
function onEdit() {
  if (!user.value) return;
  emit("edit", user.value);
}

// derived values
const initials = computed(() => {
  const name = user.value?.name ?? user.value?.fullName ?? "";
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => (n ? n.charAt(0).toUpperCase() : ""))
    .slice(0, 2)
    .join("");
});

// avatar bg selection
const avatarBg = computed(() => {
  const name = user.value?.name ?? "";
  const code = name
    .split("")
    .reduce((acc, ch) => acc + (ch?.charCodeAt?.(0) ?? 0), 0);
  const colors = [
    "bg-indigo-500",
    "bg-green-500",
    "bg-rose-500",
    "bg-yellow-500",
    "bg-sky-500",
    "bg-pink-600",
  ];
  return colors[code % colors.length];
});

const isVerified = computed(() => !!user.value?.verified);
const isAdmin = computed(() => !!user.value?.admin);
const isBranchManager = computed(() => !!user.value?.branchManager);

const roleLabel = computed(() => {
  if (isAdmin.value) return "Administrador";
  if (isBranchManager.value) return "Gerente de Sucursal";
  return "Usuario";
});

const roleDetails = computed(() => {
  const parts = [];
  if (isAdmin.value) parts.push("Admin");
  if (isBranchManager.value) parts.push("Branch Manager");
  if (isVerified.value) parts.push("Verificado");
  return parts.length ? parts.join(" • ") : "Usuario estándar";
});

const prettyJson = computed(() => {
  try {
    return JSON.stringify(user.value ?? {}, null, 2);
  } catch {
    return String(user.value ?? "");
  }
});

defineExpose({ open, close });
</script>

<style scoped>
pre {
  max-height: 240px;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
