<template>
  <nav class="sticky top-0 z-30 border-b border-stone-200/50 bg-white/60 backdrop-blur-2xl transition-all duration-300">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
      
      <!-- Logo section -->
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-stone-800 to-stone-950 text-base font-bold text-white shadow-md ring-1 ring-white/10">
          B
        </div>
        <div class="flex flex-col">
          <span class="font-serif text-lg font-bold tracking-tight text-stone-900 leading-none">BlogCMS</span>
          <span class="text-[10px] font-medium uppercase tracking-widest text-stone-500 mt-1">Creator Workspace</span>
        </div>
      </div>

      <!-- User section -->
      <div class="flex items-center gap-5">
        <div class="hidden sm:flex items-center gap-3">
          <div class="flex flex-col items-end">
            <span class="text-sm font-semibold text-stone-800">{{ userName }}</span>
            <span class="text-xs text-stone-500">Author</span>
          </div>
          <div class="h-9 w-9 rounded-full bg-stone-200 border-2 border-white shadow-sm flex items-center justify-center text-stone-600 font-medium">
            {{ userInitials }}
          </div>
        </div>
        
        <div class="h-6 w-px bg-stone-200 hidden sm:block"></div>

        <button 
          type="button" 
          class="group flex items-center gap-2 rounded-full border border-stone-200/80 bg-white/80 px-4 py-2 text-xs font-semibold text-stone-600 transition-all hover:bg-red-50 hover:border-red-200 hover:text-red-600 shadow-sm"
          @click="emit('logout')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Keluar
        </button>
      </div>

    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  userName: {
    type: String,
    default: 'Writer'
  }
})

const emit = defineEmits(['logout'])

const userInitials = computed(() => {
  if (!props.userName) return 'W'
  const parts = props.userName.split(' ')
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
  }
  return props.userName.substring(0, 2).toUpperCase()
})
</script>
