<script setup lang="ts">
import { reactive, ref } from 'vue'
import TextField from '@/components/forms/TextField.vue'
import { login, register } from '../services/auth.service'
import { useRouter } from 'vue-router'
import LoadButton from '@/components/forms/LoadButton.vue'
import { useAuthStore } from '../stores/auth.store'
import { getErrorMessage } from '@/utils/utils'

const router = useRouter()
const authStore = useAuthStore()
const isLogin = ref(true)
const isLoading = ref(false)

// Form states
const name = ref('')
const email = ref('')
const password = ref('')

const error = reactive({
  isError: false,
  message: '',
})

function showError(msg: string) {
  error.isError = true
  error.message = msg
}



function clearError() {
  error.isError = false
  error.message = ''
}

const toggleMode = () => {
  isLogin.value = !isLogin.value
  clearError()
  name.value = ''
  email.value = ''
  password.value = ''
}

const handleSubmit = async () => {
  // if (!email || !/\S+@\S+\.\S+/.test(email)) {
  //   showError('Masukkan email yang valid.')
  //   return
  // }

  clearError()
  isLoading.value = true
  try {
    if (isLogin.value) {
      const res = await login({ email: email.value, password: password.value })
      if (res.data.success === true) {
        authStore.login(res.data.data)
        router.push('/')
      } else {
        throw new Error(res.data.message)
      }
    } else {
      const res = await register({ name: name.value, email: email.value, password: password.value })
      if (res.data.success === true) {
        isLogin.value = true
        name.value = ''
        password.value = ''
        return
      }

      throw new Error(res.data.message)
    }
  } catch (error: any) {
    showError(getErrorMessage(error))
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="relative w-full max-w-md">
    <div class="absolute inset-x-10 top-0 h-24 rounded-full bg-amber-300/25 blur-3xl"></div>

    <section
      class="relative overflow-hidden rounded-[28px] border border-stone-200/80 bg-[rgba(255,252,248,0.9)] p-6 shadow-[0_24px_70px_rgba(28,25,23,0.12)] backdrop-blur-xl sm:p-8">
      <div
        class="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.85),rgba(255,255,255,0.18)_28%,transparent_100%)]">
      </div>

      <div class="relative text-center mb-4">
        <p class="text-xs font-medium uppercase tracking-[0.28em] text-stone-500">
          Everyone's Blog
        </p>
        <h2 class="mt-3 font-serif text-3xl font-semibold tracking-[-0.03em] text-stone-900 sm:text-[2.1rem]">
          {{ isLogin ? 'Welcome to your writing space' : 'Start your story here' }}
        </h2>
        <p class="mt-3 text-sm leading-6 text-stone-600">
          {{ isLogin
            ? 'Masuk untuk menulis, mengelola draft, dan membagikan cerita ke pembaca.'
            : 'Buat akun baru dan mulai menulis blog dengan tampilan yang bersih dan nyaman.' }}
        </p>
      </div>

      <transition enter-active-class="transition-all duration-250 ease-out"
        leave-active-class="transition-all duration-200 ease-in" enter-from-class="opacity-0 -translate-y-1.5"
        leave-to-class="opacity-0">
        <div v-if="error.isError"
          class="bg-red-50 border-[0.5px] border-red-400 text-red-700 text-xs rounded-[10px] py-2.5 px-3 mt-3">{{
            error.message }}</div>
      </transition>

      <form @submit.prevent="handleSubmit" class="relative mt-4 space-y-4">
        <TextField v-if="!isLogin" v-model="name" label="Full Name" placeholder="Nama lengkap" autocomplete="name" :is-error="error.isError"
          required />

        <TextField v-model="email" type="email" label="Email" placeholder="nama@email.com" autocomplete="email"
          :is-error="error.isError" required />

        <TextField v-model="password" type="password" label="Password" placeholder="Masukkan password"
          autocomplete="current-password" :is-error="error.isError" required />

        <LoadButton type="submit" :isLoading="isLoading" :label="isLogin ? 'Masuk' : 'Buat Akun'" />
      </form>

      <div
        class="relative mt-6 flex flex-col gap-3 border-t border-stone-200 pt-5 text-center text-sm text-stone-600 sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <p class="m-0">
          {{ isLogin ? "Belum punya akun?" : "Sudah punya akun?" }}
        </p>
        <div class="flex flex-col gap-2 sm:flex-row">
          <RouterLink
            to="/api-docs"
            class="inline-flex items-center justify-center rounded-full border border-stone-200 bg-white px-4 py-2 font-medium text-stone-900 transition-colors hover:bg-stone-50"
          >
            API Docs
          </RouterLink>
          <button @click="toggleMode" type="button"
            class="inline-flex items-center justify-center rounded-full border border-stone-200 bg-white px-4 py-2 font-medium text-stone-900 transition-colors hover:bg-stone-50">
            {{ isLogin ? 'Daftar' : 'Kembali ke Login' }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
