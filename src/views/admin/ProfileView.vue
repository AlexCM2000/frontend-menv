<template>
  <div class="m-3 sm:m-5 space-y-5">

    <!-- ── Datos personales ─────────────────────────── -->
    <Card>
      <template #title>
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
            <i class="pi pi-user text-indigo-500 text-base"></i>
          </div>
          <div>
            <p class="font-bold text-base text-gray-800">Datos personales</p>
            <p class="text-xs font-normal text-gray-400 mt-0.5">Actualiza tu nombre y correo electrónico</p>
          </div>
        </div>
      </template>

      <template #content>
        <FormKit
          id="profileForm"
          type="form"
          v-model="profileForm"
          :actions="false"
          @submit="handleProfileSubmit"
          incomplete-message="Revisa los campos marcados en rojo"
        >
          <div class="space-y-4 max-w-xl">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Primer apellido <span class="text-red-500">*</span>
                </label>
                <FormKit
                  type="text"
                  name="primerApellido"
                  placeholder="Ej. Mamani"
                  validation="required|length:2"
                  :validation-messages="{
                    required: 'El primer apellido es obligatorio',
                    length: 'Mínimo 2 caracteres',
                  }"
                  input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  messages-class="mt-1.5 text-xs text-red-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Segundo apellido <span class="text-gray-400">(opcional)</span>
                </label>
                <FormKit
                  type="text"
                  name="segundoApellido"
                  placeholder="Ej. Quispe"
                  input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  messages-class="mt-1.5 text-xs text-red-500"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Nombres <span class="text-red-500">*</span>
              </label>
              <FormKit
                type="text"
                name="nombres"
                placeholder="Ej. Juan Carlos"
                validation="required|length:2"
                :validation-messages="{
                  required: 'Los nombres son obligatorios',
                  length: 'Mínimo 2 caracteres',
                }"
                input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                messages-class="mt-1.5 text-xs text-red-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Correo electrónico <span class="text-red-500">*</span>
              </label>
              <FormKit
                type="email"
                name="email"
                placeholder="correo@ejemplo.com"
                validation="required|email"
                :validation-messages="{
                  required: 'El correo es obligatorio',
                  email: 'Ingresa un correo válido',
                }"
                input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                messages-class="mt-1.5 text-xs text-red-500"
              />
            </div>

            <div class="pt-1">
              <Button
                type="submit"
                label="Guardar cambios"
                icon="pi pi-check"
                :loading="savingProfile"
                @click="submitProfile"
              />
            </div>
          </div>
        </FormKit>
      </template>
    </Card>

    <!-- ── Cambiar contraseña ───────────────────────── -->
    <Card>
      <template #title>
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
            <i class="pi pi-lock text-amber-500 text-base"></i>
          </div>
          <div>
            <p class="font-bold text-base text-gray-800">Cambiar contraseña</p>
            <p class="text-xs font-normal text-gray-400 mt-0.5">Necesitas ingresar tu contraseña actual para confirmar el cambio</p>
          </div>
        </div>
      </template>

      <template #content>
        <FormKit
          id="passwordForm"
          type="form"
          v-model="passwordForm"
          :actions="false"
          @submit="handlePasswordSubmit"
          incomplete-message="Revisa los campos marcados en rojo"
        >
          <div class="space-y-4 max-w-xl">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Contraseña actual <span class="text-red-500">*</span>
              </label>
              <FormKit
                type="password"
                name="currentPassword"
                placeholder="Tu contraseña actual"
                validation="required"
                :validation-messages="{ required: 'La contraseña actual es obligatoria' }"
                input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                messages-class="mt-1.5 text-xs text-red-500"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Nueva contraseña <span class="text-red-500">*</span>
                </label>
                <FormKit
                  type="password"
                  name="newPassword"
                  placeholder="Mínimo 8 caracteres"
                  validation="required|length:8"
                  :validation-messages="{
                    required: 'La nueva contraseña es obligatoria',
                    length: 'Mínimo 8 caracteres',
                  }"
                  input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  messages-class="mt-1.5 text-xs text-red-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirmar contraseña <span class="text-red-500">*</span>
                </label>
                <FormKit
                  type="password"
                  name="confirmPassword"
                  placeholder="Repite la nueva contraseña"
                  validation="required|confirm:newPassword"
                  :validation-messages="{
                    required: 'Confirma la contraseña',
                    confirm: 'Las contraseñas no coinciden',
                  }"
                  input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  messages-class="mt-1.5 text-xs text-red-500"
                />
              </div>
            </div>

            <div class="pt-1">
              <Button
                type="submit"
                label="Cambiar contraseña"
                icon="pi pi-lock"
                severity="warning"
                :loading="savingPassword"
                @click="submitPassword"
              />
            </div>
          </div>
        </FormKit>
      </template>
    </Card>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { inject } from "vue";
import { storeToRefs } from "pinia";
import { getNode } from "@formkit/core";
import Card from "primevue/card";
import Button from "primevue/button";
import { useUserStore } from "@/stores/user";

const toast = inject("toast");
const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const { getUser, updateProfile, changePassword } = userStore;

const savingProfile = ref(false);
const savingPassword = ref(false);

const profileForm = ref({
  primerApellido: "",
  segundoApellido: "",
  nombres: "",
  email: "",
});

const passwordForm = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

onMounted(async () => {
  await getUser();
  profileForm.value = {
    primerApellido: user.value?.primerApellido ?? "",
    segundoApellido: user.value?.segundoApellido ?? "",
    nombres: user.value?.nombres ?? "",
    email: user.value?.email ?? "",
  };
});

const submitProfile = () => {
  getNode("profileForm")?.submit();
};

const submitPassword = () => {
  getNode("passwordForm")?.submit();
};

const handleProfileSubmit = async (values) => {
  savingProfile.value = true;
  try {
    await updateProfile({
      primerApellido: values.primerApellido,
      segundoApellido: values.segundoApellido ?? "",
      nombres: values.nombres,
      email: values.email,
    });
    toast.open({ message: "Perfil actualizado correctamente", type: "success" });
  } catch (error) {
    const msg = error?.response?.data?.msg ?? "Error al actualizar el perfil";
    toast.open({ message: msg, type: "error" });
  } finally {
    savingProfile.value = false;
  }
};

const handlePasswordSubmit = async (values) => {
  savingPassword.value = true;
  try {
    await changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
    toast.open({ message: "Contraseña actualizada correctamente", type: "success" });
    passwordForm.value = { currentPassword: "", newPassword: "", confirmPassword: "" };
  } catch (error) {
    const msg = error?.response?.data?.msg ?? "Error al cambiar la contraseña";
    toast.open({ message: msg, type: "error" });
  } finally {
    savingPassword.value = false;
  }
};
</script>
