<template>
  <Dialog
    v-model:visible="visibleForm"
    modal
    :style="{ minWidth: '50vw' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    @hide="currentDoctor = null"
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
          placeholder="Nombre completo del médico"
          validation="required|length:3"
          :validation-messages="{
            required: 'El nombre es obligatorio',
            length: 'El nombre es muy corto',
          }"
          label-class="block mb-1.5 text-sm font-medium text-gray-700"
          input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
          label-class="block mb-1.5 text-sm font-medium text-gray-700"
          input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />

        <FormKit
          type="text"
          label="N° de Licencia Médica"
          name="licenseNumber"
          placeholder="Ej: LM-12345"
          validation="required|length:3"
          :validation-messages="{
            required: 'El número de licencia es obligatorio',
            length: 'El número de licencia es muy corto',
          }"
          label-class="block mb-1.5 text-sm font-medium text-gray-700"
          input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
          label-class="block mb-1.5 text-sm font-medium text-gray-700"
          input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />

        <FormKit
          type="number"
          label="Teléfono de contacto"
          name="phone"
          placeholder="Ej: 71234567"
          validation="required|length:7,8"
          :validation-messages="{
            required: 'El teléfono es obligatorio',
            length: 'Debe tener entre 7 y 8 dígitos',
          }"
          label-class="block mb-1.5 text-sm font-medium text-gray-700"
          input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
          label-class="block mb-1.5 text-sm font-medium text-gray-700"
          input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />

        <FormKit
          type="text"
          label="Dirección (opcional)"
          name="address"
          placeholder="Dirección del consultorio"
          label-class="block mb-1.5 text-sm font-medium text-gray-700"
          input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
          label-class="block mb-1.5 text-sm font-medium text-gray-700"
          input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />

        <!-- BranchManager: muestra su propio centro bloqueado -->
        <div v-else>
          <label class="block mb-1.5 text-sm font-medium text-gray-700">Centro de salud</label>
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
        class="px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        :class="currentDoctor ? 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-400' : 'bg-blue-600 hover:bg-blue-700'"
      >
        {{ currentDoctor ? 'Guardar cambios' : 'Crear médico' }}
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
