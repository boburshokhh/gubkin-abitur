<template>
  <div class="bg-white shadow rounded-lg p-6 text-center">
    <svg class="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    <h2 class="text-xl font-medium text-gray-900 mb-2">У вас пока нет заявлений</h2>
    <p class="text-gray-600 mb-4">Подайте документы для поступления, заполнив форму</p>
    <router-link 
      to="/register" 
      class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
    >
      Подать заявление
    </router-link>
  </div>
</template>

<script setup>
// Импорты иконок убраны, используем обычные SVG
</script> 