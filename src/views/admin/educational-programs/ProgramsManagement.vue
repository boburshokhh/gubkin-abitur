<template>
  <div class="p-4 sm:p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Образовательные программы</h1>
        <p class="text-sm text-gray-600">Иерархическое управление уровнями, направлениями и профилями</p>
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-20">
      <div class="flex justify-center mb-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
      <p class="text-gray-500">Загрузка данных...</p>
    </div>
    
    <div v-else-if="educationLevels.length === 0" class="text-center py-20 bg-gray-50 rounded-lg">
      <div class="text-gray-400 mb-4">
        <svg class="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-700 mb-2">Данные не найдены</h3>
      <p class="text-gray-500 text-sm">Сначала необходимо добавить уровни образования и направления.</p>
    </div>
    
    <!-- Иерархический список образовательных программ -->
    <div v-else class="space-y-6">
      <div v-for="level in educationLevels" :key="level.id" class="bg-white rounded-lg shadow-sm border overflow-hidden">
        <!-- Заголовок уровня образования -->
        <div class="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b">
          <div class="flex justify-between items-center">
            <div class="flex items-center">
              <div class="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <div class="ml-4">
          <h2 class="text-xl font-semibold text-gray-900">{{ level.name }}</h2>
                <p class="text-sm text-gray-600">{{ getDirectionCount(level.id) }} направлений, {{ getProfileCount(level.id) }} профилей</p>
              </div>
            </div>
            <BaseButton @click="openDirectionModal(null, level.id)" size="sm" variant="primary">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Добавить направление
            </BaseButton>
          </div>
        </div>
        
        <!-- Направления -->
        <div class="p-6">
          <div v-if="directionsByLevel(level.id).length === 0" class="text-center py-8 text-gray-500">
            <svg class="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p class="text-sm">Нет направлений для данного уровня</p>
          </div>
          
          <div v-else class="space-y-4">
            <div v-for="direction in directionsByLevel(level.id)" :key="direction.id" 
                 class="border rounded-lg bg-gray-50">
              
              <!-- Заголовок направления -->
              <div class="px-4 py-3 border-b bg-white rounded-t-lg">
            <div class="flex justify-between items-center">
                  <div class="flex-1">
                    <div class="flex items-start">
                      <div class="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <span class="text-green-600 font-bold text-sm">{{ direction.code.split('.')[0] }}</span>
                      </div>
                      <div class="flex-1">
                        <h3 class="font-medium text-gray-900">{{ direction.name }}</h3>
                <p class="text-sm text-gray-500 font-mono">{{ direction.code }}</p>
                        <p class="text-xs text-gray-400 mt-1">{{ getProfileCountByDirection(direction.id) }} профилей</p>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <BaseButton @click="openProfileModal(null, direction.id)" size="sm" variant="primary-outline">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Добавить профиль
                    </BaseButton>
                    <BaseButton @click="openDirectionModal(direction)" size="sm" variant="outline">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Редактировать
                    </BaseButton>
                  </div>
              </div>
              </div>
              
              <!-- Профили направления -->
              <div class="p-4">
                <div v-if="profilesByDirection(direction.id).length === 0" class="text-center py-6 text-gray-500">
                  <svg class="mx-auto h-6 w-6 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p class="text-xs">Нет профилей/специализаций</p>
            </div>
            
                <div v-else class="grid grid-cols-1 gap-3">
                  <div v-for="profile in profilesByDirection(direction.id)" :key="profile.id" 
                       class="flex justify-between items-center p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow">
                    <div class="flex-1">
                      <h4 class="font-medium text-gray-900 text-sm">{{ profile.name }}</h4>
                      <div v-if="profile.profile_exams && profile.profile_exams.length > 0" class="mt-1">
                        <div class="flex flex-wrap gap-1">
                          <span v-for="exam in profile.profile_exams.slice(0, 3)" :key="exam.subject_id"
                                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {{ exam.priority }}. {{ exam.subject ? exam.subject.name : getSubjectName(exam.subject_id) }}
                          </span>
                          <span v-if="profile.profile_exams.length > 3" 
                                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                            +{{ profile.profile_exams.length - 3 }}
                          </span>
                        </div>
                      </div>
                      <div v-else class="text-xs text-gray-400 mt-1">Экзамены не настроены</div>
                    </div>
                    <div class="flex items-center space-x-1 ml-4">
                      <BaseButton @click="openProfileModal(profile)" size="xs" variant="outline">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </BaseButton>
                      <BaseButton @click="confirmDelete('profile', profile.id)" size="xs" variant="danger-outline">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </BaseButton>
                    </div>
                  </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно Направления -->
    <BaseModal v-model="showDirectionModal" :title="currentDirection.id ? 'Редактирование направления' : 'Добавление направления'">
      <form @submit.prevent="saveDirection" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Код направления <span class="text-red-500">*</span>
          </label>
          <input v-model="currentDirection.code" required 
                 placeholder="Например: 21.03.01"
                 class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
          <p class="text-xs text-gray-500 mt-1">Стандартный код ФГОС</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Название направления <span class="text-red-500">*</span>
          </label>
          <input v-model="currentDirection.name" required 
                 placeholder="Например: Нефтегазовое дело"
                 class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
        </div>
        <div class="flex justify-end gap-3 pt-4 border-t">
            <BaseButton @click="closeDirectionModal" type="button" variant="outline">Отмена</BaseButton>
          <BaseButton type="submit" variant="primary" :disabled="isSaving">
            {{ isSaving ? 'Сохранение...' : 'Сохранить' }}
          </BaseButton>
        </div>
      </form>
    </BaseModal>

    <!-- Модальное окно Профиля -->
    <BaseModal v-model="showProfileModal" :title="currentProfile.id ? 'Редактирование профиля' : 'Добавление профиля'" class="!max-w-2xl">
        <form @submit.prevent="saveProfile" class="space-y-4">
            <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Название профиля/специализации <span class="text-red-500">*</span>
          </label>
          <input v-model="currentProfile.name" required 
                 placeholder="Например: Бурение нефтяных и газовых скважин (УРБ)"
                 class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
            </div>
            <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Описание</label>
          <textarea v-model="currentProfile.description" rows="3" 
                    placeholder="Краткое описание профиля..."
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"></textarea>
            </div>
            
            <!-- Управление экзаменами -->
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
                <select v-model="exam.subject_id" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
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

            <div class="flex justify-end gap-3 pt-4 border-t">
                <BaseButton @click="closeProfileModal" type="button" variant="outline">Отмена</BaseButton>
          <BaseButton type="submit" variant="primary" :disabled="isSaving">
            {{ isSaving ? 'Сохранение...' : 'Сохранить' }}
          </BaseButton>
            </div>
        </form>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { levels as levelsApi, directions as directionsApi, profiles as profilesApi, subjects as subjectsApi } from '@/api/education';
