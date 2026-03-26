<template>
  <Dialog
    v-model:visible="visibleForm"
    modal
    :style="{ minWidth: '40vw' }"
    :breakpoints="{ '1199px': '60vw', '575px': '95vw' }"
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
          label-class="text-gray-700 font-medium"
          input-class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
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
          label-class="text-gray-700 font-medium"
          input-class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
        />

        <FormKit
          type="number"
          label="Precio (Bs.)"
          name="price"
          placeholder="0"
          validation="required|min:0"
          :validation-messages="{
            required: 'El precio es obligatorio',
            min: 'El precio no puede ser negativo',
          }"
          label-class="text-gray-700 font-medium"
          input-class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
        />

      </div>
    </FormKit>

    <template #footer>
      <button
        @click="formRef?.node?.submit()"
        class="w-full p-3 mt-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        Guardar
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
const formData = ref({ name: "", category: "", price: 0 });

const categoryOptions = computed(() =>
  availableCategories.value.map((c) => ({ label: c.name, value: c.name }))
);

watch(currentService, (newVal) => {
  if (newVal) {
    formData.value = {
      name: newVal.name ?? "",
      category: newVal.category ?? "",
      price: newVal.price ?? 0,
    };
  } else {
    formData.value = { name: "", category: "", price: 0 };
  }
});

const handleSubmit = async (values) => {
  const payload = {
    name: values.name,
    category: values.category,
    price: Number(values.price),
  };
  if (currentService.value) {
    await onUpdateService(payload);
  } else {
    await onCreateService(payload);
  }
  formData.value = { name: "", category: "", price: 0 };
};
</script>