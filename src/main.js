import "./assets/main.css";

import { createApp } from "vue";
import PrimeVue from "primevue/config";
import Aura from "@primevue/themes/lara";
import "primeicons/primeicons.css";
import { createPinia } from "pinia";
import { plugin, defaultConfig } from "@formkit/vue";
import config from "../formkit.config";
import { useToast } from "vue-toast-notification";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import App from "./App.vue";
import router from "./router";

import "vue-toast-notification/dist/theme-sugar.css";

const $toast = useToast({
  duration: 5000,
  position: "top-right",
});

const app = createApp(App);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: "p",
      darkModeSelector: "light",
      cssLayer: false,
    },
  },
});

app.provide("toast", $toast);

app.use(createPinia());
app.use(plugin, defaultConfig(config));
app.use(router);

app.mount("#app");
