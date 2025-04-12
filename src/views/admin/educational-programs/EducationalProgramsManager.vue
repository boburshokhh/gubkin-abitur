<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-4">Управление образовательными программами</h1>
      <p class="text-gray-600">
        Панель управления направлениями, профилями и специальностями для приемной кампании.
      </p>
    </div>
    
    <!-- Навигация по вкладкам -->
    <div class="mb-6 border-b border-gray-200">
      <nav class="-mb-px flex">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="currentTab = tab.id"
          class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center mr-8"
          :class="[
            currentTab === tab.id
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          <span v-html="tab.icon" class="w-5 h-5 mr-2"></span>
          {{ tab.name }}
        </button>
      </nav>
    </div>
    
    <!-- Содержимое вкладок -->
    <div class="bg-white rounded-lg shadow-sm">
      <DirectionsManagement v-if="currentTab === 'directions'" />
      <ProfilesManagement v-else-if="currentTab === 'profiles'" />
      <SpecialtiesManagement v-else-if="currentTab === 'specialties'" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import DirectionsManagement from './DirectionsManagement.vue';
import ProfilesManagement from './ProfilesManagement.vue';
import SpecialtiesManagement from './SpecialtiesManagement.vue';

// Определение вкладок
const tabs = [
  { 
    id: 'directions', 
    name: 'Направления', 
    icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>' 
  },
  { 
    id: 'profiles', 
    name: 'Профили', 
    icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7z" /></svg>' 
  },
  { 
    id: 'specialties', 
    name: 'Специальности', 
    icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>' 
  }
];

// Текущая активная вкладка
const currentTab = ref('directions');
</script> 