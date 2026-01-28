<template>
  <Dialog
    v-model:visible="visibleForm"
    modal
    header="Crear Paciente"
    :style="{ minWidth: '50vw' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <FormKit
      id="patientForm"
      type="form"
      v-model="formData"
      ref="formRef"
      :actions="false"
      @submit="handleSubmit"
      incomplete-message="No se pudo enviar el formulario, revisa los campos"
      class="space-y-4"
    >
      <template #header>
        <div class="font-semibold text-xl">Crear paciente</div>
      </template>

      <template #default>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormKit
            type="text"
            label="Nombres completos"
            name="firstName"
            placeholder="Ingresa tus nombres completos"
            validation="required|length:3"
            :validation-messages="{
              required: 'El campo nombre completo es obligatorio',
              length: 'El nombre es muy corto',
            }"
            label-class="text-gray-700 font-medium"
            input-class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
          />

          <FormKit
            type="text"
            label="Apellidos"
            name="lastName"
            placeholder="Ingrese los apellidos completos"
            validation="required|length:3"
            :validation-messages="{
              required: 'El campo apellido es obligatorio',
              length: 'el apellido es muy corto',
            }"
            label-class="text-gray-700 font-medium"
            input-class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
          />

          <FormKit
            type="date"
            label="Fecha de nacimiento"
            name="dateOfBirth"
            placeholder="Seleccione una fecha"
            validation="required"
            :validation-messages="{
              required: 'El campo fecha es obligatorio',
            }"
            label-class="text-gray-700 font-medium"
            input-class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
          />

          <div class="mt-5">
            <FormKit
              type="radio"
              label="Género"
              name="gender"
              placeholder="Seleccione un genero"
              validation="required"
              :validation-messages="{
                required: 'El campo genero es obligatorio',
              }"
              :options="{
                Masculino: 'Masculino',
                Femenino: 'Femenino',
              }"
              label-class="text-gray-700 font-medium "
              wrapper-class="flex gap-4 items-center mb-4 "
            />
          </div>

          <FormKit
            type="email"
            label="Correo electrónico"
            name="email"
            placeholder="Ingrese su correo electrónico"
            validation="required|email"
            :validation-messages="{
              required: 'El correo electrónico es obligatorio',
              email: 'Ingrese un correo electrónico válido',
            }"
            label-class="text-gray-700 font-medium"
            input-class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
          />
          <FormKit
            type="number"
            label="Número de celular"
            name="phone"
            placeholder="Ingrese su número de celular"
            validation="required|length:8"
            :validation-messages="{
              required: 'El número de celular es obligatorio',
              length: 'El número de celular debe tener 8 dígitos.',
            }"
            label-class="text-gray-700 font-medium"
            input-class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
          />

          <FormKit
            type="text"
            label="Dirección"
            name="address"
            placeholder="Ingrese su dirección"
            validation="required|length:5,100"
            :validation-messages="{
              required: 'La dirección es obligatoria.',
              length: 'La dirección debe tener entre 5 y 100 caracteres.',
            }"
            label-class="text-gray-700 font-medium"
            input-class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
          />

          <FormKit
            type="text"
            label="Nombre completo de contacto"
            name="nameContact"
            placeholder="Ingrese su nombre"
            validation="required|matches:/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/|length:3,50"
            :validation-messages="{
              required: 'El nombre es obligatorio.',
              matches: 'El nombre solo puede contener letras y espacios.',
              length: 'El nombre debe tener entre 3 y 50 caracteres.',
            }"
            label-class="text-gray-700 font-medium"
            input-class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
          />

          <FormKit
            type="number"
            label="Número de celular de contacto"
            name="phoneContact"
            placeholder="Número de celular de su contacto"
            validation="required|length:8"
            :validation-messages="{
              required: 'El número de celular de contacto es obligatorio',
              length: 'El número de celular debe tener 8 dígitos.',
            }"
            label-class="text-gray-700 font-medium"
            input-class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
          />

          <FormKit
            type="select"
            label="Relación"
            name="relationshipContact"
            placeholder="Seleccione una opción"
            :options="RELATION_SHIP"
            validation="required"
            :validation-messages="{
              required: 'Debe seleccionar una opción',
            }"
            label-class="text-gray-700 font-medium"
            input-class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
          />

          <FormKit
            type="textarea"
            label="Alergias"
            name="allergies"
            placeholder="Alergias que presenta (solo letras y comas, sin espacios)"
            validation="matches:/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/"
            :validation-messages="{
              matches: 'Solo se permiten letras y espacios.',
            }"
            label-class="text-gray-700 font-medium"
            input-class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
          />

          <FormKit
            type="textarea"
            label="Condiciones médicas"
            name="medicalConditions"
            placeholder="condiciones médicas que presenta"
            validation="matches:/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/"
            :validation-messages="{
              matches: 'Solo se permiten letras y espacios.',
            }"
            label-class="text-gray-700 font-medium"
            input-class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
          />

          <FormKit
            type="select"
            label="Centro de salud"
            name="healthCenter"
            placeholder="Seleccione el centro de salud al que pertenece"
            :options="healths"
            validation="required"
            :validation-messages="{
              required: 'Debe seleccionar un centro de salud',
            }"
            label-class="text-gray-700 font-medium"
            input-class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
          />

          <FormKit
            type="text"
            label="Código SUS"
            name="susCode"
            placeholder="ingrese el código único del sus"
            validation="required|length:3"
            :validation-messages="{
              required: 'El código sus es obligario',
              length: 'El código es muy corto',
            }"
            label-class="text-gray-700 font-medium"
            input-class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
          />
        </div>
      </template>
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
import { usePatientStore } from "../store/patientStore";
import { FormKit } from "@formkit/vue";
import { useHealthStore } from "@/stores/healths";
import { onMounted, ref, watch } from "vue";
import { RELATION_SHIP } from "@/modules/patient/helpers/Dictionary";

