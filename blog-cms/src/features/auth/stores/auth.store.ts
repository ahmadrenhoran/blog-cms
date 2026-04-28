import { defineStore } from "pinia";
import { computed, ref } from "vue";

export interface User {
    id: number;
    name: string;
    email: string;
}

export const useAuthStore = defineStore('auth', () => {
    const storageKey = 'everyones_blog_auth';

    const user = ref<User | null>(null);
    const accessToken = ref<string | null>(null);

    const isAuthenticated = computed(() => Boolean(accessToken.value));

    function loadFromStorage() {
        const storedAuth = localStorage.getItem(storageKey);

        if (!storedAuth) {
            return;
        }

        try {
            const parsedAuth = JSON.parse(storedAuth);
            user.value = parsedAuth.user ?? null;
            accessToken.value = parsedAuth.token ?? null;
        } catch {
            localStorage.removeItem(storageKey);
        }
    }

    function login(authData: { user: User; token: string }) {
        user.value = authData.user;
        accessToken.value = authData.token;

        localStorage.setItem(storageKey, JSON.stringify(authData));
    }

    function logout() {
        user.value = null;
        accessToken.value = null;
        localStorage.removeItem(storageKey);
    }

    return { 
        user, accessToken, isAuthenticated,
        loadFromStorage, login, logout 
    };
});
