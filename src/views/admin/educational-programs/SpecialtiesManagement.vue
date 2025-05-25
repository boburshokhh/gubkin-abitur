<template>
  <div>
    <div class="bg-white shadow rounded-lg p-4 mb-6">
      <h2 class="text-xl font-bold mb-4">Управление специальностями</h2>
      <p class="text-gray-600 mb-4">Добавление, редактирование и удаление специальностей для профилей подготовки.</p>
      
      <div class="flex gap-2 mb-4">
        <BaseButton @click="openSpecialtyModal()" variant="primary">
          Добавить специальность
        </BaseButton>
      </div>
      
      <!-- Фильтры и поиск -->
      <div class="flex flex-wrap gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Направление</label>
          <select 
            v-model="filters.directionId" 
            class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            @change="onDirectionChange"
          >
            <option value="">Все направления</option>
            <option v-for="direction in directionsData" :key="direction.id" :value="direction.id">
              {{ direction.name }}
            </option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Профиль</label>
          <select 
            v-model="filters.profileId" 
            class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            :disabled="!filters.directionId"
          >
            <option value="">Все профили</option>
            <option v-for="profile in filteredProfiles" :key="profile.id" :value="profile.id">
              {{ profile.name }}
            </option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Поиск</label>
          <input 
            v-model="filters.search" 
            type="text" 
            class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            placeholder="Поиск по названию или коду"
          />
        </div>
      </div>
    </div>
    
    <!-- Таблица специальностей -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div v-if="isLoading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mb-4"></div>
        <p class="text-gray-500">Загрузка данных...</p>
      </div>
      
      <div v-else-if="filteredSpecialties.length === 0" class="p-8 text-center">
        <p class="text-gray-500">Специальности не найдены</p>
      </div>
      
      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Код
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Название
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Профиль
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Направление
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
          <tr v-for="specialty in filteredSpecialties" :key="specialty.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ specialty.code }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ specialty.name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ getProfileName(specialty.profile_id) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ getDirectionName(getProfileDirectionId(specialty.profile_id)) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(specialty.created_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button 
                @click="openSpecialtyModal(specialty)" 
                class="text-primary-600 hover:text-primary-900 mr-4"
              >
                Редактировать
              </button>
              <button 
                @click="confirmDeleteSpecialty(specialty)" 
                class="text-red-600 hover:text-red-900"
              >
                Удалить
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Модальное окно специальности -->
    <BaseModal 
      v-if="showSpecialtyModal" 
      :title="isEditMode ? 'Редактирование специальности' : 'Добавление специальности'" 
      @close="closeSpecialtyModal"
    >
      <form @submit.prevent="saveSpecialty">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Направление</label>
            <select 
              v-model="selectedDirectionId" 
              required
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              @change="onModalDirectionChange"
            >
              <option value="">Выберите направление</option>
              <option v-for="direction in directionsData" :key="direction.id" :value="direction.id">
                {{ direction.name }} ({{ direction.program_type === 'bachelor' ? 'Бакалавриат' : 'Специалитет' }})
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Профиль</label>
            <select 
              v-model="currentSpecialty.profile_id" 
              required
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              :disabled="!selectedDirectionId"
            >
              <option value="">Выберите профиль</option>
              <option v-for="profile in availableProfiles" :key="profile.id" :value="profile.id">
                {{ profile.name }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Код специальности</label>
            <input 
              v-model="currentSpecialty.code" 
              type="text" 
              required
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              placeholder="Например: 09.03.01"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Название специальности</label>
            <input 
              v-model="currentSpecialty.name" 
              type="text" 
              required
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea 
              v-model="currentSpecialty.description" 
              rows="3" 
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            ></textarea>
          </div>
        </div>
        
        <div class="mt-6 flex justify-end gap-3">
          <BaseButton type="button" @click="closeSpecialtyModal" variant="outline">
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
      <p class="mb-4">Вы действительно хотите удалить специальность "{{ specialtyToDelete?.name }}"?</p>
      
      <div class="flex justify-end gap-3">
        <BaseButton type="button" @click="cancelDelete" variant="outline">
          Отмена
        </BaseButton>
        <BaseButton type="button" @click="deleteSpecialty" variant="danger" :disabled="isDeleting">
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
const showSpecialtyModal = ref(false);
const showDeleteModal = ref(false);
const isEditMode = ref(false);

// Данные
const directionsData = ref([]);
const profilesData = ref([]);
const specialtiesData = ref([]);

// Модальные данные
const selectedDirectionId = ref('');
const availableProfiles = ref([]);

// Текущая специальность для редактирования
const defaultSpecialty = {
  profile_id: '',
  code: '',
  name: '',
  description: ''
};

const currentSpecialty = ref({ ...defaultSpecialty });
const specialtyToDelete = ref(null);

// Фильтры
const filters = reactive({
  directionId: '',
  profileId: '',
  search: ''
});

// Отфильтрованные профили на основе выбранного направления
const filteredProfiles = computed(() => {
  if (!filters.directionId) return profilesData.value;
  
  return profilesData.value.filter(
    profile => profile.direction_id === filters.directionId
  );
});

// Отфильтрованные специальности
const filteredSpecialties = computed(() => {
  let filtered = [...specialtiesData.value];
  
  if (filters.profileId) {
    filtered = filtered.filter(specialty => specialty.profile_id === filters.profileId);
  } else if (filters.directionId) {
    // Фильтрация по направлению, если профиль не выбран
    const profileIds = profilesData.value
      .filter(profile => profile.direction_id === filters.directionId)
      .map(profile => profile.id);
    
    filtered = filtered.filter(specialty => profileIds.includes(specialty.profile_id));
  }
  
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(specialty => 
      specialty.name.toLowerCase().includes(searchLower) || 
      specialty.code.toLowerCase().includes(searchLower)
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

// Вспомогательные функции для получения названий
const getProfileName = (profileId) => {
  const profile = profilesData.value.find(p => p.id === profileId);
  return profile ? profile.name : 'Не указано';
};

const getProfileDirectionId = (profileId) => {
  const profile = profilesData.value.find(p => p.id === profileId);
  return profile ? profile.direction_id : null;
};

const getDirectionName = (directionId) => {
  const direction = directionsData.value.find(d => d.id === directionId);
  return direction ? direction.name : 'Не указано';
};

// Обработчик изменения направления в фильтрах
const onDirectionChange = () => {
  // Сбрасываем выбранный профиль при изменении направления
  filters.profileId = '';
};

// Обработчик изменения направления в модальном окне
const onModalDirectionChange = () => {
  currentSpecialty.value.profile_id = '';
  
  // Фильтруем профили для выбранного направления
  if (selectedDirectionId.value) {
    availableProfiles.value = profilesData.value.filter(
      profile => profile.direction_id === selectedDirectionId.value
    );
  } else {
    availableProfiles.value = [];
  }
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
    
    // Получаем специальности
    const { data: fetchedSpecialties, error: specialtiesError } = await specialties.getAll();
    
    if (specialtiesError) throw specialtiesError;
    
    specialtiesData.value = fetchedSpecialties || [];
    
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
    toast.error('Не удалось загрузить данные специальностей');
  } finally {
    isLoading.value = false;
  }
};

// Открытие модального окна для создания/редактирования
const openSpecialtyModal = (specialty = null) => {
  // Сбрасываем доступные профили и выбранное направление
  availableProfiles.value = [];
  selectedDirectionId.value = '';
  
  if (specialty) {
    // Режим редактирования
    isEditMode.value = true;
    currentSpecialty.value = { ...specialty };
    
    // Находим направление для этого профиля
    const profile = profilesData.value.find(p => p.id === specialty.profile_id);
    if (profile) {
      selectedDirectionId.value = profile.direction_id;
      
      // Загружаем профили этого направления
      availableProfiles.value = profilesData.value.filter(
        p => p.direction_id === profile.direction_id
      );
    }
  } else {
    // Режим создания
    isEditMode.value = false;
    currentSpecialty.value = { ...defaultSpecialty };
  }
  
  showSpecialtyModal.value = true;
};

// Закрытие модального окна
const closeSpecialtyModal = () => {
  showSpecialtyModal.value = false;
  currentSpecialty.value = { ...defaultSpecialty };
  selectedDirectionId.value = '';
  availableProfiles.value = [];
};

// Сохранение специальности
const saveSpecialty = async () => {
  isSaving.value = true;
  
  try {
    // Формируем объект для сохранения
    const specialtyToSave = {
      ...currentSpecialty.value,
      updated_at: new Date()
    };
    
    let result;
    
    if (isEditMode.value) {
      // Обновление существующей
      result = await specialties.update(currentSpecialty.value.id, specialtyToSave);
    } else {
      // Создание новой
      specialtyToSave.created_at = new Date();
      result = await specialties.create(specialtyToSave);
    }
    
    if (result.error) throw result.error;
    
    toast.success(isEditMode.value 
      ? 'Специальность успешно обновлена' 
      : 'Специальность успешно создана');
    
    closeSpecialtyModal();
    fetchData();
    
  } catch (error) {
    console.error('Ошибка при сохранении специальности:', error);
    toast.error('Не удалось сохранить специальность');
  } finally {
    isSaving.value = false;
  }
};

// Подтверждение удаления
const confirmDeleteSpecialty = (specialty) => {
  specialtyToDelete.value = specialty;
  showDeleteModal.value = true;
};

// Отмена удаления
const cancelDelete = () => {
  showDeleteModal.value = false;
  specialtyToDelete.value = null;
};

// Удаление специальности
const deleteSpecialty = async () => {
  if (!specialtyToDelete.value) return;
  
  isDeleting.value = true;
  
  try {
    const { error } = await specialties.delete(specialtyToDelete.value.id);
    
    if (error) throw error;
    
    toast.success('Специальность успешно удалена');
    cancelDelete();
    fetchData();
    
  } catch (error) {
    console.error('Ошибка при удалении специальности:', error);
    toast.error('Не удалось удалить специальность');
  } finally {
    isDeleting.value = false;
  }
};

// Загрузка данных при монтировании компонента
onMounted(() => {
  fetchData();
});
</script> 