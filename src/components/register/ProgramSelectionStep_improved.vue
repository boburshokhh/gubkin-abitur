<template>
  <div>
    <h2 class="text-xl font-semibold mb-2">Выбор образовательных программ</h2>
    <p class="text-sm text-gray-600 mb-6">Вы можете выбрать до 3-х профилей или специализаций. После выбора первой программы, система предложит только те, у которых совпадает набор вступительных испытаний.</p>

    <div class="space-y-6">
      <!-- Первый селект - полный список профилей -->
      <div class="p-4 border rounded-lg bg-gray-50 relative">
        <h3 class="font-medium text-gray-800 mb-3">Приоритет 1</h3>
          <div>
          <label for="profile-1" class="block text-sm font-medium text-gray-700">Профиль/Специализация</label>
          <select 
            id="profile-1" 
            v-model="selectedProfiles[0]" 
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
            @change="onFirstProfileChange"
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
          <div class="relative">
            <select 
              id="profile-2" 
              v-model="selectedProfiles[1]" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
              :disabled="!isSecondSelectEnabled || isLoadingProfiles"
              @change="onSecondProfileChange"
            >
                <option :value="null" disabled>-- Выберите профиль --</option>
              <option v-for="profile in filteredProfilesForSecondSelect" :key="profile.id" :value="profile.id">
                {{ profile.name }} 
                <span v-if="profile.direction" class="text-gray-500">({{ profile.direction.name || profile.direction.code }})</span>
              </option>
            </select>
            <div v-if="isLoadingProfiles" class="absolute right-2 top-2">
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
            </div>
          </div>
          <p v-if="selectedProfiles[0] && isLoadingProfiles" class="mt-1 text-xs text-gray-500">
            Загрузка совместимых программ...
          </p>
        </div>
      </div>
        
      <!-- Третий селект - оставшиеся профили с теми же экзаменами -->
      <div class="p-4 border rounded-lg bg-gray-50 relative">
        <h3 class="font-medium text-gray-800 mb-3">Приоритет 3</h3>
        <div>
          <label for="profile-3" class="block text-sm font-medium text-gray-700">Профиль/Специализация</label>
          <div class="relative">
            <select 
              id="profile-3" 
              v-model="selectedProfiles[2]" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
              :disabled="!isThirdSelectEnabled || isLoadingProfiles"
              @change="onThirdProfileChange"
            >
              <option :value="null" disabled>-- Выберите профиль --</option>
              <option v-for="profile in filteredProfilesForThirdSelect" :key="profile.id" :value="profile.id">
                {{ profile.name }} 
                <span v-if="profile.direction" class="text-gray-500">({{ profile.direction.name || profile.direction.code }})</span>
              </option>
            </select>
            <div v-if="isLoadingProfiles" class="absolute right-2 top-2">
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="compatibleProfiles.length > 0 && selectedProfiles[0]" class="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md">
      <p class="text-sm">Вы выбрали первый профиль. Система предложит программы с таким же набором вступительных испытаний.</p>
    </div>
    
    <div v-if="compatibleProfiles.length === 0 && selectedProfiles[0] && !isLoadingProfiles" class="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-md">
      <p class="text-sm">Для выбранного профиля не найдены совместимые программы с таким же набором вступительных испытаний.</p>
    </div>
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

function getChoicesFromSelectedProfiles(selectedProfileIds) {
  return selectedProfileIds
    .filter(profileId => profileId !== null && profileId !== undefined && profileId !== '')
    .map((profileId, index) => ({
      profile_id: profileId,
      priority: index + 1
    }));
}

function areChoicesEqual(nextChoices) {
  return JSON.stringify(props.modelValue.choices || []) === JSON.stringify(nextChoices);
}

// Следим за изменениями выбора профилей и обновляем v-model
watch(selectedProfiles, (newSelectedProfiles) => {
  const validChoices = getChoicesFromSelectedProfiles(newSelectedProfiles);
  if (areChoicesEqual(validChoices)) return;

  emit('update:modelValue', { ...props.modelValue, choices: validChoices });
}, { deep: true });

</script>
