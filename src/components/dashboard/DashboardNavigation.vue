<template>
  <div class="bg-white shadow rounded-lg mb-6 md:mb-8 p-3 md:p-4">
    <div class="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4">
      <router-link 
        to="/dashboard/applications" 
        class="px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center sm:justify-start"
        :class="[isApplicationsActive ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200']"
      >
        <span class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Мои заявления
        </span>
      </router-link>
      
      <router-link 
        to="/dashboard/profile" 
        class="px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center sm:justify-start"
        :class="[isProfileActive ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200']"
      >
        <span class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Мой профиль
        </span>
      </router-link>
      
      <router-link 
        to="/register" 
        class="px-3 md:px-4 py-2 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center justify-center sm:justify-start"
      >
        <span class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Подать новое заявление
        </span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const isApplicationsActive = computed(() => route.path.includes('/dashboard/applications'));
const isProfileActive = computed(() => route.path === '/dashboard/profile');
</script> 