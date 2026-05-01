<template>
  <Dialog
    v-model:visible="visibleForm"
    modal
    :style="{ minWidth: '40vw' }"
    :breakpoints="{ '1199px': '60vw', '575px': '95vw' }"
    @hide="currentService = null"
  >
    <template #header>
      <div class="font-semibold text-xl">
        {{ currentService ? "Editar servicio" : "Nuevo servicio" }}
      </div>
    </template>

    <FormKit
      id="serviceForm"
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
          label="Nombre del servicio"
          name="name"
          placeholder="Ej: Consulta general"
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
          label="Categoría"
          name="category"
          placeholder="Seleccione una categoría"
          :options="categoryOptions"
          validation="required"
          :validation-messages="{
            required: 'La categoría es obligatoria',
          }"
          label-class="block mb-1.5 text-sm font-medium text-gray-700"
          input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />

      </div>
    </FormKit>

    <template #footer>
      <button
        @click="formRef?.node?.submit()"
        class="px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        :class="currentService ? 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-400' : 'bg-blue-600 hover:bg-blue-700'"
      >
        {{ currentService ? 'Guardar cambios' : 'Crear servicio' }}
      </button>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { storeToRefs } from "pinia";
import Dialog from "primevue/dialog";
import { FormKit } from "@formkit/vue";
import { useServicesAdminStore } from "../store/servicesAdminStore";

const store = useServicesAdminStore();
const { visibleForm, currentService, availableCategories } = storeToRefs(store);
const { onCreateService, onUpdateService } = store;

const formRef = ref(null);
const formData = ref({ name: "", category: "" });

const categoryOptions = computed(() =>
  availableCategories.value.map((c) => ({ label: c.name, value: c.name }))
);

watch(currentService, (newVal) => {
  if (newVal) {
    formData.value = {
      name: newVal.name ?? "",
      category: newVal.category ?? "",
    };
  } else {
    formData.value = { name: "", category: "" };
  }
});

const handleSubmit = async (values) => {
  const payload = {
    name: values.name,
    category: values.category,
  };
  if (currentService.value) {
    await onUpdateService(payload);
  } else {
    await onCreateService(payload);
  }
  formData.value = { name: "", category: "" };
};
</script>