import api from "../lib/axios"

export default{
    create(data){
        return api.post('/appointments',data)
    },
    getByDate(date){
        return api.get(`/appointments?date=${date}`)
    },
    getUserAppointments(userId,params){
         // Construir la URL base
    let url = `/users/${userId.id}/appointments?page=${params.page}&page_size=${params.page_size}`;
    
    // Agregar el parámetro search solo si tiene un valor válido
    if (params.search) {
        url += `&search=${encodeURIComponent(params.search)}`;
    }
    
    // Agregar el parámetro health solo si tiene un valor válido
    if (params.health) {
        url += `&health=${encodeURIComponent(params.health)}`;
    }

    return api.get(url);
    },
    getById(userId){
        return api.get(`/appointments/${userId}`)
    },
    update(id,data){
        console.log("este es el id",id)
        console.log("este es la data",data)
        return api.patch(`/appointments/${id}`,data)
    },
    delete(id){
        return api.delete(`/appointments/${id}`)
    }
    
}