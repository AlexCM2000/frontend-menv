<template>
  <Dialog
    v-model:visible="visibleForm"
    modal
    :style="{ minWidth: '50vw' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <template #header>
      <div class="font-semibold text-xl">
        {{ currentDoctor ? "Editar médico" : "Nuevo médico" }}
      </div>
    </template>

    <FormKit
      id="doctorForm"
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
          label="Nombre completo"
          name="name"
          placeholder="Ej: Dr. Juan Pérez"
          validation="required|length:3"
          :validation-messages="{
            required: 'El nombre es obligatorio',
            length: 'El nombre es muy corto',
          }"
          label-class="text-gray-700 font-medium"
          input-class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
        />

        <FormKit
          type="select"
          label="Especialidad"
          name="specialty"
          placeholder="Seleccione una especialidad"
          :options="categoryOptions"
          validation="required"
          :validation-messages="{
            required: 'La especialidad es obligatoria',
          }"
          label-class="text-gray-700 font-medium"
          input-class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
        />

        <FormKit
          type="text"
          label="N° de Licencia Médica"
          name="licenseNumber"
          placeholder="Ej: LM-00123"
          validation="required|length:3"
          :validation-messages="{
            required: 'El número de licencia es obligatorio',
            length: 'El número de licencia es muy corto',
          }"
          label-class="text-gray-700 font-medium"
          input-class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
        />

        <FormKit
          type="number"
          label="Años de experiencia"
          name="yearsOfExperience"
          placeholder="0"
          validation="min:0"
          :validation-messages="{
            min: 'Los años de experiencia no pueden ser negativos',
          }"
          label-class="text-gray-700 font-medium"
          input-class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
        />

        <FormKit
          type="number"
          label="Teléfono de contacto"
          name="phone"
          placeholder="Ej: 70001234"
          validation="required|length:7"
          :validation-messages="{
            required: 'El teléfono es obligatorio',
            length: 'El teléfono debe tener al menos 7 dígitos',
          }"
          label-class="text-gray-700 font-medium"
          input-class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
        />

        <FormKit
          type="email"
          label="Correo electrónico (opcional)"
          name="email"
          placeholder="medico@ejemplo.com"
          validation="email"
          :validation-messages="{
            email: 'Ingrese un correo electrónico válido',
          }"
          label-class="text-gray-700 font-medium"
          input-class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
        />

        <FormKit
          type="text"
          label="Dirección (opcional)"
          name="address"
          placeholder="Dirección del consultorio"
          label-class="text-gray-700 font-medium"
          input-class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
        />

        <!-- Admin: selector libre de centro de salud -->
        <FormKit
          v-if="isAdmin"
          type="select"
          label="Centro de salud"
          name="health"
          placeholder="Seleccione el centro de salud"
          :options="healths"
          validation="required"
          :validation-messages="{
            required: 'Debe seleccionar un centro de salud',
          }"
          label-class="text-gray-700 font-medium"
          input-class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
        />

        <!-- BranchManager: muestra su propio centro bloqueado -->
        <div v-else>
          <label class="block text-gray-700 font-medium mb-1 text-sm">Centro de salud</label>
          <div class="flex items-center gap-2 w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm">
            <i class="pi pi-lock text-gray-400 text-xs"></i>
            <span>{{ branchManagerHealthName }}</span>
          </div>
          <p class="text-xs text-gray-400 mt-1">Asignado automáticamente a tu sucursal.</p>
        </div>

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
import { storeToRefs } from "pinia";
import Dialog from "primevue/dialog";
import { FormKit } from "@formkit/vue";
import { computed, onMounted, ref, watch } from "vue";
import { useDoctorStore } from "../store/doctorStore";
import { useHealthStore } from "@/stores/healths";
import { useUserStore } from "@/stores/user";
import CategoryApi from "@/api/CategoryApi";

const healthStore = useHealthStore();
const { getHealths } = healthStore;
const { healths } = storeToRefs(healthStore);

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const isAdmin = computed(() => user.value?.admin === true);

// Nombre del centro del branchManager para mostrarlo en el campo bloqueado
const branchManagerHealthName = computed(() => {
  if (!user.value?.health) return "Sin centro asignado";
  const match = healths.value.find((h) => h.id === user.value.health);
  return match?.label ?? "Mi sucursal";
});

const formRef = ref(null);
const formData = ref({});

const { visibleForm, currentDoctor } = storeToRefs(useDoctorStore());
const { onCreateDoctor, onChangeDoctor } = useDoctorStore();

watch(currentDoctor, (newVal) => {
  if (newVal) {
    formData.value = {
      name: newVal.name,
      specialty: newVal.specialty,
      licenseNumber: newVal.licenseNumber,
      yearsOfExperience: newVal.yearsOfExperience,
      phone: newVal.contactInfo?.phone,
      email: newVal.contactInfo?.email ?? "",
      address: newVal.contactInfo?.address ?? "",
      // Solo pre-llenar health para admin (el branchManager lo tiene fijo)
      ...(isAdmin.value ? { health: newVal.health?.codigo ?? newVal.health } : {}),
    };
  } else {
    formData.value = {};
  }
});

const handleSubmit = async (values) => {
  // BranchManager siempre usa su propio health (ObjectId), admin usa el del selector (codigo)
  const healthValue = isAdmin.value ? values.health : user.value.health;

  const payload = {
    name: values.name,
    specialty: values.specialty,
    licenseNumber: values.licenseNumber,
    yearsOfExperience: Number(values.yearsOfExperience ?? 0),
    health: healthValue,
    contactInfo: {
      phone: values.phone,
      ...(values.email ? { email: values.email } : {}),
      ...(values.address ? { address: values.address } : {}),
    },
  };

  if (currentDoctor.value) {
    payload._id = currentDoctor.value._id;
    await onChangeDoctor(payload);
  } else {
    await onCreateDoctor(payload);
  }

  formData.value = {};
};

const categoryOptions = ref([]);

onMounted(async () => {
  await userStore.getUser();
  await getHealths();
  try {
    const { data } = await CategoryApi.getAll({ active: true });
    categoryOptions.value = data.map((c) => ({ label: c.name, value: c.name }));
  } catch {
    categoryOptions.value = [];
  }
});
</script>
