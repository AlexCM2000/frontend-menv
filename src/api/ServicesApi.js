import api from "../lib/axios";

export default {
  all() {
    return api.get("/services");
  },
  getServiceCategory(category){
    return api.get(`/services/category/${category}`)
},
};
