<template>
  <div>
    <div class="bg-white shadow rounded-lg p-4 mb-6">
      <h2 class="text-xl font-bold mb-4">Управление профилями подготовки</h2>
      <p class="text-gray-600 mb-4">Добавление, редактирование и удаление профилей для направлений.</p>
      
      <div class="flex gap-2 mb-4">
        <BaseButton @click="openProfileModal()" variant="primary">
          Добавить профиль
        </BaseButton>
      </div>
      
      <!-- Фильтры и поиск -->
      <div class="flex flex-wrap gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Направление</label>
          <select 
            v-model="filters.directionId" 
            class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            <option value="">Все направления</option>
            <option v-for="direction in directionsData" :key="direction.id" :value="direction.id">
              {{ direction.name }}
            </option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Поиск</label>
          <input 
            v-model="filters.search" 
            type="text" 
            class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            placeholder="Поиск по названию"
          />
        </div>
      </div>
    </div>
    
    <!-- Таблица профилей -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div v-if="isLoading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mb-4"></div>
        <p class="text-gray-500">Загрузка данных...</p>
      </div>
      
      <div v-else-if="filteredProfiles.length === 0" class="p-8 text-center">
        <p class="text-gray-500">Профили не найдены</p>
      </div>
      
      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Название
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Направление
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Тип программы
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Специальности
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Дата создания
            </th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Действия
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="profile in filteredProfiles" :key="profile.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ profile.name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ profile.direction?.name || 'Не указано' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ profile.direction?.program_type === 'bachelor' ? 'Бакалавриат' : 'Специалитет' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ specialtiesCount[profile.id] || 0 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(profile.created_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button 
                @click="openProfileModal(profile)" 
                class="text-primary-600 hover:text-primary-900 mr-4"
              >
                Редактировать
              </button>
              <button 
                @click="confirmDeleteProfile(profile)" 
                class="text-red-600 hover:text-red-900"
              >
                Удалить
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Модальное окно профиля -->
    <BaseModal 
      v-if="showProfileModal" 
      :title="isEditMode ? 'Редактирование профиля' : 'Добавление профиля'" 
      @close="closeProfileModal"
    >
      <form @submit.prevent="saveProfile">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Направление</label>
            <select 
              v-model="currentProfile.direction_id" 
              required
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="">Выберите направление</option>
              <option v-for="direction in directionsData" :key="direction.id" :value="direction.id">
                {{ direction.name }} ({{ direction.program_type === 'bachelor' ? 'Бакалавриат' : 'Специалитет' }})
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Название профиля</label>
            <input 
              v-model="currentProfile.name" 
              type="text" 
              required
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea 
              v-model="currentProfile.description" 
              rows="3" 
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            ></textarea>
          </div>
        </div>
        
        <div class="mt-6 flex justify-end gap-3">
          <BaseButton type="button" @click="closeProfileModal" variant="outline">
            Отмена
          </BaseButton>
          <BaseButton type="submit" variant="primary" :disabled="isSaving">
            {{ isSaving ? 'Сохранение...' : 'Сохранить' }}
          </BaseButton>
        </div>
      </form>
    </BaseModal>
    
    <!-- Модальное окно подтверждения удаления -->
    <BaseModal 
      v-if="showDeleteModal" 
      title="Подтверждение удаления" 
      @close="cancelDelete"
    >
      <p class="mb-4">Вы действительно хотите удалить профиль "{{ profileToDelete?.name }}"?</p>
      <p class="mb-6 text-red-600 text-sm">Это действие удалит также все связанные специальности!</p>
      
      <div class="flex justify-end gap-3">
        <BaseButton type="button" @click="cancelDelete" variant="outline">
          Отмена
        </BaseButton>
        <BaseButton type="button" @click="deleteProfile" variant="danger" :disabled="isDeleting">
          {{ isDeleting ? 'Удаление...' : 'Удалить' }}
        </BaseButton>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { directions, profiles, specialties } from '@/api/supabase';
import { BaseButton, BaseModal } from '@/components/ui';
import { useToast } from 'vue-toastification';

const toast = useToast();

// Состояние загрузки
const isLoading = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false);

// Модальные окна
const showProfileModal = ref(false);
const showDeleteModal = ref(false);
const isEditMode = ref(false);

