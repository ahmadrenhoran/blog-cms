import { useAuthStore } from "@/features/auth/stores/auth.store";
import axios from "axios";

export interface ApiErrorResponse {
  success: false;
  message: string;
  code?: string;
  status?: number;
  errors?: unknown;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  timeout: 10000,
});

api.interceptors.request.use(config => {
  const authStore = useAuthStore()
  if (authStore.accessToken) {
    config.headers.Authorization = `Bearer ${authStore.accessToken}`
  }
  config.headers['X-Channel'] = 'cust_web_app'

  return config
}, error => {
  console.log(error)
  return Promise.reject(error)
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const responseData = err.response?.data;
    const normalizedError: ApiErrorResponse = {
      success: false,
      message: responseData?.message || err.message || 'Terjadi kesalahan. Silakan coba lagi.',
      code: responseData?.code,
      status: err.response?.status,
      errors: responseData?.errors,
    };

    if (normalizedError.status === 401) {
      const authStore = useAuthStore();
      authStore.logout();
    }

    return Promise.reject(normalizedError);
  },
);

export default api;





