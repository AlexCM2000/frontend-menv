import api from "@/lib/axios";

export default {
  getConfig:   ()     => api.get("/cdss-config"),
  updateConfig: (data) => api.put("/cdss-config", data),
  resetConfig:  ()     => api.post("/cdss-config/reset"),
};
