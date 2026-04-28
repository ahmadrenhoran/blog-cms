<template>
  <div class="relative min-h-screen">
    
    <component :is="layout">
      <router-view />
    </component>

  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AuthLayout from '@/layouts/AuthLayout.vue'
import AppLayout from '@/layouts/AppLayout.vue'

const route = useRoute();

const layouts = {
  AuthLayout,
  AppLayout,
};

const layout = computed(() => {
  return layouts[route.meta.layout] || 'div';
});
</script>