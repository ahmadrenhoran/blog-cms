<template>
  <div class="auth-shell min-h-screen overflow-hidden bg-[var(--auth-bg)] text-stone-900">
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(190,154,106,0.18),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(217,119,87,0.12),transparent_24%)]"></div>
    <div class="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(120,113,108,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(120,113,108,0.06)_1px,transparent_1px)] [background-size:96px_96px]"></div>

    <div class="relative mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <main class="relative flex w-full items-center justify-center">
        <slot />
      </main>
    </div>
  </div>
</template>
