import api from "@/lib/axios";

export default {
  getStock:        (params)     => api.get("/stock", { params }),
  getAvailable:    (params)     => api.get("/stock/available", { params }),
  getExpiring:     (params)     => api.get("/stock/expiring", { params }),
  createStock:     (data)       => api.post("/stock", data),
  updateStock:     (id, data)   => api.put(`/stock/${id}`, data),
  toggleActive:    (id)         => api.patch(`/stock/${id}/toggle`),
};
