import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import AppointmentsLayout from "../views/appointments/AppointmentsLayout.vue";
import AuthApi from "@/api/AuthApi";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/admin",
      name: "admin",
      component: () => import("@/views/admin/AdminLayout.vue"),
      children: [
        {
          path: "",
          name: "admin-appointments",
          component: () => import("@/views/admin/AppointmentView.vue"),
        },

        {
          path: "health-records",
          name: "my-health-records",
          component: () =>
            import("../modules/medical-record/components/DatatableHealthRecords.vue"),
        },
        {
          path: "users",
          name: "users",
          component: () => import("@/modules/users/view/UserView.vue"),
        },
      ],
    },
    {
      path: "/pacientes",
      name: "patients",
      component: () => import("@/views/admin/AdminLayout.vue"),
      children: [
        {
          path: "",
          name: "patients-list",
          component: () => import("@/modules/patient/view/PatientView.vue"),
        },
      ],
    },

    {
      path: "/reservaciones",
      name: "appointments",
      component: AppointmentsLayout,
      meta: { requiredAuth: true },
      children: [
        {
          path: "",
          name: "my-appointments",
          component: () =>
            import("../views/appointments/MyAppointmentsView.vue"),
        },
        {
          path: "nueva",
          component: () =>
            import("../views/appointments/NewAppointmentLayout.vue"),
          children: [
            {
              path: "",
              name: "new-appointment",
              component: () => import("../views/appointments/ServicesView.vue"),
            },
            {
              path: "service-item",
              name: "service-item",
              component: () => import("../views/appointments/ServiceItem.vue"),
            },
            {
              path: "detalles",
              name: "appointment-details",
              component: () =>
                import("../views/appointments/AppointmentView.vue"),
            },
          ],
        },
        {
          path: ":id/editar",
          component: () =>
            import("../views/appointments/EditAppointmentLayout.vue"),
          children: [
            {
              path: "",
              name: "edit-appointment",
              component: () => import("../views/appointments/ServicesView.vue"),
            },
            {
              path: "detalles",
              name: "edit-appointment-details",
              component: () =>
                import("../views/appointments/AppointmentView.vue"),
            },
          ],
        },
      ],
    },
    {
      path: "/auth",
      name: "auth",
      component: () => import("../views/auth/AuthLayout.vue"),
      children: [
        {
          path: "registro",
          name: "register",
          component: () => import("../views/auth/RegisterView.vue"),
        },
        {
          path: "confirmar-cuenta/:token",
          name: "confirm-account",
          component: () => import("../views/auth/ConfirmAccountView.vue"),
        },
        {
          path: "iniciar-sesion",
          name: "login",
          component: () => import("../views/auth/LoginView.vue"),
        },
        {
          path: "olvide-password",
          name: "forgot-password",
          component: () => import("../views/auth/ForgotPasswordView.vue"),
        },
        {
          path: "olvide-password/:token",
          name: "new-password",
          component: () => import("../views/auth/NewPasswordView.vue"),
        },
      ],
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const requiredAuth = to.matched.some((url) => url.meta.requiredAuth);

  if (requiredAuth) {
    try {
      const { data } = await AuthApi.auth();
      console.log(data);
      if (data.admin || data.branchManager) {
        next("/admin");
      } else {
        next();
      }
    } catch (error) {
      next({ name: "login" });
    }
  } else {
    next();
  }
});

export default router;
