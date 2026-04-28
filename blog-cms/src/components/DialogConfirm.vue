<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-sm p-4 sm:p-8" @mousedown.self="close">
        <Transition name="modal-slide">
          <div class="relative w-full max-w-md rounded-3xl border border-stone-200/80 bg-white shadow-[0_30px_80px_rgba(28,25,23,0.18)]">
            <!-- Header -->
            <div class="flex items-center justify-between border-b border-stone-200 px-6 py-4">
              <h3 class="text-sm font-medium text-stone-900">{{ title }}</h3>
              <button type="button" class="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700" @click="close">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <!-- Body -->
            <div class="p-6">
              <slot>{{ message }}</slot>
            </div>
            <!-- Footer -->
            <div class="flex justify-end gap-3 border-t border-stone-200 px-6 py-4">
              <button type="button" class="rounded-2xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-50" @click="close">
                {{ cancelText }}
              </button>
              <button type="button" class="rounded-2xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-800" @click="confirm">
                {{ confirmText }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, default: 'Konfirmasi' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: 'Ya' },
  cancelText: { type: String, default: 'Tidak' },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})

function close() {
  visible.value = false
}

function confirm() {
  emit('confirm')
  close()
}
</script>

<style scoped>
/* Reuse existing modal transitions */
.modal-fade-enter-active,
.modal-fade-leave-active { transition: opacity 200ms ease; }
.modal-fade-enter-from,
.modal-fade-leave-to { opacity: 0; }
.modal-slide-enter-active { transition: transform 250ms ease-out, opacity 250ms ease-out; }
.modal-slide-leave-active { transition: transform 200ms ease-in, opacity 200ms ease-in; }
.modal-slide-enter-from { transform: translateY(24px); opacity: 0; }
.modal-slide-leave-to { transform: translateY(12px); opacity: 0; }
</style>
