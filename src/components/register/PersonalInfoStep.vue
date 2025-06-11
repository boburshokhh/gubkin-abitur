<template>
  <div v-if="isLoading" class="flex justify-center py-10">
    <BaseLoader size="lg" />
  </div>
  <div v-else class="space-y-4">
 
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <BaseInput
          v-model="modelValue.lastName"
          label="Фамилия"
          placeholder="Введите фамилию"
          required
          :error="errors.lastName"
        />
      </div>
      <div>
        <BaseInput
          v-model="modelValue.firstName"
          label="Имя"
          placeholder="Введите имя"
          required
          :error="errors.firstName"
        />
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <BaseInput
          v-model="modelValue.middleName"
          label="Отчество"
          placeholder="Введите отчество (если есть)"
        />
      </div>
      <div>
        <BaseInput
          v-model="modelValue.birthDate"
          type="date"
          label="Дата рождения"
          required
          :error="errors.birthDate"
        />
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Регион проживания</label>
        <select 
          v-model="modelValue.region_id"
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"

        >
          <option v-for="region in regionsData" :key="region.id" :value="region.id">
            {{ region.name }}
          </option>
        </select>
        <p v-if="errors.region_id" class="mt-1 text-sm text-red-600">{{ errors.region_id }}</p>
      </div>
      <div>
        <BaseInput
          v-model="modelValue.phone"
          label="Телефон"
          placeholder="+998 __ ___ __ __"
          required
          :error="errors.phone"
          @input="() => $emit('phone-format', 'phone')"
        >
          <template #prefix>
            <span class="text-gray-500">+998</span>
          </template>
        </BaseInput>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <BaseInput
          v-model="modelValue.parentPhone"
          label="Телефон одного из родителей"
          placeholder="+998 __ ___ __ __"
          required
          :error="errors.parentPhone"
          @input="() => $emit('phone-format', 'parentPhone')"
        >
          <template #prefix>
            <span class="text-gray-500">+998</span>
          </template>
        </BaseInput>
      </div>
      <div>
        <BaseInput
          v-model="modelValue.email"
          type="email"
          label="Email"
          placeholder="example@mail.com"
          :error="errors.email"
        />
      </div>
    </div>
    
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Пол</label>
      <div class="flex space-x-4">
        <label class="inline-flex items-center">
          <input 
            type="radio" 
            v-model="modelValue.gender" 
            value="male" 
            class="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
          >
          <span class="ml-2">Мужской</span>
        </label>
        <label class="inline-flex items-center">
          <input 
            type="radio" 
            v-model="modelValue.gender" 
            value="female" 
            class="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
          >
          <span class="ml-2">Женский</span>
        </label>
      </div>
      <p v-if="errors.gender" class="mt-1 text-sm text-red-600">{{ errors.gender }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { BaseInput, BaseLoader } from '@/components/ui';
import { useAuthStore } from '@/stores/auth';
import { useApplicationStore } from '@/stores/application';

const authStore = useAuthStore();
const appStore = useApplicationStore();

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  errors: {
    type: Object,
    default: () => ({})
  },
  isLoading: {
    type: Boolean,
    default: false
  }
});

defineEmits(['update:modelValue', 'phone-format']);

const regionsData = computed(() => appStore.regions);
</script> 