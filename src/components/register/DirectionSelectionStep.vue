<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Выберите направление обучения</label>
      <select 
        v-model="modelValue.direction" 
        class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
        @change="$emit('direction-change')"
      >
        <option value="">Выберите направление</option>
        <option v-for="direction in availableDirections" :key="direction.id" :value="direction.id">
          {{ direction.name }}
        </option>
      </select>
      <p v-if="errors.direction" class="mt-1 text-sm text-red-600">{{ errors.direction }}</p>
    </div>
    
    <!-- Выбор профиля, если доступен для направления -->
    <div v-if="availableProfiles.length > 0">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        <span v-if="selectedDirection?.program_type === 'specialist'">Выберите специализацию</span>
        <span v-else>Выберите профиль подготовки</span>
      </label>
      <select 
        v-model="modelValue.profile" 
        class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
        @change="$emit('profile-change')"
      >
        <option value="">
          <span v-if="selectedDirection?.program_type === 'specialist'">Выберите специализацию</span>
          <span v-else>Выберите профиль подготовки</span>
        </option>
        <option v-for="profile in availableProfiles" :key="profile.id" :value="profile.id">
          {{ profile.name }}
        </option>
      </select>
      <p v-if="errors.profile" class="mt-1 text-sm text-red-600">{{ errors.profile }}</p>
    </div>
    
    <!-- Выбор специальности, если доступна для профиля -->
    <div v-if="availableSpecialties.length > 0">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Выберите специальность
      </label>
      <select 
        v-model="modelValue.specialty" 
        class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
      >
        <option value="">Выберите специальность</option>
        <option v-for="specialty in availableSpecialties" :key="specialty.id" :value="specialty.id">
          {{ specialty.code }} - {{ specialty.name }}
        </option>
      </select>
      <p v-if="errors.specialty" class="mt-1 text-sm text-red-600">{{ errors.specialty }}</p>
    </div>
    
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Форма финансирования</label>
      <div class="flex space-x-4">
        <label class="inline-flex items-center">
          <input 
            type="radio" 
            v-model="modelValue.fundingForm" 
            value="budget" 
            class="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
          >
          <span class="ml-2">Бюджет</span>
        </label>
        <label class="inline-flex items-center">
          <input 
            type="radio" 
            v-model="modelValue.fundingForm" 
            value="contract" 
            class="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
          >
          <span class="ml-2">Контракт</span>
        </label>
      </div>
      <p v-if="errors.fundingForm" class="mt-1 text-sm text-red-600">{{ errors.fundingForm }}</p>
    </div>
    
    <div v-if="selectedDirection">
      <h3 class="font-medium text-gray-900 mb-2">Необходимые вступительные испытания:</h3>
      <ul class="list-disc list-inside text-gray-600 mb-4 ml-2">
        <li v-for="(exam, index) in selectedDirection.exams" :key="index">{{ exam }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  errors: {
    type: Object,
    default: () => ({})
  },
  availableDirections: {
    type: Array,
    default: () => []
  },
  availableProfiles: {
    type: Array,
    default: () => []
  },
  availableSpecialties: {
    type: Array,
    default: () => []
  },
  selectedDirection: {
    type: Object,
    default: null
  }
});

defineEmits(['update:modelValue', 'direction-change', 'profile-change']);
</script> 