import { ref, inject } from "vue";
import { defineStore } from "pinia";
import CdssApi from "@/api/cdssApi";

export const useCdssStore = defineStore("cdss", () => {
  const config = ref(null);
  const loading = ref(false);
  const saving  = ref(false);
  const toast   = inject("toast");

  const loadConfig = async () => {
    try {
      loading.value = true;
      const { data } = await CdssApi.getConfig();
      config.value = data;
    } catch (error) {
      toast.open({ message: "Error al cargar configuración CDSS", type: "error" });
    } finally {
      loading.value = false;
    }
  };

  const saveConfig = async (vitalSigns) => {
    try {
      saving.value = true;
      const { data } = await CdssApi.updateConfig({ vitalSigns });
      config.value = data.config;
      toast.open({ message: "Configuración CDSS actualizada", type: "success" });
    } catch (error) {
      toast.open({
        message: error?.response?.data?.message ?? "Error al guardar configuración",
        type: "error",
      });
    } finally {
      saving.value = false;
    }
  };

  const resetConfig = async () => {
    try {
      saving.value = true;
      const { data } = await CdssApi.resetConfig();
      config.value = data.config;
      toast.open({ message: "Configuración restablecida a valores por defecto", type: "success" });
    } catch (error) {
      toast.open({ message: "Error al restablecer configuración", type: "error" });
    } finally {
      saving.value = false;
    }
  };

  return { config, loading, saving, loadConfig, saveConfig, resetConfig };
});
