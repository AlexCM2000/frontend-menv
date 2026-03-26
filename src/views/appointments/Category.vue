<template>
  <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-5">
    <Skeleton v-for="i in 4" :key="i" height="180px" class="rounded-xl" />
  </div>
  <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-5">
    <div
      v-for="cat in categories"
      :key="cat._id"
      @click="onSelectCategory(cat.name)"
      class="group relative cursor-pointer overflow-hidden bg-white px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:mx-auto w-full rounded-lg sm:px-10"
    >
      <span class="absolute top-10 z-0 h-20 w-20 rounded-full bg-sky-500 transition-all duration-300 group-hover:scale-[10]"></span>
      <div class="relative z-10 mx-auto max-w-md">
        <span class="grid h-20 w-20 place-items-center rounded-full bg-sky-500 transition-all duration-300 group-hover:bg-sky-400">
          <img :src="`/img/${cat.icon}`" :alt="cat.name" class="h-12 w-12 object-contain" />
        </span>
        <div class="space-y-6 pt-5 text-base leading-7 text-gray-600 transition-all duration-300 group-hover:text-white/90">
          <p>{{ cat.description }}</p>
        </div>
        <div class="pt-5 text-base font-semibold leading-7">
          <p>
            <a href="#" class="text-sky-500 text-2xl font-bold transition-all duration-300 group-hover:text-white">
              {{ cat.name }}
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useServicesStore } from "@/stores/services";
import { useAppointmentsStore } from "@/stores/appointments";
import { storeToRefs } from "pinia";
import CategoryApi from "@/api/CategoryApi";
import Skeleton from "primevue/skeleton";

const router = useRouter();
const { getServices } = useServicesStore();
const { maxAppointments, services } = storeToRefs(useAppointmentsStore());
const { setSelectedCategory } = useAppointmentsStore();

const categories = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const { data } = await CategoryApi.getAll({ active: true });
    categories.value = data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
});

const onSelectCategory = async (categoryName) => {
  services.value = [];
  maxAppointments.value = false;
  setSelectedCategory(categoryName);
  await getServices(categoryName);
  router.push({ name: "service-item" });
};
</script>