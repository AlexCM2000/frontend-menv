<template>
  <Dialog
    v-model:visible="visibleDetail"
    modal
    :style="{ minWidth: '45vw' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <template #header>
      <div class="font-semibold text-xl">Detalle del médico</div>
    </template>

    <template #default>
      <div v-if="currentDoctorDetail" class="grid grid-cols-1 md:grid-cols-2 gap-6">

        <!-- Avatar + nombre -->
        <div class="md:col-span-2 flex items-center gap-4">
          <div
            class="w-14 h-14 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xl flex-shrink-0"
          >
            {{ getInitials(currentDoctorDetail.name) }}
          </div>
          <div>
            <p class="text-gray-800 text-lg font-bold">{{ currentDoctorDetail.name }}</p>
            <p class="text-indigo-600 text-sm font-medium">{{ currentDoctorDetail.specialty }}</p>
          </div>
          <Tag
            :value="currentDoctorDetail.active ? 'Activo' : 'Inactivo'"
            :severity="currentDoctorDetail.active ? 'success' : 'secondary'"
            class="ml-auto"
          />
        </div>

        <div>
          <label class="block text-gray-600 text-sm font-semibold">N° de Licencia</label>
          <p class="text-gray-800 text-base font-medium">{{ currentDoctorDetail.licenseNumber }}</p>
        </div>

        <div>
          <label class="block text-gray-600 text-sm font-semibold">Años de experiencia</label>
          <p class="text-gray-800 text-base font-medium">
            {{ currentDoctorDetail.yearsOfExperience }}
            {{ currentDoctorDetail.yearsOfExperience === 1 ? "año" : "años" }}
          </p>
        </div>

        <div>
          <label class="block text-gray-600 text-sm font-semibold">Teléfono</label>
          <p class="text-gray-800 text-base font-medium">
            {{ currentDoctorDetail.contactInfo?.phone ?? "—" }}
          </p>
        </div>

        <div>
          <label class="block text-gray-600 text-sm font-semibold">Correo electrónico</label>
          <p class="text-gray-800 text-base font-medium">
            {{ currentDoctorDetail.contactInfo?.email ?? "—" }}
          </p>
        </div>

        <div class="md:col-span-2">
          <label class="block text-gray-600 text-sm font-semibold">Dirección</label>
          <p class="text-gray-800 text-base font-medium">
            {{ currentDoctorDetail.contactInfo?.address ?? "—" }}
          </p>
        </div>

        <div>
          <label class="block text-gray-600 text-sm font-semibold">Centro de salud</label>
          <p class="text-gray-800 text-base font-medium">
            {{ currentDoctorDetail.health?.name ?? "—" }}
          </p>
        </div>

        <div>
          <label class="block text-gray-600 text-sm font-semibold">Registrado</label>
          <p class="text-gray-800 text-base font-medium">
            {{ currentDoctorDetail.createdAt ?? "—" }}
          </p>
        </div>

      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { storeToRefs } from "pinia";
import Dialog from "primevue/dialog";
import Tag from "primevue/tag";
import { useDoctorStore } from "../store/doctorStore";

const { visibleDetail, currentDoctorDetail } = storeToRefs(useDoctorStore());

function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}
</script>
