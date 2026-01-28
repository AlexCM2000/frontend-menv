import HealthApi from "@/api/HealthApi";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useHealthStore = defineStore("health", () => {
    const healths = ref([]);

   const getHealths = async () => {
    try {
      const { data } = await HealthApi.all();
      healths.value = data.map(center => ({
        value: center.codigo, // Asignamos el codigo como value
        label: center.name,   // Asignamos el nombre como label
      }));
    } catch (error) {
      console.log(error);
    }
  };
    return{
        healths,
        getHealths
    }
})  