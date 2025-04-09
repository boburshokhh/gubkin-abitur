<template>
  <div class="flex flex-col min-h-screen">
    <TheHeader />
    
    <main class="flex-grow">
      <div class="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <slot />
      </div>
    </main>
    
    <TheFooter />
  </div>
</template>

<script setup>
import TheHeader from './TheHeader.vue';
import TheFooter from './TheFooter.vue';
</script> 