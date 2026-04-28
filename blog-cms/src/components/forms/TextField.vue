<template>
  <div class="relative w-full">
    <div v-if="label" class="mb-2 flex items-center justify-between gap-3">
      <label
        :for="resolvedId"
        class="text-xs font-medium uppercase tracking-[0.22em] text-stone-500"
      >
        {{ label }}
      </label>
      <span v-if="helper" class="text-xs text-stone-400">
        {{ helper }}
      </span>
    </div>

    <div
      class="flex items-center rounded-2xl border bg-white transition-all duration-200 focus-within:border-stone-400 focus-within:ring-4 focus-within:ring-amber-100"
      :class="[
        wrapperClass,
        isError ? 'border-red-300 ring-4 ring-red-100' : 'border-stone-200',
      ]"
    >
      <div v-if="$slots.prefix" class="flex shrink-0 items-center pl-4 text-stone-400">
        <slot name="prefix"></slot>
      </div>

      <input
        :id="resolvedId"
        :value="modelValue"
        :type="inputType"
        :placeholder="placeholder"
        class="w-full flex-1 rounded-2xl border-none bg-transparent py-3.5 text-sm text-stone-900 outline-none placeholder:text-stone-400"
        :class="[
          !$slots.prefix ? 'pl-4' : 'pl-2.5',
          type === 'password' || $slots.suffix ? 'pr-2' : 'pr-4',
          inputClass,
        ]"
        v-bind="$attrs"
        @input="emit('update:modelValue', $event.target.value)"
      />

      <div
        v-if="type === 'password' || $slots.suffix"
        class="flex shrink-0 items-center pr-3"
      >
        <slot v-if="$slots.suffix && type !== 'password'" name="suffix"></slot>

        <button
          v-if="type === 'password'"
          type="button"
          class="rounded-full p-1 text-stone-400 transition-colors hover:text-stone-700 focus:outline-none"
          tabindex="-1"
          @click="togglePassword"
        >
          <svg
            v-if="!showPassword"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="h-4 w-4"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>

          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="h-4 w-4"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
            />
          </svg>
        </button>
      </div>
    </div>

    <transition
      enter-active-class="transition-all duration-200 ease-out"
      leave-active-class="transition-all duration-150 ease-in"
      enter-from-class="translate-y-[-4px] opacity-0"
      leave-to-class="opacity-0"
    >
      <p
        v-if="isError && errorMessage"
        class="mt-2 text-xs text-red-600"
      >
        {{ errorMessage }}
      </p>
    </transition>
  </div>
</template>

<script setup>
import { computed, ref, useId } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  label: {
    type: String,
    default: '',
  },
  helper: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  id: {
    type: String,
    default: '',
  },
  inputClass: {
    type: String,
    default: '',
  },
  wrapperClass: {
    type: String,
    default: '',
  },
  isError: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const generatedId = useId()
const showPassword = ref(false)

const resolvedId = computed(() => props.id || `field-${generatedId}`)

const inputType = computed(() => {
  if (props.type === 'password') {
    return showPassword.value ? 'text' : 'password'
  }

  return props.type
})

const togglePassword = () => {
  showPassword.value = !showPassword.value
}
</script>
