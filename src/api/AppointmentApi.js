import api from "../lib/axios"

export default{
    create(data){
        return api.post('/appointments',data)
    },
    getByDate(date){
        return api.get(`/appointments?date=${date}`)
    },
    getUserAppointments(userId, params) {
        return api.get(`/users/${userId.id}/appointments`, { params });
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
    },
    getCalendar(start, end) {
        return api.get(`/appointments/calendar?start=${start}&end=${end}`)
    }

}