<template>
  <div>
    <h2 class="text-xl font-semibold mb-2">Выбор образовательных программ</h2>
    <p class="text-sm text-gray-600 mb-6">Вы можете выбрать до 3-х профилей или специализаций. После выбора первой программы, система предложит только те, у которых совпадает набор вступительных испытаний.</p>

    <!-- Отображение ошибок валидации -->
    <div v-if="errors.choices" class="mb-4 p-3 bg-red-50 border border-red-300 rounded-md">
      <p class="text-sm text-red-700">{{ errors.choices }}</p>
    </div>

    <div class="space-y-6">
      <!-- Первый селект - полный список профилей -->
      <div class="p-4 border rounded-lg bg-gray-50 relative"
           :class="{ 'border-red-500 bg-red-50': errors.choices }">
        <h3 class="font-medium text-gray-800 mb-3 required-field">Приоритет 1</h3>
          <div>
          <label for="profile-1" class="block text-sm font-medium text-gray-700 required-field">Профиль/Специализация</label>
          <select 
            id="profile-1" 
            v-model="selectedProfiles[0]" 
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
            :class="{ 'border-red-500': errors.choices }"
            @change="onFirstProfileChange"
            required
          >
            <option :value="null" disabled>-- Выберите профиль --</option>
            <option v-for="profile in allProfilesWithDetails" :key="profile.id" :value="profile.id">
              {{ profile.name }} 
              <span v-if="profile.direction" class="text-gray-500">({{ profile.direction.name || profile.direction.code }})</span>
            </option>
            </select>
          </div>
          </div>

      <!-- Второй селект - профили с теми же экзаменами, кроме выбранного в первом -->
      <div class="p-4 border rounded-lg bg-gray-50 relative">
        <h3 class="font-medium text-gray-800 mb-3">Приоритет 2</h3>
          <div>
          <label for="profile-2" class="block text-sm font-medium text-gray-700">Профиль/Специализация</label>
          <select 
            id="profile-2" 
            v-model="selectedProfiles[1]" 
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
            :disabled="!isSecondSelectEnabled"
            @change="onSecondProfileChange"
          >
              <option :value="null" disabled>-- Выберите профиль --</option>
            <option v-for="profile in filteredProfilesForSecondSelect" :key="profile.id" :value="profile.id">
              {{ profile.name }} 
              <span v-if="profile.direction" class="text-gray-500">({{ profile.direction.name || profile.direction.code }})</span>
            </option>
            </select>
          </div>
        </div>
        
      <!-- Третий селект - оставшиеся профили с теми же экзаменами -->
      <div class="p-4 border rounded-lg bg-gray-50 relative">
        <h3 class="font-medium text-gray-800 mb-3">Приоритет 3</h3>
        <div>
          <label for="profile-3" class="block text-sm font-medium text-gray-700">Профиль/Специализация</label>
          <select 
            id="profile-3" 
            v-model="selectedProfiles[2]" 
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
            :disabled="!isThirdSelectEnabled"
            @change="onThirdProfileChange"
          >
            <option :value="null" disabled>-- Выберите профиль --</option>
            <option v-for="profile in filteredProfilesForThirdSelect" :key="profile.id" :value="profile.id">
              {{ profile.name }} 
              <span v-if="profile.direction" class="text-gray-500">({{ profile.direction.name || profile.direction.code }})</span>
            </option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="compatibleProfiles.length > 0 && selectedProfiles[0]" class="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md">
      <p class="text-sm">Вы выбрали первый профиль. Система предложит программы с таким же набором вступительных испытаний.</p>
    </div>

    <!-- Форма финансирования -->
    <!-- <div class="mt-6 p-4 border rounded-lg bg-gray-50"
         :class="{ 'border-red-500 bg-red-50': errors.funding_form }">
      <h3 class="font-medium text-gray-800 mb-3">Форма финансирования *</h3>
      <div class="space-y-2">
        <label class="inline-flex items-center">
          <input 
            type="radio" 
            v-model="modelValue.funding_form" 
            value="budget" 
            class="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
            :class="{ 'border-red-500': errors.funding_form }"
            required
          >
          <span class="ml-2">Бюджетная основа</span>
        </label>
        <label class="inline-flex items-center">
          <input 
            type="radio" 
            v-model="modelValue.funding_form" 
            value="contract" 
            class="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
            :class="{ 'border-red-500': errors.funding_form }"
            required
          >
          <span class="ml-2">Договорная основа</span>
        </label>
      </div>
      <p v-if="errors.funding_form" class="mt-1 text-sm text-red-600">{{ errors.funding_form }}</p>
    </div> -->
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useApplicationStore } from '@/stores/application';
import { profiles as profilesApi } from '@/api/education';
import BaseButton from '@/components/ui/BaseButton.vue';
import { useToast } from 'vue-toastification';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  errors: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:modelValue']);

