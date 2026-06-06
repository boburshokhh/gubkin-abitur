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
          <p>{{ getRegionName(modelValue.region_id) }}</p>
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
        <div v-if="modelValue.accommodation_needed">
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
          <p>{{ modelValue.passport_series }}</p>
        </div>
        <div>
          <span class="text-sm text-gray-500">Дата выдачи:</span>
          <p>{{ formatDate(modelValue.passport_issue_date) }}</p>
        </div>
        <div class="md:col-span-2">
          <span class="text-sm text-gray-500">Кем выдан:</span>
          <p>{{ modelValue.passport_issued_by }}</p>
        </div>
      </div>
    </div>
    
    <div class="px-4 py-5 bg-gray-50 rounded-lg">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Образование</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
        <div>
          <span class="text-sm text-gray-500">Уровень образования:</span>
          <p>{{ getEducationLevelName(modelValue.education_level) }}</p>
        </div>
        <div>
          <span class="text-sm text-gray-500">Учебное заведение:</span>
          <p>{{ modelValue.education_institution }}</p>
        </div>
        <div>
          <span class="text-sm text-gray-500">Год окончания:</span>
          <p>{{ modelValue.education_graduation_year }}</p>
        </div>
        <div>
          <span class="text-sm text-gray-500">Документ об образовании:</span>
          <p>{{ modelValue.education_document_number }} от {{ formatDate(modelValue.education_document_date) }}</p>
        </div>
      </div>
    </div>
    
    <div class="px-4 py-5 bg-gray-50 rounded-lg">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Выбранные образовательные программы</h3>
      
      <div v-if="modelValue.choices && modelValue.choices.length > 0" class="space-y-4">
        <div v-for="(choice, index) in modelValue.choices" :key="index" class="p-3 border rounded border-gray-200">
          <div class="font-medium">Приоритет {{ choice.priority }}</div>
          <div class="text-sm mt-1">
            <div class="flex gap-2">
              <span class="text-gray-500">Профиль:</span>
              <span>{{ getProfileFullName(choice.profile_id) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="text-sm text-gray-500">
        Образовательные программы не выбраны
      </div>

    </div>
    
    <div class="flex items-start mt-4">
      <div class="flex items-center h-5">
        <input
          id="accommodation" 
          v-model="modelValue.accommodation_needed"
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
          v-model="modelValue.olympiad_participant"
          type="checkbox" 
          class="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        >
      </div>
      <div class="ml-3 text-sm">
        <label for="olympiad" class="font-medium text-gray-700">
          Участвовал в Республиканской олимпиаде по математике / Губкинской предметной олимпиаде
        </label>
        <p class="text-xs text-gray-500 mt-1">
          Диплом победителя Республиканской олимпиады по математике или диплом победителя, призёра либо участника I Губкинской предметной олимпиады 2026 года
        </p>
        
      </div>
    </div>

    <div v-if="modelValue.olympiad_participant">
      <!-- Информация о требованиях к сертификату олимпиады -->
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-yellow-800">Требования к сертификату олимпиады</h3>
            <div class="mt-2 text-sm text-yellow-700">
              <p>Загрузите цветную копию диплома победителя, призёра или участника I Губкинской предметной олимпиады 2026 года или диплома победителя Республиканской олимпиады по математике. Файл должен быть в формате PDF.</p>
            </div>            
          </div>
        </div>
      </div>
      <p class="text-sm text-gray-500 bg-yellow-100 p-2 rounded-lg">
        <span class="font-medium">Важно:</span>
        <span>
          Названия файла должен быть в формате Ф_И_О_олимпиада.pdf Пример: "Иванов_Иван_Иванович_олимпиада.pdf"
        </span>
      </p>
      <FileUploadField
        fieldName="olympiadCertificate"
        label="Сертификаты олимпиад"
        required
        accept=".pdf"
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
import { computed, onMounted } from 'vue';
import FileUploadField from './FileUploadField.vue';
import { useApplicationStore } from '@/stores/application';

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
  availablePrograms: {
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

// Получаем доступ к хранилищу для получения полной информации о профилях
const appStore = useApplicationStore();

// Получаем доступ к регионам из хранилища 
const allRegions = computed(() => {
  // Объединяем регионы из props и из хранилища
  const propRegions = props.regions || [];
  const storeRegions = appStore.regions || [];
  
  // Создаем Map с регионами из обоих источников
  const regionsMap = new Map();
  
  // Добавляем регионы из props
  propRegions.forEach(region => {
    regionsMap.set(region.id, region);
  });
  
  // Добавляем регионы из хранилища (при совпадении ID приоритет у хранилища)
  storeRegions.forEach(region => {
    regionsMap.set(region.id, region);
  });
  
  // Преобразуем Map обратно в массив
  return Array.from(regionsMap.values());
});

// Выводим отладочную информацию при монтировании компонента
onMounted(async () => {

  // Если регионы не загружены, принудительно загружаем их
  if (allRegions.value.length === 0) {
    // console.log('Регионы не загружены, загружаем принудительно');
    await appStore.loadRegions();
    // console.log('Регионы загружены принудительно:', appStore.regions);
  }
});

// Форматирование даты
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU').format(date);
};

// Получение названия региона
const getRegionName = (regionId) => {
  if (!regionId) return '';
  // console.log('getRegionName:', regionId, allRegions.value);
  
  // Проверяем тип входного значения
  const parsedId = typeof regionId === 'string' ? parseInt(regionId, 10) : regionId;
  // console.log('Искомый ID региона (преобразованный):', parsedId, typeof parsedId);
  
  // Проверяем каждый регион
  allRegions.value.forEach((r, index) => {
    // console.log(`Регион ${index}:`, r.id, typeof r.id, r.name);
  });
  
  // Ищем регион в объединенном массиве
  const region = allRegions.value.find(r => r.id === parsedId);
  
  // console.log('найденный регион:', region);
  
  // Если регион не найден, пробуем найти по строковому сравнению
  if (!region && allRegions.value.length > 0) {
    const stringMatch = allRegions.value.find(r => r.id.toString() === regionId.toString());
    // console.log('Найден по строковому сравнению:', stringMatch);
    return stringMatch ? stringMatch.name : '';
  }
  
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

// Получение названия профиля с направлением
const getProfileFullName = (profileId) => {
  if (!profileId) return '';
  
  // Ищем полную информацию о профиле в хранилище
  const profile = appStore.allProfiles.find(p => p.id === profileId);
  if (!profile) return 'Профиль не найден';
  
  // Ищем информацию о направлении
  const direction = appStore.allDirections.find(d => d.id === profile.direction_id);
  
  if (direction) {
    return `${profile.name} (${direction.name || direction.code})`;
  } else {
    return profile.name;
  }
};

// Получение названия специальности
const getSpecialtyName = (specialtyId) => {
  if (!specialtyId) return '';
  const specialty = props.availableSpecialties.find(s => s.id === specialtyId);
  return specialty ? specialty.name : '';
};
</script> 