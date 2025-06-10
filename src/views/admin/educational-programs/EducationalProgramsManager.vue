<template>
  <div>
    <div class="mb-6 border-b border-gray-200">
      <nav class="-mb-px flex space-x-8">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="currentTab = tab.id"
          class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
          :class="[
            currentTab === tab.id
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          {{ tab.name }}
        </button>
      </nav>
    </div>

    <div v-if="currentTab === 'directions'" class="mt-4">
    <ProgramsManagement />
    </div>

    <div v-else-if="currentTab === 'profiles'" class="mt-4">
      <ProfilesManagement />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ProgramsManagement from './ProgramsManagement.vue';
import ProfilesManagement from './ProfilesManagement.vue';

const tabs = [
  { id: 'directions', name: 'Направления' },
  { id: 'profiles', name: 'Профили и специализации' }
];

const currentTab = ref('directions');
</script> 