import { BaseButton, BaseModal } from '@/components/ui';
import { useToast } from 'vue-toastification';

const toast = useToast();

const isLoading = ref(false);
const isSaving = ref(false);

const educationLevels = ref([]);
const allDirections = ref([]);
const allProfiles = ref([]);
const allSubjects = ref([]);

const showDirectionModal = ref(false);
const showProfileModal = ref(false);

const initialDirection = () => ({ id: null, name: '', code: '', level_id: null });
const currentDirection = ref(initialDirection());

const initialProfile = () => ({ id: null, name: '', description: '', direction_id: null, exams: [] });
const currentProfile = ref(initialProfile());

// Computed properties for filtering
const directionsByLevel = (levelId) => {
    return allDirections.value.filter(d => d.level_id === levelId);
}

const profilesByDirection = (directionId) => {
    return allProfiles.value.filter(p => p.direction_id === directionId);
}

const getDirectionCount = (levelId) => {
  return directionsByLevel(levelId).length;
}

const getProfileCount = (levelId) => {
  return allProfiles.value.filter(p => {
    const direction = allDirections.value.find(d => d.id === p.direction_id);
    return direction && direction.level_id === levelId;
  }).length;
}

const getProfileCountByDirection = (directionId) => {
  return profilesByDirection(directionId).length;
}

