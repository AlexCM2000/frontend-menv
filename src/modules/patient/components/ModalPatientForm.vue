<template>
  <Dialog
    v-model:visible="visibleForm"
    modal
    :closable="true"
    :style="{ width: '720px' }"
    :breakpoints="{ '960px': '90vw', '640px': '95vw' }"
    :pt="{
      header: { class: 'border-b border-gray-100 pb-0 pt-5 px-6' },
      content: { class: 'px-6 py-5 overflow-y-auto max-h-[75vh]' },
      footer: { class: 'border-t border-gray-100 px-6 py-4' },
    }"
    @hide="currentPatient = null"
  >
    <!-- Header -->
    <template #header>
      <div class="flex items-center gap-3">
        <div
          class="w-9 h-9 rounded-lg flex items-center justify-center"
          :class="currentPatient ? 'bg-amber-50' : 'bg-teal-50'"
        >
          <i
            class="pi text-base"
            :class="currentPatient ? 'pi-pencil text-amber-500' : 'pi-user-plus text-teal-500'"
          ></i>
        </div>
        <div>
          <h2 class="text-base font-semibold text-gray-800 leading-tight">
            {{ currentPatient ? "Editar paciente" : "Nuevo paciente" }}
          </h2>
          <p class="text-xs text-gray-400 mt-0.5">
            {{ currentPatient ? "Modifica los datos del paciente" : "Completa el formulario por secciones" }}
          </p>
        </div>
      </div>
    </template>

    <!-- Formulario -->
    <FormKit
      id="patientForm"
      type="form"
      v-model="formData"
      ref="formRef"
      :actions="false"
      @submit="handleSubmit"
      incomplete-message="Revisa los campos marcados en rojo"
    >
      <div class="space-y-6">

        <!-- ── SECCIÓN 1: Identificación ── -->
        <section>
          <div class="flex items-center gap-2 mb-4">
            <div class="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center flex-shrink-0">
              <i class="pi pi-id-card text-blue-600 text-xs"></i>
            </div>
            <h3 class="text-sm font-semibold text-gray-700">Datos de identificación</h3>
            <div class="flex-1 h-px bg-gray-100 ml-1"></div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Primer apellido -->
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

            <!-- Segundo apellido -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Segundo apellido <span class="text-gray-400 text-xs font-normal">(opcional)</span>
              </label>
              <FormKit
                type="text"
                name="segundoApellido"
                placeholder="Ej. Quispe"
                input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                messages-class="mt-1.5 text-xs text-red-500"
              />
            </div>

            <!-- Nombres -->
            <div class="sm:col-span-2">
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

            <!-- Fecha de nacimiento -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Fecha de nacimiento <span class="text-red-500">*</span>
              </label>
              <FormKit
                type="date"
                name="dateOfBirth"
                validation="required"
                :validation-messages="{ required: 'La fecha de nacimiento es obligatoria' }"
                input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                messages-class="mt-1.5 text-xs text-red-500"
              />
            </div>

            <!-- Género -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Género <span class="text-red-500">*</span>
              </label>
              <FormKit
                type="radio"
                name="gender"
                :options="['Masculino', 'Femenino']"
                validation="required"
                :validation-messages="{ required: 'Selecciona el género' }"
                fieldset-class="$reset"
                legend-class="$reset sr-only"
                options-class="$reset flex gap-3 flex-wrap"
                wrapper-class="$reset flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors select-none text-sm text-gray-600 has-[:checked]:border-blue-400 has-[:checked]:bg-blue-50 has-[:checked]:text-blue-700 has-[:checked]:font-medium"
                input-class="$reset w-3.5 h-3.5 accent-blue-600 cursor-pointer"
                label-class="$reset cursor-pointer"
                messages-class="$reset mt-1.5 text-xs text-red-500"
              />
            </div>
          </div>
        </section>

        <!-- ── SECCIÓN 2: Centro e identificación médica ── -->
        <section>
          <div class="flex items-center gap-2 mb-4">
            <div class="w-6 h-6 rounded-md bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <i class="pi pi-building text-indigo-600 text-xs"></i>
            </div>
            <h3 class="text-sm font-semibold text-gray-700">Centro e identificación médica</h3>
            <div class="flex-1 h-px bg-gray-100 ml-1"></div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Centro de salud -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Centro de salud <span class="text-red-500">*</span>
              </label>
              <FormKit
                type="select"
                name="healthCenter"
                :options="[{ label: 'Seleccione un centro', value: '' }, ...healths]"
                validation="required"
                :validation-messages="{ required: 'Seleccione un centro de salud' }"
                input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                messages-class="mt-1.5 text-xs text-red-500"
              />
            </div>

            <!-- Código SUS -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Código SUS <span class="text-red-500">*</span>
              </label>
              <FormKit
                type="text"
                name="susCode"
                placeholder="Código único del SUS"
                validation="required|length:3"
                :validation-messages="{
                  required: 'El código SUS es obligatorio',
                  length: 'Mínimo 3 caracteres',
                }"
                input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                messages-class="mt-1.5 text-xs text-red-500"
              />
            </div>
          </div>
        </section>

        <!-- ── SECCIÓN 3: Datos de contacto ── -->
        <section>
          <div class="flex items-center gap-2 mb-4">
            <div class="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <i class="pi pi-phone text-emerald-600 text-xs"></i>
            </div>
            <h3 class="text-sm font-semibold text-gray-700">Datos de contacto</h3>
            <div class="flex-1 h-px bg-gray-100 ml-1"></div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Email -->
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
                  email: 'Correo inválido',
                }"
                input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                messages-class="mt-1.5 text-xs text-red-500"
              />
            </div>

            <!-- Teléfono -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Número de celular <span class="text-red-500">*</span>
              </label>
              <FormKit
                type="number"
                name="phone"
                placeholder="Ej. 70000000"
                validation="required|length:7,8"
                :validation-messages="{
                  required: 'El número de celular es obligatorio',
                  length: 'Debe tener entre 7 y 8 dígitos',
                }"
                input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                messages-class="mt-1.5 text-xs text-red-500"
              />
            </div>

            <!-- Dirección -->
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Dirección <span class="text-red-500">*</span>
              </label>
              <FormKit
                type="text"
                name="address"
                placeholder="Calle, Nro., Barrio o Zona"
                validation="required|length:5,100"
                :validation-messages="{
                  required: 'La dirección es obligatoria',
                  length: 'Entre 5 y 100 caracteres',
                }"
                input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                messages-class="mt-1.5 text-xs text-red-500"
              />
            </div>
          </div>
        </section>

        <!-- ── SECCIÓN 4: Contacto de emergencia ── -->
        <section>
          <div class="flex items-center gap-2 mb-4">
            <div class="w-6 h-6 rounded-md bg-orange-100 flex items-center justify-center flex-shrink-0">
              <i class="pi pi-exclamation-triangle text-orange-500 text-xs"></i>
            </div>
            <h3 class="text-sm font-semibold text-gray-700">Contacto de emergencia</h3>
            <div class="flex-1 h-px bg-gray-100 ml-1"></div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Nombre del contacto -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Nombre completo <span class="text-red-500">*</span>
              </label>
              <FormKit
                type="text"
                name="nameContact"
                placeholder="Nombre del contacto"
                validation="required|matches:/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/|length:3,50"
                :validation-messages="{
                  required: 'El nombre del contacto es obligatorio',
                  matches: 'Solo letras y espacios',
                  length: 'Entre 3 y 50 caracteres',
                }"
                input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                messages-class="mt-1.5 text-xs text-red-500"
              />
            </div>

            <!-- Teléfono del contacto -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Teléfono <span class="text-red-500">*</span>
              </label>
              <FormKit
                type="number"
                name="phoneContact"
                placeholder="Ej. 70000000"
                validation="required|length:7,8"
                :validation-messages="{
                  required: 'El teléfono del contacto es obligatorio',
                  length: 'Debe tener entre 7 y 8 dígitos',
                }"
                input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                messages-class="mt-1.5 text-xs text-red-500"
              />
            </div>

            <!-- Relación -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Parentesco / Relación <span class="text-red-500">*</span>
              </label>
              <FormKit
                type="select"
                name="relationshipContact"
                :options="[{ label: 'Seleccione una opción', value: '' }, ...RELATION_SHIP]"
                validation="required"
                :validation-messages="{ required: 'Seleccione una relación' }"
                input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                messages-class="mt-1.5 text-xs text-red-500"
              />
            </div>
          </div>
        </section>

        <!-- ── SECCIÓN 5: Antecedentes médicos ── -->
        <section>
          <div class="flex items-center gap-2 mb-4">
            <div class="w-6 h-6 rounded-md bg-rose-100 flex items-center justify-center flex-shrink-0">
              <i class="pi pi-heart text-rose-500 text-xs"></i>
            </div>
            <h3 class="text-sm font-semibold text-gray-700">Antecedentes médicos</h3>
            <div class="flex-1 h-px bg-gray-100 ml-1"></div>
          </div>
          <p class="text-xs text-gray-400 mb-3">Separa múltiples valores con comas. Ej: <span class="font-mono">Penicilina, Polvo, Mariscos</span></p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Alergias -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Alergias</label>
              <FormKit
                type="textarea"
                name="allergies"
                placeholder="Penicilina, Polvo, Mariscos..."
                :validation="[['matches', /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s,]*$/]]"
                :validation-messages="{ matches: 'Solo letras, espacios y comas' }"
                input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                messages-class="mt-1.5 text-xs text-red-500"
                :input-attrs="{ rows: 3 }"
              />
            </div>

            <!-- Condiciones médicas -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Condiciones médicas</label>
              <FormKit
                type="textarea"
                name="medicalConditions"
                placeholder="Diabetes, Hipertensión, Asma..."
                :validation="[['matches', /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s,]*$/]]"
                :validation-messages="{ matches: 'Solo letras, espacios y comas' }"
                input-class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                messages-class="mt-1.5 text-xs text-red-500"
                :input-attrs="{ rows: 3 }"
              />
            </div>
          </div>
        </section>

      </div>
    </FormKit>

    <!-- Footer -->
    <template #footer>
      <div class="flex justify-end gap-3">
        <button
          type="button"
          @click="closeModal"
          class="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
        >
          Cancelar
        </button>
        <button
          type="button"
          @click="formRef?.node?.submit()"
          class="px-5 py-2.5 text-sm font-semibold text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 transition flex items-center gap-2"
          :class="currentPatient
            ? 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-400'
            : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'"
        >
          <i class="pi text-xs" :class="currentPatient ? 'pi-check' : 'pi-plus'"></i>
          {{ currentPatient ? "Guardar cambios" : "Crear paciente" }}
        </button>
      </div>
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

