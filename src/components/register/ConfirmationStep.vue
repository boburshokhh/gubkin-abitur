<template>
  <div class="space-y-6">
    <div class="px-4 py-5 bg-gray-50 rounded-lg">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Личные данные</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
        <div>
          <span class="text-sm text-gray-500">Ф.И.О.:</span>
          <p>{{ modelValue.lastName }} {{ modelValue.firstName }} {{ modelValue.middleName }}</p>
        </div>
        <div>
          <span class="text-sm text-gray-500">Дата рождения:</span>
          <p>{{ formatDate(modelValue.birthDate) }}</p>
        </div>
        <div>
          <span class="text-sm text-gray-500">Регион:</span>
          <p>{{ getRegionName(modelValue.region) }}</p>
        </div>
        <div>
          <span class="text-sm text-gray-500">Контактный телефон:</span>
          <p>{{ modelValue.phone }}</p>
        </div>
        <div>
          <span class="text-sm text-gray-500">Телефон родителя:</span>
          <p>{{ modelValue.parentPhone }}</p>
        </div>
        <div>
          <span class="text-sm text-gray-500">Email:</span>
          <p>{{ modelValue.email }}</p>
        </div>
        <div>
          <span class="text-sm text-gray-500">Пол:</span>
          <p>{{ modelValue.gender === 'male' ? 'Мужской' : 'Женский' }}</p>
        </div>
        <div v-if="modelValue.accommodationNeeded">
          <span class="text-sm text-gray-500">Нуждается в общежитии:</span>
          <p>Да</p>
        </div>
      </div>
    </div>
    
    <div class="px-4 py-5 bg-gray-50 rounded-lg">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Паспортные данные</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
        <div>
          <span class="text-sm text-gray-500">Серия и номер:</span>
          <p>{{ modelValue.passportSeries }}</p>
        </div>
        <div>
          <span class="text-sm text-gray-500">Дата выдачи:</span>
          <p>{{ formatDate(modelValue.passportIssueDate) }}</p>
        </div>
        <div class="md:col-span-2">
          <span class="text-sm text-gray-500">Кем выдан:</span>
          <p>{{ modelValue.passportIssuedBy }}</p>
        </div>
      </div>
    </div>
    
    <div class="px-4 py-5 bg-gray-50 rounded-lg">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Образование</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
        <div>
          <span class="text-sm text-gray-500">Уровень образования:</span>
          <p>{{ getEducationLevelName(modelValue.educationLevel) }}</p>
        </div>
        <div>
          <span class="text-sm text-gray-500">Учебное заведение:</span>
          <p>{{ modelValue.educationInstitution }}</p>
        </div>
        <div>
          <span class="text-sm text-gray-500">Год окончания:</span>
          <p>{{ modelValue.educationGraduationYear }}</p>
        </div>
        <div>
          <span class="text-sm text-gray-500">Документ об образовании:</span>
          <p>{{ modelValue.documentNumber }} от {{ formatDate(modelValue.documentDate) }}</p>
        </div>
      </div>
    </div>
    
    <div class="px-4 py-5 bg-gray-50 rounded-lg">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Направление обучения</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
        <div>
          <span class="text-sm text-gray-500">Направление:</span>
          <p>{{ getDirectionName(modelValue.direction) }}</p>
        </div>
        <div v-if="modelValue.profile">
          <span class="text-sm text-gray-500">
            <span v-if="selectedDirection?.program_type === 'specialist'">Специализация:</span>
            <span v-else>Профиль подготовки:</span>
          </span>
          <p>{{ getProfileName(modelValue.profile) }}</p>
        </div>
        <div v-if="modelValue.specialty">
          <span class="text-sm text-gray-500">Специальность:</span>
          <p>{{ getSpecialtyName(modelValue.specialty) }}</p>
        </div>
        <div>
          <span class="text-sm text-gray-500">Форма финансирования:</span>
          <p>{{ modelValue.fundingForm === 'budget' ? 'Бюджет' : 'Контракт' }}</p>
        </div>
      </div>
    </div>
    
    <div class="flex items-start mt-4">
      <div class="flex items-center h-5">
        <input
          id="accommodation" 
          v-model="modelValue.accommodationNeeded"
          type="checkbox" 
          class="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        >
      </div>
      <div class="ml-3 text-sm">
        <label for="accommodation" class="font-medium text-gray-700">Нуждаюсь в общежитии</label>
      </div>
    </div>

    <div class="flex items-start mt-4">
      <div class="flex items-center h-5">
        <input
          id="olympiad" 
          v-model="modelValue.olympiadParticipant"
          type="checkbox" 
          class="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        >
      </div>
      <div class="ml-3 text-sm">
        <label for="olympiad" class="font-medium text-gray-700">Участвовал(а) в олимпиаде Университета Губкина</label>
      </div>
    </div>

    <div v-if="modelValue.olympiadParticipant">
      <FileUploadField
        fieldName="olympiadCertificate"
        label="Сертификаты олимпиад"
        :isUploading="fileUploading.olympiadCertificate"
        :preview="filePreview.olympiadCertificate"
        :error="errors.olympiadCertificate"
        @change="(file) => $emit('file-change', file, 'olympiadCertificate')"
        @view="() => $emit('file-view', 'olympiadCertificate')"
        @reset="() => $emit('file-reset', 'olympiadCertificate')"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import FileUploadField from './FileUploadField.vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  errors: {
    type: Object,
    default: () => ({})
  },
  regions: {
    type: Array,
    default: () => []
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
  },
  fileUploading: {
    type: Object,
    default: () => ({})
  },
  filePreview: {
    type: Object,
    default: () => ({})
  }
});

defineEmits(['update:modelValue', 'file-change', 'file-view', 'file-reset']);

// Форматирование даты
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU').format(date);
};

// Получение названия региона
const getRegionName = (regionId) => {
  if (!regionId) return '';
  const region = props.regions.find(r => r.id === regionId);
  return region ? region.name : '';
};

// Получение названия уровня образования
const getEducationLevelName = (level) => {
  const levels = {
    'high-school': 'Среднее общее (11 классов)',
    'college': 'Среднее профессиональное (колледж, техникум)',
    'bachelor': 'Высшее - бакалавриат',
    'master': 'Высшее - магистратура'
  };
  return levels[level] || '';
};

// Получение названия направления
const getDirectionName = (id) => {
  const direction = props.availableDirections.find(d => d.id === id);
  return direction ? direction.name : '';
};

// Получение названия профиля
const getProfileName = (profileId) => {
  if (!profileId) return '';
  const profile = props.availableProfiles.find(p => p.id === profileId);
  return profile ? profile.name : '';
};

// Получение названия специальности
const getSpecialtyName = (specialtyId) => {
  if (!specialtyId) return '';
  const specialty = props.availableSpecialties.find(s => s.id === specialtyId);
  return specialty ? `${specialty.code} - ${specialty.name}` : '';
};
</script> 