const healthStore = useHealthStore();
const { getHealths } = healthStore;
const { healths } = storeToRefs(healthStore);

const formRef = ref(null);

const { visibleForm, currentPatient } = storeToRefs(usePatientStore());
const { onCreatePatient, onChangePatient } = usePatientStore();

const formData = ref({});

watch(currentPatient, (newVal) => {
  if (newVal) {
    formData.value = {
      firstName: newVal.firstName,
      lastName: newVal.lastName,
      dateOfBirth: newVal.dateOfBirth.split("T")[0],
      gender: newVal.gender,
      email: newVal.email,
      phone: newVal.contactInfo?.phone,
      address: newVal.contactInfo?.address,
      nameContact: newVal.emergencyContact?.name,
      phoneContact: newVal.emergencyContact?.phone,
      relationshipContact: newVal.emergencyContact?.relationship,
      allergies: Array.isArray(newVal.allergies)
        ? newVal.allergies.join(" ")
        : "",
      medicalConditions: Array.isArray(newVal.medicalConditions)
        ? newVal.medicalConditions.join(" ")
        : "",
      healthCenter: newVal.healthCenter.codigo,
      susCode: newVal.susCode,
    };
  } else {
    formData.value = {};
  }
});

const handleSubmit = async (values) => {
  const payload = {
    ...values,
    allergies: values.allergies ? values.allergies.split(" ") : [],
    medicalConditions: values.medicalConditions
      ? values.medicalConditions.split(",")
      : [],
    contactInfo: {
      phone: values.phone,
      address: values.address,
    },
    emergencyContact: {
      name: values.nameContact,
      phone: values.phoneContact,
      relationship: values.relationshipContact,
    },
  };

  if (currentPatient.value) {
    payload._id = currentPatient.value._id; // o usa `_id` si viene de Mongo
    await onChangePatient(payload);
  } else {
    await onCreatePatient(payload);
  }

  formData.value = {}; // limpiar el formulario
};

onMounted(async () => {
  await getHealths();
});
</script>
