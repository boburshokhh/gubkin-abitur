<template>
  <article class="bg-white shadow rounded-lg overflow-hidden">
    <!-- Заголовок -->
    <header class="bg-primary-600 px-4 py-3 flex justify-between items-center">
      <h2 class="text-lg font-medium text-white">
        Заявление №{{ shortId }}
      </h2>
      <span :class="statusBadgeClass">
        {{ application.status?.name || 'Неизвестный статус' }}
      </span>
    </header>

    <!-- Содержимое -->
    <section class="p-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <dt class="text-sm text-gray-500">Дата подачи</dt>
          <dd class="text-gray-900">{{ formatDate(application.created_at) }}</dd>
        </div>
        <div>
          <dt class="text-sm text-gray-500">Последнее обновление</dt>
          <dd class="text-gray-900">{{ formatDate(application.updated_at) }}</dd>
        </div>
      </div>
      
      <div class="flex justify-end">
        <router-link 
          :to="`/dashboard/applications/${application.id}`" 
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Подробнее
        </router-link>
      </div>
    </section>
  </article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  application: {
    type: Object,
    required: true
  }
})

// Computed
const shortId = computed(() => props.application.id?.slice(-8) || 'N/A')

const statusBadgeClass = computed(() => {
  const base = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium'
  const statusClasses = {
    10: 'bg-blue-100 text-blue-800',
    11: 'bg-green-100 text-green-800',
    12: 'bg-red-100 text-red-800'
  }
  return `${base} ${statusClasses[props.application.status?.id] || 'bg-gray-100 text-gray-800'}`
})

// Утилиты
const formatDate = (dateString) => {
  if (!dateString) return 'Не указана'
  return new Date(dateString).toLocaleDateString('ru-RU', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  })
}
</script> 