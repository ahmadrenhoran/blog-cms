<script setup lang="ts">
import type { PropType } from 'vue';

defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: "Submit",
  },
  loadingText: {
    type: String,
    default: "Loading...",
  },
  type: {
    type: String as PropType<"button" | "submit" | "reset">,
    default: "button", // atau "submit"
  },
  fullWidth: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["click"]);

const handleClick = (e: Event) => {
  emit("click", e);
};
</script>

<template>
  <button
    :type="type"
    @click="handleClick"
    :disabled="isLoading"
    :class="[
      'inline-flex items-center justify-center rounded-2xl px-5 py-3.5 text-sm font-semibold text-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-stone-200',
      'bg-stone-900 hover:bg-stone-800 shadow-[0_18px_36px_rgba(28,25,23,0.18)]',
      fullWidth ? 'w-full' : '',
      isLoading ? 'opacity-70 cursor-not-allowed' : ''
    ]"
  >
    <span v-if="isLoading" class="flex items-center gap-2">
      <!-- Spinner -->
      <svg
        class="h-5 w-5 animate-spin text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8z"
        />
      </svg>

      {{ loadingText }}
    </span>

    <span v-else>
      <slot>
        {{ label }}
      </slot>
    </span>
  </button>
</template>