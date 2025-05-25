<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full text-center">
      <h1 class="text-9xl font-bold text-primary-600">404</h1>
      <h2 class="mt-4 text-3xl font-medium text-gray-900">
        Страница не найдена
      </h2>
      <p class="mt-4 text-lg text-gray-600">
        К сожалению, страница, которую вы ищете, не существует или была перемещена.
      </p>
      <div class="mt-8">
        <BaseButton tag="router-link" to="/" variant="primary" size="lg">
          Вернуться на главную
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue';;
</script> 