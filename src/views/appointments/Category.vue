<template>
  <div
    @click="onclick('Medicina general')"
    class="group relative cursor-pointer overflow-hidden bg-white px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:mx-auto sm:max-w-sm rounded-lg sm:px-10"
  >
    <span
      class="absolute top-10 z-0 h-20 w-20 rounded-full bg-sky-500 transition-all duration-300 group-hover:scale-[10]"
    ></span>
    <div class="relative z-10 mx-auto max-w-md">
      <span
        class="grid h-20 w-20 place-items-center rounded-full bg-sky-500 transition-all duration-300 group-hover:bg-sky-400"
      >
        <img
          src="\public\img\assistance.png"
          alt="asistencia"
          class="text-white transition-all"
        />
      </span>
      <div
        class="space-y-6 pt-5 text-base leading-7 text-gray-600 transition-all duration-300 group-hover:text-white/90"
      >
        <p>
          Especialidad que brinda prevención, diagnóstico y tratamiento de
          enfermedades comunes.
        </p>
      </div>
      <div class="pt-5 text-base font-semibold leading-7">
        <p>
          <a
            href="#"
            class="text-sky-500 text-3xl font-bold transition-all duration-300 group-hover:text-white"
            >Medicina general
          </a>
        </p>
      </div>
    </div>
  </div>
  <div
    @click="onclick('Odontologia')"
    class="group relative cursor-pointer overflow-hidden bg-white px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:mx-auto sm:max-w-sm rounded-lg sm:px-10"
  >
    <span
      class="absolute top-10 z-0 h-20 w-20 rounded-full bg-sky-500 transition-all duration-300 group-hover:scale-[10]"
    ></span>
    <div class="relative z-10 mx-auto max-w-md">
      <span
        class="grid h-20 w-20 place-items-center rounded-full bg-sky-500 transition-all duration-300 group-hover:bg-sky-400"
      >
        <img
          src="\public\img\dentistry.png"
          alt="asistencia"
          class="text-white transition-all"
        />
      </span>
      <div
        class="space-y-6 pt-5 text-base leading-7 text-gray-600 transition-all duration-300 group-hover:text-white/90"
      >
        <p>Atención integral para tu salud bucal y tratamientos dentales.</p>
        <br />
      </div>
      <div class="pt-5 text-base font-semibold leading-7">
        <p>
          <a
            href="#"
            class="text-sky-500 text-3xl font-bold transition-all duration-300 group-hover:text-white"
            >Odontología
          </a>
        </p>
      </div>
    </div>
  </div>
  <div
    @click="onclick('Telesalud')"
    class="group relative cursor-pointer overflow-hidden bg-white px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:mx-auto sm:max-w-sm rounded-lg sm:px-10"
  >
    <span
      class="absolute top-10 z-0 h-20 w-20 rounded-full bg-sky-500 transition-all duration-300 group-hover:scale-[10]"
    ></span>
    <div class="relative z-10 mx-auto max-w-md">
      <span
        class="grid h-20 w-20 place-items-center rounded-full bg-sky-500 transition-all duration-300 group-hover:bg-sky-400"
      >
        <img
          src="\public\img\medical-team.png"
          alt="asistencia"
          class="text-white transition-all"
        />
      </span>
      <div
        class="space-y-6 pt-5 text-base leading-7 text-gray-600 transition-all duration-300 group-hover:text-white/90"
      >
        <p>
          Atención médica a pacientes mediante el uso de equipos modernos y
          tratamientos a distancia.
        </p>
        <br />
      </div>
      <div class="pt-5 text-base font-semibold leading-7">
        <p>
          <a
            href="#"
            class="text-sky-500 text-3xl font-bold transition-all duration-300 group-hover:text-white"
            >Telesalud
          </a>
        </p>
      </div>
    </div>
  </div>
  <div
    @click="onclick('PAI')"
    class="group relative cursor-pointer overflow-hidden bg-white px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:mx-auto sm:max-w-sm rounded-lg sm:px-10"
  >
    <span
      class="absolute top-10 z-0 h-20 w-20 rounded-full bg-sky-500 transition-all duration-300 group-hover:scale-[10]"
    ></span>
    <div class="relative z-10 mx-auto max-w-md">
      <span
        class="grid h-20 w-20 place-items-center rounded-full bg-sky-500 transition-all duration-300 group-hover:bg-sky-400"
      >
        <img
          src="\public\img\vaccination.png"
          alt="asistencia"
          class="text-white transition-all"
        />
      </span>
      <div
        class="space-y-6 pt-5 text-base leading-7 text-gray-600 transition-all duration-300 group-hover:text-white/90"
      >
        <p>
          Estrategias para Acelerar la Inmunización y Proteger a la Comunidad.
        </p>
        <br />
      </div>
      <div class="pt-5 text-base font-semibold leading-7">
        <p>
          <a
            href="#"
            class="text-sky-500 text-3xl font-bold transition-all duration-300 group-hover:text-white"
            >Vacunas para todos PAI
          </a>
        </p>
      </div>
    </div>
  </div>
  <div
    @click="onclick('Bono Juana Azurduy')"
    class="group relative cursor-pointer overflow-hidden bg-white px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:mx-auto sm:max-w-sm rounded-lg sm:px-10"
  >
    <span
      class="absolute top-10 z-0 h-20 w-20 rounded-full bg-sky-500 transition-all duration-300 group-hover:scale-[10]"
    ></span>
    <div class="relative z-10 mx-auto max-w-md">
      <span
        class="grid h-20 w-20 place-items-center rounded-full bg-sky-500 transition-all duration-300 group-hover:bg-sky-400"
      >
        <img
          src="\public\img\mother.png"
          alt="asistencia"
          class="text-white transition-all"
        />
      </span>
      <div
        class="space-y-6 pt-5 text-base leading-7 text-gray-600 transition-all duration-300 group-hover:text-white/90"
      >
        <p>
          Apoyo a mujeres embarazadas y madres, promoviendo su salud y la de sus
          hijos.
        </p>
        <br />
      </div>
      <div class="pt-5 text-base font-semibold leading-7">
        <p>
          <a
            href="#"
            class="text-sky-500 text-3xl font-bold transition-all duration-300 group-hover:text-white"
            >Bono Juana Azurduy
          </a>
        </p>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useRouter } from "vue-router";
import { useServicesStore } from "@/stores/services";
import { storeToRefs } from "pinia";
import { useAppointmentsStore } from "@/stores/appointments";

const { getServices } = useServicesStore();
const { maxAppointments, services } = storeToRefs(useAppointmentsStore());
const router = useRouter();
const onclick = async (category) => {
  services.value = [];
  maxAppointments.value = false;
  await getServices(category);
  router.push({ name: "service-item" });
};
</script>