function getSubjectName(subjectId) {
  const subject = allSubjects.value.find(s => s.id === subjectId);
  return subject ? subject.name : 'Неизвестно';
}

onMounted(async () => {
  await fetchData();
});

async function fetchData() {
    isLoading.value = true;
    try {
        const [levelsRes, directionsRes, profilesRes, subjectsRes] = await Promise.all([
            levelsApi.getAll(),
            directionsApi.getAll(),
            profilesApi.getAllWithDetails(),
            subjectsApi.getAll()
        ]);
        if (levelsRes.error) throw levelsRes.error;
        educationLevels.value = levelsRes.data;
        if (directionsRes.error) throw directionsRes.error;
        allDirections.value = directionsRes.data;
        if (profilesRes.error) throw profilesRes.error;
        allProfiles.value = profilesRes.data;
        if (subjectsRes.error) throw subjectsRes.error;
        allSubjects.value = subjectsRes.data;
    } catch(e) {
        toast.error('Ошибка загрузки данных: ' + e.message);
    } finally {
        isLoading.value = false;
    }
}

// Direction Modal
function openDirectionModal(direction = null, levelId = null) {
  if (direction) {
    currentDirection.value = { ...direction };
  } else {
    currentDirection.value = initialDirection();
    currentDirection.value.level_id = levelId;
  }
  showDirectionModal.value = true;
}

function closeDirectionModal() {
  showDirectionModal.value = false;
}

async function saveDirection() {
  isSaving.value = true;
  try {
    if (currentDirection.value.id) {
      const { error } = await directionsApi.update(currentDirection.value.id, currentDirection.value);
      if (error) throw error;
    } else {
      const { error } = await directionsApi.create(currentDirection.value);
      if (error) throw error;
    }
    toast.success('Направление сохранено');
    closeDirectionModal();
    await fetchData();
  } catch (e) {
    toast.error('Ошибка сохранения направления: ' + e.message);
  } finally {
    isSaving.value = false;
  }
}

// Profile Modal
function openProfileModal(profile = null, directionId = null) {
  if (profile) {
    currentProfile.value = {
        ...profile,
      exams: profile.profile_exams ? profile.profile_exams.map(pe => ({ 
        subject_id: pe.subject ? pe.subject.id : pe.subject_id, 
        priority: pe.priority 
      })) : []
    };
  } else {
    currentProfile.value = initialProfile();
    currentProfile.value.direction_id = directionId;
  }
  showProfileModal.value = true;
}

function closeProfileModal() {
  showProfileModal.value = false;
}

async function saveProfile() {
  isSaving.value = true;
  try {
    const payload = { ...currentProfile.value };
    if (payload.id) {
      const { error } = await profilesApi.update(payload.id, payload);
      if (error) throw error;
    } else {
      const { error } = await profilesApi.create(payload);
      if (error) throw error;
    }
    toast.success('Профиль сохранен');
    closeProfileModal();
    await fetchData();
  } catch (e) {
    toast.error('Ошибка сохранения профиля: ' + e.message);
  } finally {
    isSaving.value = false;
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

// Delete
async function confirmDelete(type, id) {
  if (confirm(`Вы уверены, что хотите удалить этот ${type === 'profile' ? 'профиль' : 'направление'}?`)) {
    try {
        let error;
        if (type === 'profile') {
            ({ error } = await profilesApi.delete(id));
        } else {
            ({ error } = await directionsApi.delete(id));
        }
        if (error) throw error;
        toast.success('Успешно удалено');
        await fetchData();
    } catch (e) {
        toast.error('Ошибка удаления: ' + e.message);
    }
  }
}
</script> 