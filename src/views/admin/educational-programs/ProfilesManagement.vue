<template>
  <div class="bg-white shadow rounded-lg overflow-hidden">
    <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
      <div>
        <h3 class="text-lg font-medium leading-6 text-gray-900">Управление профилями и специализациями</h3>
        <p class="mt-1 max-w-2xl text-sm text-gray-500">Добавление и редактирование профилей образовательных программ</p>
      </div>
      <BaseButton @click="openCreateProfileModal" variant="primary">Добавить профиль</BaseButton>
    </div>

    <!-- Фильтры -->
    <div class="px-4 py-3 border-t border-gray-200 bg-gray-50">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Уровень образования</label>
          <select v-model="filters.levelId" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
            <option :value="null">Все уровни</option>
            <option v-for="level in educationLevels" :key="level.id" :value="level.id">{{ level.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Направление</label>
          <select v-model="filters.directionId" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
            <option :value="null">Все направления</option>
            <option v-for="direction in filteredDirections" :key="direction.id" :value="direction.id">
              {{ direction.code }} - {{ direction.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Поиск</label>
          <input v-model="filters.search" type="text" placeholder="Название профиля..." 
                 class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
        </div>
      </div>
    </div>

    <!-- Таблица профилей -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Профиль/Специализация</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Направление</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Уровень</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Вступительные экзамены</th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
          </tr>
        </thead>
        <tbody v-if="isLoading" class="bg-white divide-y divide-gray-200">
          <tr>
            <td colspan="5" class="px-6 py-12 text-center text-sm text-gray-500">
              <div class="flex justify-center mb-4">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
              <span>Загрузка данных...</span>
            </td>
          </tr>
        </tbody>
        <tbody v-else-if="filteredProfiles.length === 0" class="bg-white divide-y divide-gray-200">
          <tr>
            <td colspan="5" class="px-6 py-12 text-center text-sm text-gray-500">
              <div class="text-gray-400 mb-2">
                <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 class="text-sm font-medium text-gray-900 mb-1">Профили не найдены</h3>
              <p class="text-xs text-gray-500">Используйте кнопку "Добавить профиль" для создания нового</p>
            </td>
          </tr>
        </tbody>
        <tbody v-else class="bg-white divide-y divide-gray-200">
          <tr v-for="profile in filteredProfiles" :key="profile.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 text-sm">
              <div class="font-medium text-gray-900">{{ profile.name }}</div>
              <div v-if="profile.description" class="text-gray-500 text-xs mt-1 max-w-xs truncate">{{ profile.description }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span v-if="profile.direction">
                <div class="font-mono text-xs text-gray-600">{{ profile.direction.code }}</div>
                <div class="text-sm">{{ profile.direction.name }}</div>
              </span>
              <span v-else class="italic text-gray-400">Не указано</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span v-if="profile.direction && profile.direction.level" 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getLevelBadgeClass(profile.direction.level.name)">
                {{ profile.direction.level.name }}
              </span>
              <span v-else class="italic text-gray-400">Не указано</span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">
              <div v-if="profile.profile_exams && profile.profile_exams.length > 0" class="space-y-1">
                <div v-for="exam in profile.profile_exams" :key="`${profile.id}-${exam.subject_id}`" class="flex items-center">
                  <span class="mr-2 bg-primary-100 text-primary-800 px-2 py-0.5 rounded text-xs font-medium">{{ exam.priority }}</span>
                  <span class="text-sm">{{ exam.subject ? exam.subject.name : getSubjectName(exam.subject_id) }}</span>
                </div>
              </div>
              <div v-else class="text-gray-400 italic text-sm">Экзамены не настроены</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex justify-end space-x-2">
                <BaseButton @click="openEditProfileModal(profile)" variant="outline" size="sm">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Редактировать
                </BaseButton>
                <BaseButton @click="confirmDeleteProfile(profile.id)" variant="danger-outline" size="sm">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Удалить
                </BaseButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Модальное окно создания/редактирования профиля -->
    <BaseModal v-model="showProfileModal" :title="currentProfile.id ? 'Редактирование профиля' : 'Добавление профиля'" class="!max-w-3xl">
      <form @submit.prevent="saveProfile" class="space-y-6">
        <!-- Основная информация -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <h3 class="text-sm font-medium text-gray-800 mb-3">Основная информация</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Название профиля/специализации <span class="text-red-500">*</span>
              </label>
              <input v-model="currentProfile.name" required 
                     placeholder="Например: Бурение нефтяных и газовых скважин (УРБ)"
                     class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Уровень образования <span class="text-red-500">*</span>
              </label>
              <select v-model="selectedLevelId" required @change="onLevelChange"
                      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                <option :value="null">Выберите уровень</option>
                <option v-for="level in educationLevels" :key="level.id" :value="level.id">{{ level.name }}</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Направление <span class="text-red-500">*</span>
              </label>
              <select v-model="currentProfile.direction_id" required
                      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                <option :value="null">Выберите направление</option>
                <option v-for="direction in directionsForSelectedLevel" :key="direction.id" :value="direction.id">
                  {{ direction.code }} - {{ direction.name }}
                </option>
              </select>
            </div>
            
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Описание</label>
              <textarea v-model="currentProfile.description" rows="3" 
                        placeholder="Краткое описание профиля и особенностей подготовки..."
                        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"></textarea>
            </div>
          </div>
        </div>
        
        <!-- Вступительные экзамены -->
        <div class="bg-blue-50 p-4 rounded-lg">
          <h3 class="text-sm font-medium text-gray-800 mb-3">Вступительные экзамены</h3>
          <div class="space-y-3">
            <div v-for="(exam, index) in currentProfile.exams" :key="index" 
                 class="flex items-center space-x-3 p-3 bg-white rounded border">
              <div class="flex-shrink-0">
                <span class="inline-flex items-center justify-center w-6 h-6 bg-primary-100 text-primary-800 text-xs font-medium rounded-full">
                  {{ exam.priority }}
                </span>
              </div>
              <div class="flex-1">
                <select v-model="exam.subject_id" required
                        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                  <option :value="null">Выберите предмет</option>
                  <option v-for="subject in allSubjects" :key="subject.id" :value="subject.id">{{ subject.name }}</option>
                </select>
              </div>
              <div class="flex-shrink-0">
                <BaseButton @click="removeExam(index)" variant="danger-outline" size="sm" type="button">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </BaseButton>
              </div>
            </div>
            
            <BaseButton @click="addExam" type="button" variant="outline" size="sm" class="w-full">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Добавить экзамен
            </BaseButton>
          </div>
        </div>
        
        <!-- Кнопки -->
        <div class="flex justify-end gap-3 pt-4 border-t">
          <BaseButton @click="closeProfileModal" type="button" variant="outline">Отмена</BaseButton>
          <BaseButton type="submit" variant="primary" :disabled="isSaving">
            <span v-if="isSaving">Сохранение...</span>
            <span v-else>{{ currentProfile.id ? 'Обновить профиль' : 'Создать профиль' }}</span>
          </BaseButton>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useToast } from 'vue-toastification';
import { levels as levelsApi, directions as directionsApi, profiles as profilesApi, subjects as subjectsApi } from '@/api/education';
import { BaseButton, BaseModal } from '@/components/ui';

// Состояние компонента
const isLoading = ref(false);
const isSaving = ref(false);
const toast = useToast();

// Данные
const educationLevels = ref([]);
const allDirections = ref([]);
const allProfiles = ref([]);
const allSubjects = ref([]);

// Фильтры
const filters = reactive({
  levelId: null,
  directionId: null,
  search: ''
});

// Модальное окно профиля
const showProfileModal = ref(false);
const selectedLevelId = ref(null);

// Начальный объект профиля
const initialProfile = () => ({
  id: null,
  name: '',
  description: '',
  direction_id: null,
  exams: []
});

const currentProfile = ref(initialProfile());

// Вычисляемые свойства
const filteredDirections = computed(() => {
  if (!filters.levelId) return allDirections.value;
  return allDirections.value.filter(d => d.level_id === filters.levelId);
});

const directionsForSelectedLevel = computed(() => {
  if (!selectedLevelId.value) return [];
  return allDirections.value.filter(d => d.level_id === selectedLevelId.value);
});

const filteredProfiles = computed(() => {
  let result = [...allProfiles.value];
  
  // Фильтрация по уровню образования
  if (filters.levelId) {
    result = result.filter(p => 
      p.direction && 
      p.direction.level && 
      p.direction.level.id === filters.levelId
    );
  }
  
  // Фильтрация по направлению
  if (filters.directionId) {
    result = result.filter(p => p.direction_id === filters.directionId);
  }
  
  // Поиск по названию
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    result = result.filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      (p.description && p.description.toLowerCase().includes(searchLower))
    );
  }
  
  return result;
});

// Жизненный цикл
onMounted(async () => {
  await fetchData();
});

// Методы
async function fetchData() {
  isLoading.value = true;
  try {
    const [levelsRes, directionsRes, profilesRes, subjectsRes] = await Promise.all([
      levelsApi.getAll(),
      directionsApi.getAll(),
      profilesApi.getAllWithDetails(),
      subjectsApi.getAll()
    ]);
    
    if (levelsRes.error) throw new Error(levelsRes.error.message);
    educationLevels.value = levelsRes.data || [];
    
    if (directionsRes.error) throw new Error(directionsRes.error.message);
    allDirections.value = directionsRes.data || [];
    
    if (profilesRes.error) throw new Error(profilesRes.error.message);
    allProfiles.value = profilesRes.data || [];
    
    if (subjectsRes.error) throw new Error(subjectsRes.error.message);
    allSubjects.value = subjectsRes.data || [];
    
  } catch (error) {
    toast.error(`Ошибка загрузки данных: ${error.message}`);
  } finally {
    isLoading.value = false;
  }
}

function getSubjectName(subjectId) {
  const subject = allSubjects.value.find(s => s.id === subjectId);
  return subject ? subject.name : 'Неизвестный предмет';
}

function getLevelBadgeClass(levelName) {
  switch (levelName) {
    case 'Бакалавриат':
      return 'bg-blue-100 text-blue-800';
    case 'Специалитет':
      return 'bg-green-100 text-green-800';
    case 'Магистратура':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function onLevelChange() {
  // Сброс выбранного направления при изменении уровня
  currentProfile.value.direction_id = null;
}

function openCreateProfileModal() {
  currentProfile.value = initialProfile();
  selectedLevelId.value = null;
  showProfileModal.value = true;
}

function openEditProfileModal(profile) {
  // Находим направление для определения уровня образования
  const direction = allDirections.value.find(d => d.id === profile.direction_id);
  selectedLevelId.value = direction ? direction.level_id : null;
  
  // Копируем профиль и преобразуем его экзамены в формат для формы
  currentProfile.value = {
    ...profile,
    // Если нет exams, создаем пустой массив
    exams: profile.profile_exams 
      ? profile.profile_exams.map(pe => ({ 
          subject_id: pe.subject ? pe.subject.id : pe.subject_id, 
          priority: pe.priority
        })) 
      : []
  };
  
  showProfileModal.value = true;
}

function closeProfileModal() {
  showProfileModal.value = false;
  currentProfile.value = initialProfile();
  selectedLevelId.value = null;
}

async function saveProfile() {
  if (!currentProfile.value.direction_id) {
    toast.error('Необходимо выбрать направление');
    return;
  }
  
  // Проверка на дублирование предметов в экзаменах
  const subjectIds = currentProfile.value.exams.filter(e => e.subject_id).map(e => e.subject_id);
  const uniqueSubjectIds = [...new Set(subjectIds)];
  if (subjectIds.length !== uniqueSubjectIds.length) {
    toast.error('В списке экзаменов есть повторяющиеся предметы');
    return;
  }
  
  isSaving.value = true;
  try {
    const payload = { ...currentProfile.value };
    
    if (payload.id) {
      // Обновление существующего профиля
      const { data, error } = await profilesApi.update(payload.id, payload);
      
      if (error) throw new Error(error.message);
      
      toast.success('Профиль успешно обновлен');
    } else {
      // Создание нового профиля
      const { data, error } = await profilesApi.create(payload);
      
      if (error) throw new Error(error.message);
      
      toast.success('Профиль успешно создан');
    }
    
    // Закрытие модального окна и обновление данных
    closeProfileModal();
    await fetchData();
    
  } catch (error) {
    toast.error(`Ошибка при сохранении профиля: ${error.message}`);
  } finally {
    isSaving.value = false;
  }
}

async function confirmDeleteProfile(profileId) {
  if (confirm('Вы уверены, что хотите удалить этот профиль? Это действие нельзя отменить.')) {
    try {
      const { error } = await profilesApi.delete(profileId);
      
      if (error) throw new Error(error.message);
      
      toast.success('Профиль успешно удален');
      await fetchData();
      
    } catch (error) {
      toast.error(`Ошибка при удалении профиля: ${error.message}`);
    }
  }
}

function addExam() {
  currentProfile.value.exams.push({
    subject_id: null,
    priority: currentProfile.value.exams.length + 1
  });
}

function removeExam(index) {
  currentProfile.value.exams.splice(index, 1);
  
  // Перенумеруем приоритеты
  currentProfile.value.exams.forEach((exam, idx) => {
    exam.priority = idx + 1;
  });
}
</script>