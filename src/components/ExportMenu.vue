<template>
  <div class="relative inline-block">
    <Button
      icon="pi pi-download"
      label="Exportar"
      size="small"
      outlined
      :loading="exporting"
      @click="toggle"
    />
    <Menu ref="menu" :model="items" popup />
  </div>
</template>

<script setup>
import { useExport } from "@/composables/useExport";
import Button from "primevue/button";
import Menu from "primevue/menu";
import { ref } from "vue";

const props = defineProps({
  /** Ruta del endpoint sin el prefijo /api, ej: '/export/patients' */
  endpoint: { type: String, required: true },
  /** Filtros activos del módulo (objeto con los mismos params que la tabla) */
  params: { type: Object, default: () => ({}) },
  /** Nombre base del archivo descargado */
  filename: { type: String, default: "reporte" },
});

const { exportFile, exporting } = useExport();
const menu = ref(null);

const toggle = (event) => menu.value.toggle(event);

const items = [
  {
    label: "Descargar PDF",
    icon: "pi pi-file-pdf",
    command: () => exportFile({ endpoint: props.endpoint, params: props.params, filename: props.filename, fileFormat: "pdf" }),
  },
  {
    label: "Descargar Excel",
    icon: "pi pi-file-excel",
    command: () => exportFile({ endpoint: props.endpoint, params: props.params, filename: props.filename, fileFormat: "xlsx" }),
  },
];
</script>
