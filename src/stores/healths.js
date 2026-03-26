import HealthApi from "@/api/HealthApi";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useHealthStore = defineStore("health", () => {
  const healths = ref([]);

  const getHealths = async () => {
    try {
      const { data } = await HealthApi.all();
      console.log(data);
      healths.value = data.map((center) => ({
        value: center.codigo,
        label: center.name,
        id: center._id,
      }));
    } catch (error) {
      console.log(error);
    }
  };
  return {
    healths,
    getHealths,
  };
});
