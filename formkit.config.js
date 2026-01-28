import { generateClasses } from "@formkit/themes"

const config={
    config:{
        classes:generateClasses({
            global:{
                wrapper:'space-y-2 mb-0',
                message: 'text-red-600 text-sm font-semibold mt-1', // Estilo de mensaje sin fondo y más formal
                label:'block mb-1 font-bold text-lg text-[#3A3A3A] mt-3',
                input:'w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500',
            },
            submit:{
                input:'$reset bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-bold w-full p-3 mt-10'
            } 
        })
    }
}
export default config