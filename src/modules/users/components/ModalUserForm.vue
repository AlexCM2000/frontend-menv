<template>
  <Dialog
    v-model:visible="visible"
    modal
    :closable="!saving"
    :style="{ width: '600px' }"
    :breakpoints="{ '768px': '95vw' }"
    :pt="{
      header: { class: 'border-b border-gray-100 pb-0 pt-5 px-6' },
      content: { class: 'px-6 py-5' },
      footer: { class: 'border-t border-gray-100 px-6 py-4' },
    }"
  >
    <!-- ── HEADER del Dialog ── -->
    <template #header>
      <div class="flex items-center gap-3">
        <div
          class="w-9 h-9 rounded-lg flex items-center justify-center"
          :class="isEdit ? 'bg-amber-50' : 'bg-indigo-50'"
        >
          <i
            class="pi text-base"
            :class="
              isEdit
                ? 'pi-pencil text-amber-500'
                : 'pi-user-plus text-indigo-500'
            "
          ></i>
        </div>
        <div>
          <h2 class="text-base font-semibold text-gray-800 leading-tight">
            {{ isEdit ? "Editar usuario" : "Nuevo usuario" }}
          </h2>
          <p class="text-xs text-gray-400 mt-0.5">
            {{
              isEdit
                ? "Modifica los datos del usuario"
                : "Completa el formulario para crear un usuario"
            }}
          </p>
        </div>
      </div>
    </template>

    <!-- ── CONTENIDO: FormKit ── -->
    <FormKit
      id="userForm"
      type="form"
      v-model="formData"
      ref="formRef"
      :actions="false"
      @submit="handleSubmit"
      incomplete-message="Revisa los campos marcados en rojo"
    >
      <div class="space-y-5">
        <!-- Nombre completo -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">
            Nombre completo <span class="text-red-500">*</span>
          </label>
          <FormKit
            type="text"
            name="name"
            placeholder="Ej. María García López"
            validation="required|length:3"
            :validation-messages="{
              required: 'El nombre es obligatorio',
              length: 'Mínimo 3 caracteres',
            }"
            input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
            messages-class="mt-1 text-xs text-red-500"
          />
        </div>

        <!-- Centro de salud -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">
            Centro de atención <span class="text-red-500">*</span>
          </label>

          <div
            v-if="loadingHealths"
            class="flex items-center gap-2 py-2.5 text-sm text-gray-500"
          >
            <i class="pi pi-spin pi-spinner text-indigo-400"></i>
            Cargando centros...
          </div>

          <template v-else>
            <FormKit
              v-if="healthOptions.length"
              type="select"
              name="health"
              :options="[
                { label: 'Seleccione un centro', value: '' },
                ...healthOptions,
              ]"
              validation="required"
              :validation-messages="{
                required: 'Debe seleccionar un centro de atención',
              }"
              input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition bg-white"
              messages-class="mt-1 text-xs text-red-500"
            />
            <p
              v-else
              class="text-xs text-red-500 flex items-center gap-1.5 py-2"
            >
              <i class="pi pi-exclamation-circle"></i>
              No hay centros de salud disponibles.
            </p>
          </template>
        </div>

        <!-- Permisos y estado -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">
            Permisos y estado
          </label>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <!-- Verificado -->
            <label
              class="flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition select-none"
              :class="
                formData.verified
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
              "
            >
              <FormKit
                type="checkbox"
                name="verified"
                outer-class="$reset"
                wrapper-class="$reset"
                inner-class="$reset"
                input-class="w-4 h-4 rounded accent-green-500 cursor-pointer"
                label-class="$reset"
              />
              <div>
                <p class="text-sm font-medium text-gray-700">Verificado</p>
                <p class="text-xs text-gray-400">Cuenta activa</p>
              </div>
            </label>

            <!-- Administrador -->
            <label
              class="flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition select-none"
              :class="
                formData.admin
                  ? 'border-indigo-300 bg-indigo-50'
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
              "
            >
              <FormKit
                type="checkbox"
                name="admin"
                outer-class="$reset"
                wrapper-class="$reset"
                inner-class="$reset"
                input-class="w-4 h-4 rounded accent-indigo-500 cursor-pointer"
                label-class="$reset"
              />
              <div>
                <p class="text-sm font-medium text-gray-700">Admin</p>
                <p class="text-xs text-gray-400">Acceso total</p>
              </div>
            </label>

            <!-- Gerente -->
            <label
              class="flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition select-none"
              :class="
                formData.branchManager
                  ? 'border-amber-300 bg-amber-50'
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
              "
            >
              <FormKit
                type="checkbox"
                name="branchManager"
                outer-class="$reset"
                wrapper-class="$reset"
                inner-class="$reset"
                input-class="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                label-class="$reset"
              />
              <div>
                <p class="text-sm font-medium text-gray-700">Gerente</p>
                <p class="text-xs text-gray-400">Sucursal</p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </FormKit>

    <!-- ── FOOTER del Dialog ── -->
    <template #footer>
      <div class="flex justify-end gap-3">
        <button
          type="button"
          @click="onCancel"
          :disabled="saving"
          class="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Cancelar
        </button>
        <button
          type="button"
          @click="formRef?.node?.submit()"
          :disabled="saving || loadingHealths || !healthOptions.length"
          class="px-5 py-2.5 text-sm font-semibold text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
          :class="
            isEdit
              ? 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-400'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-400'
          "
        >
          <i v-if="saving" class="pi pi-spin pi-spinner text-xs"></i>
          <i
            v-else
            class="pi text-xs"
            :class="isEdit ? 'pi-check' : 'pi-plus'"
          ></i>
          {{
            saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear usuario"
          }}
        </button>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch, computed, onMounted } from "vue";
