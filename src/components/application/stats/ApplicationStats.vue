<template>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
    <div class="bg-white rounded-lg shadow p-4">
      <h3 class="text-sm font-medium text-gray-500 mb-1">Всего заявок</h3>
      <p class="text-2xl font-semibold text-gray-900">{{ totalApplications }}</p>
    </div>
    <div class="bg-white rounded-lg shadow p-4">
      <h3 class="text-sm font-medium text-gray-500 mb-1">Новых заявок</h3>
      <p class="text-2xl font-semibold text-blue-600">{{ newApplicationsCount }}</p>
    </div>
    <div class="bg-white rounded-lg shadow p-4">
      <h3 class="text-sm font-medium text-gray-500 mb-1">Требуют внимания</h3>
      <p class="text-2xl font-semibold text-yellow-600">{{ submittedApplicationsCount }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  totalApplications: {
    type: Number,
    default: 0
  },
  newApplicationsCount: {
    type: Number,
    default: 0
  },
  submittedApplicationsCount: {
    type: Number,
    default: 0
  }
});
</script> 