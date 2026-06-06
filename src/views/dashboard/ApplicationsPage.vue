<template>
  <main class="container mx-auto px-4 py-6">
    <h1 class="text-2xl font-bold mb-6">Мои заявления</h1>

    <!-- Навигация -->
    <nav class="bg-white shadow rounded-lg mb-6 p-4">
      <div class="flex flex-wrap gap-2">
        <router-link 
          v-for="item in navItems" 
          :key="item.path"
          v-show="item.visible !== false"
          :to="item.path" 
          :class="getNavClass(item.path)"
        >
          <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
            </svg>
          {{ item.label }}
        </router-link>
      </div>
    </nav>

    <!-- Загрузка -->
    <div v-if="isLoading" class="flex justify-center my-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <!-- Ошибка -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
      <div class="flex items-center">
        <svg class="h-6 w-6 text-red-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 class="font-medium">Ошибка при загрузке заявлений</h3>
          <p class="mt-1">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Пустое состояние -->
    <EmptyState v-else-if="!applications.length" />

    <!-- Список заявлений -->
    <div v-else class="space-y-4">
      <ApplicationCard 
        v-for="application in applications" 
        :key="application.id" 
        :application="application"
      />
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useApplicationStore } from '@/stores/application'
import { useRoute } from 'vue-router'
import { useAdmissionStatus } from '@/composables/useAdmissionStatus'

// Компоненты
import EmptyState from '@/components/shared/EmptyState.vue'
import ApplicationCard from '@/components/application/ApplicationCard.vue'

const route = useRoute()
const appStore = useApplicationStore()
const { isAdmissionOpen } = useAdmissionStatus()

// Состояние
const applications = ref([])
const isLoading = ref(true)
const error = ref('')

// Конфигурация
const navItems = computed(() => [
  { 
    path: '/dashboard/applications', 
    label: 'Мои заявления', 
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
  },
  { 
    path: '/dashboard/profile', 
    label: 'Мой профиль', 
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
  },
  { 
    path: '/register',
    label: 'Подать новое заявление',
    visible: isAdmissionOpen.value,
    icon: 'M12 4v16m8-8H4',
    primary: true 
  }
])

// Утилиты
const getNavClass = (path) => {
  const base = 'flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors'
  const item = navItems.find(item => item.path === path)
  const isActive = route.path === path || 
    (path.includes('applications') && route.path.includes('applications') && !route.params.id)
  
  if (item?.primary) return `${base} bg-green-600 text-white hover:bg-green-700`
  return isActive ? `${base} bg-primary-600 text-white` : `${base} bg-gray-100 text-gray-800 hover:bg-gray-200`
}

// Жизненный цикл
onMounted(async () => {
  try {
    const success = await appStore.loadUserApplications()
    applications.value = success ? appStore.userApplications : []
    if (!success) error.value = appStore.error || 'Не удалось загрузить заявления'
  } catch (err) {
    console.error('Ошибка при загрузке заявлений:', err)
    error.value = err.message || 'Произошла ошибка при загрузке заявлений'
  } finally {
    isLoading.value = false
  }
})
</script> 