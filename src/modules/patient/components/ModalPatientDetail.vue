<template>
  <Dialog
    v-model:visible="visibleDetail"
    modal
    header="Crear Paciente"
    :style="{ minWidth: '45vw' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <template #header>
      <div class="font-semibold text-xl">Detalle del paciente</div>
    </template>

    <template #default>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Nombres -->
        <div>
          <label class="block text-gray-600 text-sm font-semibold"
            >Nombre</label
          >
          <p class="text-gray-800 text-base font-medium">
            {{ currentPatientDetail.firstName }}
          </p>
        </div>

        <div>
          <label class="block text-gray-600 text-sm font-semibold"
            >Apellido</label
          >
          <p class="text-gray-800 text-base font-medium">
            {{ currentPatientDetail.lastName }}
          </p>
        </div>

        <!-- Fecha y Género -->
        <div>
          <label class="block text-gray-600 text-sm font-semibold"
            >Fecha de Nacimiento</label
          >
          <p class="text-gray-800 text-base font-medium">
            {{ currentPatientDetail.dateOfBirth }}
          </p>
        </div>

        <div>
          <label class="block text-gray-600 text-sm font-semibold"
            >Género</label
          >
          <p class="text-gray-800 text-base font-medium">
            {{ currentPatientDetail.gender }}
          </p>
        </div>

        <!-- Email -->
        <div class="md:col-span-2">
          <label class="block text-gray-600 text-sm font-semibold">Email</label>
          <p class="text-gray-800 text-base font-medium">
            {{ currentPatientDetail.email }}
          </p>
        </div>

        <!-- SUS -->
        <div>
          <label class="block text-gray-600 text-sm font-semibold"
            >Código SUS</label
          >
          <p class="text-gray-800 text-base font-medium">
            {{ currentPatientDetail.susCode }}
          </p>
        </div>

        <!-- Centro de Salud -->
        <div>
          <label class="block text-gray-600 text-sm font-semibold"
            >Centro de Salud</label
          >
          <p class="text-gray-800 text-base font-medium">
            {{ currentPatientDetail.healthCenter.name }}
          </p>
        </div>

        <!-- Teléfono y Dirección -->
        <div>
          <label class="block text-gray-600 text-sm font-semibold"
            >Teléfono</label
          >
          <p class="text-gray-800 text-base font-medium">
            {{ currentPatientDetail.contactInfo.phone }}
          </p>
        </div>

        <div>
          <label class="block text-gray-600 text-sm font-semibold"
            >Dirección</label
          >
          <p class="text-gray-800 text-base font-medium">
            {{ currentPatientDetail.contactInfo.address }}
          </p>
        </div>

        <!-- Contacto de Emergencia -->
        <div class="md:col-span-2">
          <label class="block text-gray-600 text-sm font-semibold"
            >Contacto de Emergencia</label
          >
          <p class="text-gray-800 text-base font-medium">
            {{ currentPatientDetail.emergencyContact.name }}
          </p>
          <p class="text-sm text-gray-500">
            {{ currentPatientDetail.emergencyContact.relationship }}
          </p>
          <p class="text-sm text-gray-500">
            Tel: {{ currentPatientDetail.emergencyContact.phone }}
          </p>
        </div>

        <!-- Condiciones Médicas -->
        <div>
          <label class="block text-gray-600 text-sm font-semibold"
            >Condiciones Médicas</label
          >
          <p class="text-gray-800 text-base font-medium">
            {{ currentPatientDetail.medicalConditions }}
          </p>
        </div>

        <!-- Alergias -->
        <div>
          <label class="block text-gray-600 text-sm font-semibold"
            >Alergias</label
          >
          <p class="text-gray-800 text-base font-medium">
            {{ currentPatientDetail.allergies }}
          </p>
        </div>
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

const { visibleDetail, currentPatientDetail } = storeToRefs(usePatientStore());
const { onCreatePatient, onChangePatient, closeModalDetail } =
  usePatientStore();
</script>
