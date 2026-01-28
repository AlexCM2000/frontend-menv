import AppointmentApi from "@/api/AppointmentApi";
import AuthApi from "@/api/AuthApi";
import { defineStore } from "pinia";
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";

 
 export const useUserStore = defineStore("user",()=>{

    const router = useRouter()
    const user = ref(null)
    const userAppointments = ref([])
    const loading = ref(false)
    const page = ref(1)
    const page_size=ref(10)
    const search = ref('')
    const totalRecords=ref(0)
    const page_first = ref(0)
    const health = ref('')
    
    //traer las citas del cliente logueado
    const getUserAppointments =async(id)=>{
        try {
            loading.value = true
            if(id){
                const {data} = await AppointmentApi.getUserAppointments({id:id},
                    {page:page.value,
                     page_size:page_size.value,
                     ...((search.value ) && { search: search.value }),
                     ...(health.value && { health: health.value })})
                userAppointments.value = data.results
                loading.value = false
                totalRecords.value = data.count
            }
        } catch (error) {
            console.log(error)
            loading.value = false
        }
    }


    const onPage=async(event)=>{
        page.value=event.page+1
        page_size.value=event.rows
      await  getUserAppointments(user.value._id)
      console.log(event)
    }
    const onSearch=async(value)=>{
        if(value!=='') search.value=value
        else search.value=null
       await getUserAppointments(user.value._id)
    }

    const getSelectedHealths =async(value)=>{
        if(value!==''){
            health.value=value
        }
        else{
            health.value=null
        }
        await getUserAppointments(user.value._id)
    }
    
   

    const logout =()=>{
        localStorage.removeItem("token")
        user.value = null
        router.push({name:"login"})
    }


    const getUser=async()=>{
        try{
            const {data} = await AuthApi.auth()
            user.value=data
        } catch(error){
            console.log(error)
        }
    }

    const getUserName = computed(() =>
        user.value?.name ? user.value?.name : ''
      );

      
    const noAppointments =computed(()=>userAppointments.value.length === 0)

    return{
        user,
        userAppointments,
        getUserName,
        noAppointments,
        getUserAppointments,
        loading,
        logout,
        getUser,
        onPage,
        page,
        page_size,search   ,onSearch,
        totalRecords,
        page_first,
        getSelectedHealths
    }
 })