import Dialog from "primevue/dialog";
import { FormKit } from "@formkit/vue";
import { storeToRefs } from "pinia";

import { useUserEditorStore } from "@/modules/users/store/useUserEditorStore";
import { useUsersStore } from "@/modules/users/store/useUserStore";
import { useHealthStore } from "@/stores/healths";

const editor = useUserEditorStore();
const usersStore = useUsersStore();
const healthStore = useHealthStore();

const { selectedUser } = storeToRefs(editor);
const { healths } = storeToRefs(healthStore);

const formRef = ref(null);
const visible = ref(false);
const saving = ref(false);
const loadingHealths = ref(false);

const formData = ref({
  _id: null,
  name: "",
  verified: false,
  admin: false,
  branchManager: false,
  health: null,
});

const healthOptions = computed(() =>
  Array.isArray(healths.value) ? healths.value : [],
);

const isEdit = computed(() => !!formData.value?._id);

// Cuando el store selectedUser cambia, rellenar el formulario
watch(
  selectedUser,
  (usr) => {
    if (usr) {
      const healthValue =
        usr.health?.codigo ??
        usr.health?._id ??
        usr.health?.id ??
        usr.health ??
        null;
      formData.value = {
        _id: usr._id ?? usr.id ?? null,
        name: usr.name ?? "",
        verified: !!usr.verified,
        admin: !!usr.admin,
        branchManager: !!usr.branchManager,
        health: healthValue,
      };
    }
  },
  { immediate: true },
);

// Si el modal se cierra (X o clic fuera), limpiar
watch(visible, (val) => {
  if (!val) {
    editor.resetEditor();
    resetForm();
  }
});

async function open(passedUser = null) {
  try {
    if (!Array.isArray(healths.value) || healths.value.length === 0) {
      loadingHealths.value = true;
      await healthStore.getHealths();
    }
  } catch (err) {
    console.error("Error cargando centros de salud:", err);
  } finally {
    loadingHealths.value = false;
  }

  if (passedUser) {
    const hv =
      passedUser.health?.codigo ??
      passedUser.health?._id ??
      passedUser.health?.id ??
      passedUser.health ??
      null;

    formData.value = {
      _id: passedUser._id ?? passedUser.id ?? null,
      name: passedUser.name ?? "",
      verified: !!passedUser.verified,
      admin: !!passedUser.admin,
      branchManager: !!passedUser.branchManager,
      health: hv,
    };
  } else if (!selectedUser.value) {
    resetForm();
  }

  visible.value = true;
  saving.value = false;
}

function resetForm() {
  formData.value = {
    _id: null,
    name: "",
    verified: false,
    admin: false,
    branchManager: false,
    health: null,
  };
  try {
    formRef?.value?.node?.reset?.();
  } catch (e) {
    /* no crítico */
  }
}

function onCancel() {
  visible.value = false;
  editor.resetEditor();
  resetForm();
}

const handleSubmit = async (values) => {
  try {
    saving.value = true;

    const id =
      formData.value._id ?? selectedUser.value?._id ?? selectedUser.value?.id;
    if (!id) throw new Error("No se encontró el ID del usuario a actualizar.");

    const payload = {
      name: values.name,
      verified: !!values.verified,
      admin: !!values.admin,
      branchManager: !!values.branchManager,
      health: values.health ?? null,
    };

    await editor.updateUser(id, payload);
    await usersStore.fetchUsers();

    visible.value = false;
    editor.resetEditor();
    resetForm();
  } catch (err) {
    console.error("Error al guardar usuario:", err);
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  try {
    if (!Array.isArray(healths.value) || healths.value.length === 0) {
      await healthStore.getHealths();
    }
  } catch (err) {
    console.error("Error pre-cargando centros:", err);
  }
});

defineExpose({ open, close: onCancel });
</script>