const patientStore = usePatientStore();
const { visibleForm, currentPatient } = storeToRefs(patientStore);
const { onCreatePatient, onChangePatient, closeModal } = patientStore;

const formData = ref({});

watch(currentPatient, (newVal) => {
  if (newVal) {
    formData.value = {
      primerApellido: newVal.primerApellido ?? "",
      segundoApellido: newVal.segundoApellido ?? "",
      nombres: newVal.nombres ?? "",
      dateOfBirth: newVal.dateOfBirth
        ? (typeof newVal.dateOfBirth === "string"
            ? newVal.dateOfBirth.split("T")[0]
            : new Date(newVal.dateOfBirth).toISOString().split("T")[0])
        : "",
      gender: newVal.gender ?? "",
      email: newVal.email ?? "",
      phone: newVal.contactInfo?.phone ?? "",
      address: newVal.contactInfo?.address ?? "",
      nameContact: newVal.emergencyContact?.name ?? "",
      phoneContact: newVal.emergencyContact?.phone ?? "",
      relationshipContact: newVal.emergencyContact?.relationship ?? "",
      allergies: Array.isArray(newVal.allergies) ? newVal.allergies.join(", ") : "",
      medicalConditions: Array.isArray(newVal.medicalConditions)
        ? newVal.medicalConditions.join(", ")
        : "",
      healthCenter: newVal.healthCenter?.codigo ?? newVal.healthCenter,
      susCode: newVal.susCode ?? "",
    };
  } else {
    formData.value = {};
  }
});

const handleSubmit = async (values) => {
  const payload = {
    primerApellido: values.primerApellido,
    segundoApellido: values.segundoApellido || "",
    nombres: values.nombres,
    dateOfBirth: values.dateOfBirth,
    gender: values.gender,
    email: values.email,
    susCode: values.susCode,
    healthCenter: values.healthCenter,
    allergies: values.allergies
      ? values.allergies.split(",").map((s) => s.trim()).filter(Boolean)
      : [],
    medicalConditions: values.medicalConditions
      ? values.medicalConditions.split(",").map((s) => s.trim()).filter(Boolean)
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

  try {
    if (currentPatient.value) {
      payload._id = currentPatient.value._id;
      await onChangePatient(payload);
    } else {
      await onCreatePatient(payload);
    }
    formData.value = {};
  } catch {
    // El store ya muestra el toast de error; no limpiar ni cerrar el modal
  }
};

onMounted(async () => {
  await getHealths();
});
</script>
