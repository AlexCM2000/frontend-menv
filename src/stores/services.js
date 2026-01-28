import { defineStore } from "pinia";
import { ref, onMounted } from "vue";
import ServicesApi from "@/api/ServicesApi";

export const useServicesStore = defineStore("services", () => {
  const services = ref([]);

  onMounted(async () => {
  
  });

  const getServices = async (category) => {
    try {
      const { data } = await ServicesApi.getServiceCategory(category);
      services.value = data;
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  return { services,getServices };
});
