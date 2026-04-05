import { generateClasses } from "@formkit/themes"

const config = {
  config: {
    classes: generateClasses({
      global: {
        wrapper: 'space-y-0 mb-0',
        label: 'block mb-1.5 text-sm font-medium text-gray-700',
        input: 'w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition',
        message: 'mt-1.5 text-xs text-red-500',
      },
      submit: {
        input: '$reset bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold w-full px-5 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1'
      }
    })
  }
}
export default config
