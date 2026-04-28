import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/features/auth/stores/auth.store'

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/features/auth/views/Index.vue"),
    meta: { layout: "AuthLayout", guestOnly: true },
  },
  {
    path: "/",
    name: "Home",
    component: () => import("@/features/home/views/Index.vue"),
    meta: { layout: "AppLayout", requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  authStore.loadFromStorage()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'Login' }
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: 'Home' }
  }

  return true
})

export default router