const appStore = useApplicationStore();
const toast = useToast();

// Состояние выбранных профилей (массив из трех элементов)
const selectedProfiles = ref([null, null, null]);
const compatibleProfiles = ref([]);
const isLoadingProfiles = ref(false);

// Состояние активности селектов
const isSecondSelectEnabled = computed(() => !!selectedProfiles.value[0] && compatibleProfiles.value.length > 0);
const isThirdSelectEnabled = computed(() => !!selectedProfiles.value[1] && compatibleProfiles.value.length > 1);

// Инициализация из props
onMounted(() => {
  if (props.modelValue.choices && props.modelValue.choices.length > 0) {
    // Создаем массив из трех элементов с null значениями
    const initialProfiles = [null, null, null];
    
    // Заполняем массив значениями из props
    props.modelValue.choices.forEach((choice, index) => {
      if (index < 3) {
        initialProfiles[index] = choice.profile_id;
      }
    });
    
    // Устанавливаем начальные значения
    selectedProfiles.value = initialProfiles;
    
    // Если выбран первый профиль, загружаем совместимые профили
    if (selectedProfiles.value[0]) {
      loadCompatibleProfiles(selectedProfiles.value[0]);
    }
  }
});

// Получаем все профили с информацией о направлениях
const allProfilesWithDetails = computed(() => {
  return appStore.allProfiles.map(profile => {
    const direction = appStore.allDirections.find(d => d.id === profile.direction_id);
    return {
      ...profile,
      direction: direction || { name: '', code: '' }
    };
  });
});

// Профили для второго селекта (совместимые с первым, исключая выбранный в первом)
const filteredProfilesForSecondSelect = computed(() => {
  if (!compatibleProfiles.value.length || !selectedProfiles.value[0]) {
    return [];
  }
  
  return compatibleProfiles.value
    .filter(profile => {
      // Исключаем профиль, выбранный в первом селекте
      return profile.profile_id !== selectedProfiles.value[0];
    })
    .map(profile => {
      // Добавляем полную информацию о профиле
      const fullProfile = allProfilesWithDetails.value.find(p => p.id === profile.profile_id);
      return fullProfile || profile;
    });
});

// Профили для третьего селекта (совместимые с первым, исключая выбранные в первом и втором)
const filteredProfilesForThirdSelect = computed(() => {
  if (!compatibleProfiles.value.length || !selectedProfiles.value[0] || !selectedProfiles.value[1]) {
    return [];
  }
  
  return compatibleProfiles.value
    .filter(profile => {
      // Исключаем профили, выбранные в первом и втором селектах
      return profile.profile_id !== selectedProfiles.value[0] && 
             profile.profile_id !== selectedProfiles.value[1];
    })
    .map(profile => {
      // Добавляем полную информацию о профиле
      const fullProfile = allProfilesWithDetails.value.find(p => p.id === profile.profile_id);
      return fullProfile || profile;
    });
});

// Загрузка профилей с одинаковыми экзаменами
async function loadCompatibleProfiles(profileId) {
  if (!profileId) return;
  
  isLoadingProfiles.value = true;
  
  try {
    const { data, error } = await profilesApi.getWithSameExams(profileId);
    
    if (error) {
      toast.error('Не удалось загрузить совместимые профили');
      console.error('Ошибка загрузки совместимых профилей:', error);
      return;
    }
    
    compatibleProfiles.value = data || [];
  } catch (err) {
    toast.error('Произошла ошибка при загрузке совместимых профилей');
    console.error('Ошибка загрузки совместимых профилей:', err);
  } finally {
    isLoadingProfiles.value = false;
  }
}

// Обработчики изменения выбора профилей
async function onFirstProfileChange() {
  // Сбрасываем выбор во втором и третьем селектах
  selectedProfiles.value[1] = null;
  selectedProfiles.value[2] = null;
  
  // Загружаем совместимые профили
  if (selectedProfiles.value[0]) {
    await loadCompatibleProfiles(selectedProfiles.value[0]);
  } else {
    compatibleProfiles.value = [];
  }
}

function onSecondProfileChange() {
  // Сбрасываем выбор в третьем селекте
  selectedProfiles.value[2] = null;
}

function onThirdProfileChange() {
  // Здесь можно добавить дополнительную логику при необходимости
}

// Следим за изменениями выбора профилей и обновляем v-model
watch(selectedProfiles, (newSelectedProfiles) => {
  const validChoices = newSelectedProfiles
    .filter(profileId => profileId !== null)
    .map((profileId, index) => ({
      profile_id: profileId,
      priority: index + 1
    }));

  emit('update:modelValue', { ...props.modelValue, choices: validChoices });
}, { deep: true });

</script>

<style scoped>
.required-field::after {
  content: " *";
  color: #ef4444;
  font-weight: bold;
}
</style>
