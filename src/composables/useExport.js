import api from "@/lib/axios";
import { format } from "date-fns";
import { ref } from "vue";

/**
 * Composable reutilizable para exportar reportes (PDF o Excel).
 *
 * Uso:
 *   const { exportFile, exporting } = useExport()
 *   await exportFile({ endpoint: '/export/patients', params: { search: 'Juan' }, filename: 'pacientes', fileFormat: 'pdf' })
 */
export function useExport() {
  const exporting = ref(false);

  const exportFile = async ({ endpoint, params = {}, filename, fileFormat }) => {
    exporting.value = true;
    try {
      const response = await api.get(endpoint, {
        params: { ...params, format: fileFormat },
        responseType: "blob",
      });

      // Detectar si la respuesta es un error JSON (en vez de un archivo)
      if (response.data?.type === "application/json") {
        const text = await response.data.text();
        console.error("Export error:", JSON.parse(text));
        return;
      }

      const ext        = fileFormat === "pdf" ? "pdf" : "xlsx";
      const dateStr    = format(new Date(), "yyyy-MM-dd");
      const fullName   = `${filename}_${dateStr}.${ext}`;
      const mimeType   = fileFormat === "pdf"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

      const blob = new Blob([response.data], { type: mimeType });
      const url  = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href     = url;
      link.download = fullName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al exportar:", error);
    } finally {
      exporting.value = false;
    }
  };

  return { exportFile, exporting };
}
