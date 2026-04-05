<template>
  <Dialog
    v-model:visible="visibleForm"
    modal
    :style="{ minWidth: '40vw' }"
    :breakpoints="{ '1199px': '60vw', '575px': '95vw' }"
    @hide="currentCategory = null"
  >
    <template #header>
      <div class="font-semibold text-xl">
        {{ currentCategory ? "Editar categoría" : "Nueva categoría" }}
      </div>
    </template>

    <FormKit
      id="categoryForm"
      type="form"
      v-model="formData"
      ref="formRef"
      :actions="false"
      @submit="handleSubmit"
      incomplete-message="No se pudo enviar el formulario, revisa los campos"
      class="space-y-4"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

        <FormKit
          type="text"
          label="Nombre"
          name="name"
          placeholder="Ej: Medicina general"
          validation="required|length:2"
          :validation-messages="{
            required: 'El nombre es obligatorio',
            length: 'El nombre es muy corto',
          }"
          label-class="block mb-1.5 text-sm font-medium text-gray-700"
          input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />

        <FormKit
          type="select"
          label="Icono"
          name="icon"
          :options="iconOptions"
          label-class="block mb-1.5 text-sm font-medium text-gray-700"
          input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />

        <div class="md:col-span-2">
          <FormKit
            type="text"
            label="Descripción (opcional)"
            name="description"
            placeholder="Breve descripción de la categoría"
            label-class="text-gray-700 font-medium"
            input-class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
          />
        </div>

        <FormKit
          type="select"
          label="Estado"
          name="active"
          :options="[{ label: 'Activa', value: true }, { label: 'Inactiva', value: false }]"
          label-class="block mb-1.5 text-sm font-medium text-gray-700"
          input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />

        <!-- Preview del icono seleccionado -->
        <div v-if="formData.icon" class="flex items-center gap-3">
          <img :src="`/img/${formData.icon}`" :alt="formData.icon" class="h-12 w-12 object-contain rounded-full bg-sky-100 p-1" />
          <span class="text-sm text-gray-500">Preview del icono</span>
        </div>

      </div>
    </FormKit>

    <template #footer>
      <button
        @click="formRef?.node?.submit()"
        class="px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        :class="currentCategory ? 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-400' : 'bg-blue-600 hover:bg-blue-700'"
      >
        {{ currentCategory ? 'Guardar cambios' : 'Crear categoría' }}
      </button>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import Dialog from "primevue/dialog";
import { FormKit } from "@formkit/vue";
import { useCategoryStore } from "../store/categoryStore";

const categoryStore = useCategoryStore();
const { visibleForm, currentCategory } = storeToRefs(categoryStore);
const { onCreateCategory, onUpdateCategory } = categoryStore;

const formRef = ref(null);
const formData = ref({
  name: "",
  description: "",
  icon: "assistance.png",
  active: true,
});

const iconOptions = [
  { label: "Asistencia (assistance.png)", value: "assistance.png" },
  { label: "Odontología (dentistry.png)", value: "dentistry.png" },
  { label: "Telesalud (medical-team.png)", value: "medical-team.png" },
  { label: "Vacunación (vaccination.png)", value: "vaccination.png" },
  { label: "Maternidad (mother.png)", value: "mother.png" },
];

watch(currentCategory, (newVal) => {
  if (newVal) {
    formData.value = {
      name: newVal.name ?? "",
      description: newVal.description ?? "",
      icon: newVal.icon ?? "assistance.png",
      active: newVal.active ?? true,
    };
  } else {
    formData.value = { name: "", description: "", icon: "assistance.png", active: true };
  }
});

const handleSubmit = async (values) => {
  const payload = {
    name: values.name,
    description: values.description ?? "",
    icon: values.icon ?? "assistance.png",
    active: values.active === "true" || values.active === true,
  };
  if (currentCategory.value) {
    await onUpdateCategory(payload);
  } else {
    await onCreateCategory(payload);
  }
  formData.value = { name: "", description: "", icon: "assistance.png", active: true };
};
</script>