// Данные направлений и профилей
const directionsData = ref([]);
const profilesData = ref([]);
const specialtiesCount = ref({});

// Текущий профиль для редактирования
const defaultProfile = {
  direction_id: '',
  name: '',
  description: ''
};

const currentProfile = ref({ ...defaultProfile });
const profileToDelete = ref(null);

// Фильтры
const filters = reactive({
  directionId: '',
  search: ''
});

// Фильтрованные профили
const filteredProfiles = computed(() => {
  let filtered = [...profilesData.value];
  
  if (filters.directionId) {
    filtered = filtered.filter(profile => profile.direction_id === filters.directionId);
  }
  
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(profile => 
      profile.name.toLowerCase().includes(searchLower)
    );
  }
  
  return filtered;
});

// Форматирование даты
const formatDate = (dateString) => {
  if (!dateString) return 'Не указано';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

// Загрузка данных
const fetchData = async () => {
  isLoading.value = true;
  
  try {
    // Получаем направления
    const { data: fetchedDirections, error: directionsError } = await directions.getAll();
    
    if (directionsError) throw directionsError;
    
    directionsData.value = fetchedDirections || [];
    
    // Получаем профили
    const { data: fetchedProfiles, error: profilesError } = await profiles.getAll();
    
    if (profilesError) throw profilesError;
    
    profilesData.value = fetchedProfiles || [];
    
    // Получаем количество специальностей для каждого профиля
    const { data: allSpecialties, error: specialtiesError } = await specialties.getAll();
    
    if (specialtiesError) throw specialtiesError;
    
    // Считаем специальности по профилям
    const countByProfile = {};
    
    if (allSpecialties) {
      allSpecialties.forEach(specialty => {
        if (!countByProfile[specialty.profile_id]) {
          countByProfile[specialty.profile_id] = 0;
        }
        countByProfile[specialty.profile_id]++;
      });
    }
    
    specialtiesCount.value = countByProfile;
    
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
    toast.error('Не удалось загрузить данные профилей');
  } finally {
    isLoading.value = false;
  }
};

// Открытие модального окна для создания/редактирования
const openProfileModal = (profile = null) => {
  if (profile) {
    // Режим редактирования
    isEditMode.value = true;
    currentProfile.value = { ...profile };
  } else {
    // Режим создания
    isEditMode.value = false;
    currentProfile.value = { ...defaultProfile };
  }
  
  showProfileModal.value = true;
};

// Закрытие модального окна
const closeProfileModal = () => {
  showProfileModal.value = false;
  currentProfile.value = { ...defaultProfile };
};

// Сохранение профиля
const saveProfile = async () => {
  isSaving.value = true;
  
  try {
    // Формируем объект для сохранения
    const profileToSave = {
      ...currentProfile.value,
      updated_at: new Date()
    };
    
    let result;
    
    if (isEditMode.value) {
      // Обновление существующего
      result = await profiles.update(currentProfile.value.id, profileToSave);
    } else {
      // Создание нового
      profileToSave.created_at = new Date();
      result = await profiles.create(profileToSave);
    }
    
    if (result.error) throw result.error;
    
    toast.success(isEditMode.value 
      ? 'Профиль успешно обновлен' 
      : 'Профиль успешно создан');
    
    closeProfileModal();
    fetchData();
    
  } catch (error) {
    console.error('Ошибка при сохранении профиля:', error);
    toast.error('Не удалось сохранить профиль');
  } finally {
    isSaving.value = false;
  }
};

// Подтверждение удаления
const confirmDeleteProfile = (profile) => {
  profileToDelete.value = profile;
  showDeleteModal.value = true;
};

// Отмена удаления
const cancelDelete = () => {
  showDeleteModal.value = false;
  profileToDelete.value = null;
};

// Удаление профиля
const deleteProfile = async () => {
  if (!profileToDelete.value) return;
  
  isDeleting.value = true;
  
  try {
    const { error } = await profiles.delete(profileToDelete.value.id);
    
    if (error) throw error;
    
    toast.success('Профиль успешно удален');
    cancelDelete();
    fetchData();
    
  } catch (error) {
    console.error('Ошибка при удалении профиля:', error);
    toast.error('Не удалось удалить профиль');
  } finally {
    isDeleting.value = false;
  }
};

// Загрузка данных при монтировании компонента
onMounted(() => {
  fetchData();
});
</script> 