<template>
  <div>
    <div class="bg-white shadow rounded-lg p-4 mb-6">
      <h2 class="text-xl font-bold mb-4">Управление направлениями подготовки</h2>
      <p class="text-gray-600 mb-4">Добавление, редактирование и удаление направлений бакалавриата и специалитета.</p>
      
      <div class="flex gap-2 mb-4">
        <BaseButton @click="openDirectionModal()" variant="primary">
          Добавить направление
        </BaseButton>
      </div>
      
      <!-- Фильтры и поиск -->
      <div class="flex flex-wrap gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Тип программы</label>
          <select 
            v-model="filters.programType" 
            class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            <option value="">Все</option>
            <option value="bachelor">Бакалавриат</option>
            <option value="specialist">Специалитет</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Область</label>
          <select 
            v-model="filters.field" 
            class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            <option value="">Все</option>
            <option value="oil">Нефтегазовое дело</option>
            <option value="economics">Экономика</option>
            <option value="management">Менеджмент</option>
            <option value="geology">Геология</option>
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
    
    <!-- Таблица направлений -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div v-if="isLoading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mb-4"></div>
        <p class="text-gray-500">Загрузка данных...</p>
      </div>
      
      <div v-else-if="filteredDirections.length === 0" class="p-8 text-center">
        <p class="text-gray-500">Направления не найдены</p>
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
              Тип
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Область
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Статус
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Профили
            </th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Действия
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="direction in filteredDirections" :key="direction.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ direction.code }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ direction.name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ direction.program_type === 'bachelor' ? 'Бакалавриат' : 'Специалитет' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ getFieldName(direction.field) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="direction.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
              >
                {{ direction.is_active ? 'Активно' : 'Неактивно' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ profilesCount[direction.id] || 0 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button 
                @click="openDirectionModal(direction)" 
                class="text-primary-600 hover:text-primary-900 mr-4"
              >
                Редактировать
              </button>
              <button 
                @click="confirmDeleteDirection(direction)" 
                class="text-red-600 hover:text-red-900"
              >
                Удалить
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Модальное окно направления -->
    <BaseModal 
      v-model="showDirectionModal"
      :title="isEditMode ? 'Редактирование направления' : 'Добавление направления'" 
      @close="closeDirectionModal"
    >
      <form @submit.prevent="saveDirection" class="direction-form space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Код направления <span class="text-red-500">*</span>
            </label>
            <input 
              v-model="currentDirection.code" 
              type="text" 
              required
              :class="{'border-red-500': formErrors.code}"
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            />
            <p v-if="formErrors.code" class="mt-1 text-sm text-red-500">{{ formErrors.code }}</p>
          </div>
          
          <div class="col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              URL-slug <span class="text-red-500">*</span>
            </label>
            <input 
              v-model="currentDirection.slug" 
              type="text" 
              required
              :class="{'border-red-500': formErrors.slug}"
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            />
            <p v-if="formErrors.slug" class="mt-1 text-sm text-red-500">{{ formErrors.slug }}</p>
          </div>
          
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Название <span class="text-red-500">*</span>
            </label>
            <input 
              v-model="currentDirection.name" 
              type="text" 
              required
              :class="{'border-red-500': formErrors.name}"
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            />
            <p v-if="formErrors.name" class="mt-1 text-sm text-red-500">{{ formErrors.name }}</p>
          </div>
          
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea 
              v-model="currentDirection.description" 
              rows="3" 
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            ></textarea>
          </div>
          
          <div class="col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Тип программы</label>
            <select 
              v-model="currentDirection.program_type" 
              required
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="bachelor">Бакалавриат</option>
              <option value="specialist">Специалитет</option>
            </select>
          </div>
          
          <div class="col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Область</label>
            <select 
              v-model="currentDirection.field" 
              required
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="oil">Нефтегазовое дело</option>
              <option value="economics">Экономика</option>
              <option value="management">Менеджмент</option>
              <option value="geology">Геология</option>
            </select>
          </div>
          
          <div class="col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Тип иконки</label>
            <select 
              v-model="currentDirection.icon_type" 
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="drill">Бурение</option>
              <option value="book">Книга</option>
              <option value="chart">График</option>
              <option value="calculator">Калькулятор</option>
              <option value="atom">Атом</option>
              <option value="flask">Колба</option>
            </select>
          </div>
          
          <div class="col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Длительность</label>
            <input 
              v-model="currentDirection.duration" 
              type="text" 
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              placeholder="Например: 4 года"
            />
          </div>
          
          <div class="col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Количество мест</label>
            <input 
              v-model="currentDirection.places" 
              type="text" 
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              placeholder="Например: 25 мест"
            />
          </div>
          
          <div class="col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Статус</label>
            <div class="mt-2">
              <label class="inline-flex items-center">
                <input 
                  v-model="currentDirection.is_active" 
                  type="checkbox" 
                  class="form-checkbox h-5 w-5 text-primary-600 focus:ring-primary-500" 
                />
                <span class="ml-2 text-gray-700">Активно</span>
              </label>
            </div>
          </div>
          
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Теги (через запятую)</label>
            <input 
              v-model="tagsInput" 
              type="text" 
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              placeholder="ИТ, Программирование, Наука"
            />
          </div>
        </div>
        
        <div class="mt-6 flex justify-end gap-3">
          <BaseButton type="button" @click="closeDirectionModal" variant="outline" :disabled="isSaving">
            Отмена
          </BaseButton>
          <BaseButton type="submit" variant="primary" :disabled="isSaving" :loading="isSaving">
            {{ isSaving ? 'Сохранение...' : 'Сохранить' }}
          </BaseButton>
        </div>
      </form>
    </BaseModal>
    
    <!-- Модальное окно подтверждения удаления -->
    <BaseModal 
      v-model="showDeleteModal"
      title="Подтверждение удаления" 
      @close="cancelDelete"
    >
      <p class="mb-4">Вы действительно хотите удалить направление "{{ directionToDelete?.name }}"?</p>
      <p class="mb-6 text-red-600 text-sm">Это действие удалит также все связанные профили и специальности!</p>
      
      <div class="flex justify-end gap-3">
        <BaseButton type="button" @click="cancelDelete" variant="outline">
          Отмена
        </BaseButton>
        <BaseButton type="button" @click="deleteDirection" variant="danger" :disabled="isDeleting">
          {{ isDeleting ? 'Удаление...' : 'Удалить' }}
        </BaseButton>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { directions, profiles } from '@/api/supabase';
import { BaseButton, BaseModal } from '@/components/ui';
import { useToast } from 'vue-toastification';

const toast = useToast();

// Состояние загрузки
const isLoading = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false);

// Модальные окна
const showDirectionModal = ref(false);
const showDeleteModal = ref(false);
const isEditMode = ref(false);

// Данные направлений и профилей
const directionsData = ref([]);
const profilesCount = ref({});

// Текущее направление для редактирования
const defaultDirection = {
  code: '',
  slug: '',
  name: '',
  description: '',
  field: 'oil',
  icon_type: 'book',
  program_type: 'bachelor',
  duration: '',
  places: '',
  is_active: true,
  tags: []
};

const currentDirection = ref({ ...defaultDirection });
const directionToDelete = ref(null);
const tagsInput = ref('');

// Фильтры
const filters = reactive({
  programType: '',
  field: '',
  search: ''
});

// Добавляем состояние для ошибок формы
const formErrors = reactive({
  code: '',
  name: '',
  slug: ''
});

// Фильтрованные направления
const filteredDirections = computed(() => {
  let filtered = [...directionsData.value];
  
  if (filters.programType) {
    filtered = filtered.filter(dir => dir.program_type === filters.programType);
  }
  
  if (filters.field) {
    filtered = filtered.filter(dir => dir.field === filters.field);
  }
  
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(dir => 
      dir.name.toLowerCase().includes(searchLower) || 
      dir.code.toLowerCase().includes(searchLower)
    );
  }
  
  return filtered;
});

// Получение названия области обучения
const getFieldName = (fieldId) => {
  const fields = {
    'oil': 'Нефтегазовое дело',
    'economics': 'Экономика',
    'management': 'Менеджмент',
    'geology': 'Геология'
  };
  
  return fields[fieldId] || fieldId;
};

// Загрузка данных
const fetchData = async () => {
  isLoading.value = true;
  
  try {
    // Получаем направления
    const { data: fetchedDirections, error: directionsError } = await directions.getAll();
    
    if (directionsError) throw directionsError;
    
    directionsData.value = fetchedDirections || [];
    
    // Получаем количество профилей для каждого направления
    const { data: allProfiles, error: profilesError } = await profiles.getAll();
    
    if (profilesError) throw profilesError;
    
    // Считаем профили по направлениям
    const countByDirection = {};
    
    if (allProfiles) {
      allProfiles.forEach(profile => {
        if (!countByDirection[profile.direction_id]) {
          countByDirection[profile.direction_id] = 0;
        }
        countByDirection[profile.direction_id]++;
      });
    }
    
    profilesCount.value = countByDirection;
    
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
    toast.error('Не удалось загрузить данные направлений');
  } finally {
    isLoading.value = false;
  }
};

// Открытие модального окна для создания/редактирования
const openDirectionModal = (direction = null) => {
  try {
    console.log('Открытие модального окна. Данные направления:', direction);
    
    if (direction) {
      // Режим редактирования
      isEditMode.value = true;
      currentDirection.value = { ...direction };
      tagsInput.value = direction.tags ? direction.tags.join(', ') : '';
      console.log('Режим редактирования. Текущее направление:', currentDirection.value);
    } else {
      // Режим создания
      isEditMode.value = false;
      currentDirection.value = { ...defaultDirection };
      tagsInput.value = '';
      console.log('Режим создания. Шаблон направления:', currentDirection.value);
    }
    
    showDirectionModal.value = true;
  } catch (error) {
    console.error('Ошибка при открытии модального окна:', error);
    toast.error('Произошла ошибка при открытии формы направления');
  }
};

// Закрытие модального окна
const closeDirectionModal = () => {
  console.log('Закрытие модального окна');
  showDirectionModal.value = false;
  // Сбрасываем ошибки формы
  Object.keys(formErrors).forEach(key => formErrors[key] = '');
  currentDirection.value = { ...defaultDirection };
  tagsInput.value = '';
  console.log('Модальное окно закрыто, данные сброшены');
};

// Функция валидации формы
const validateForm = () => {
  let isValid = true;
  
  // Сбрасываем ошибки
  Object.keys(formErrors).forEach(key => formErrors[key] = '');
  
  if (!currentDirection.value.code?.trim()) {
    formErrors.code = 'Код направления обязателен';
    isValid = false;
  }
  
  if (!currentDirection.value.name?.trim()) {
    formErrors.name = 'Название обязательно';
    isValid = false;
  }
  
  if (!currentDirection.value.slug?.trim()) {
    formErrors.slug = 'URL-slug обязателен';
    isValid = false;
  }
  
  return isValid;
};

// Сохранение направления
const saveDirection = async (event) => {
  event.preventDefault();
  console.log('Начало сохранения направления');
  console.log('Текущие данные:', currentDirection.value);
  
  // Проверяем валидность формы
  if (!validateForm()) {
    console.log('Форма не прошла валидацию');
    toast.error('Пожалуйста, заполните все обязательные поля');
    return;
  }
  
  isSaving.value = true;
  
  try {
    // Преобразуем теги из строки в массив
    const tags = tagsInput.value.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag);
    
    console.log('Обработанные теги:', tags);
    
    // Формируем объект для сохранения
    const directionToSave = {
      ...currentDirection.value,
      tags,
      updated_at: new Date().toISOString()
    };
    
    console.log('Объект для сохранения:', directionToSave);
    
    let result;
    
    if (isEditMode.value) {
      console.log('Обновление существующего направления:', directionToSave.id);
      result = await directions.update(directionToSave.id, directionToSave);
    } else {
      console.log('Создание нового направления');
      directionToSave.created_at = new Date().toISOString();
      result = await directions.create(directionToSave);
    }
    
    console.log('Результат API запроса:', result);
    
    if (result.error) {
      throw result.error;
    }
    
    toast.success(isEditMode.value 
      ? 'Направление успешно обновлено' 
      : 'Направление успешно создано');
    
    closeDirectionModal();
    await fetchData();
    
  } catch (error) {
    console.error('Ошибка при сохранении:', error);
    toast.error(`Не удалось сохранить направление: ${error.message || 'Неизвестная ошибка'}`);
  } finally {
    isSaving.value = false;
  }
};

// Подтверждение удаления
const confirmDeleteDirection = (direction) => {
  directionToDelete.value = direction;
  showDeleteModal.value = true;
};

// Отмена удаления
const cancelDelete = () => {
  showDeleteModal.value = false;
  directionToDelete.value = null;
};

// Удаление направления
const deleteDirection = async () => {
  if (!directionToDelete.value) return;
  
  isDeleting.value = true;
  
  try {
    const { error } = await directions.delete(directionToDelete.value.id);
    
    if (error) throw error;
    
    toast.success('Направление успешно удалено');
    cancelDelete();
    fetchData();
    
  } catch (error) {
    console.error('Ошибка при удалении направления:', error);
    toast.error('Не удалось удалить направление');
  } finally {
    isDeleting.value = false;
  }
};

// Загрузка данных при монтировании компонента
onMounted(() => {
  fetchData();
});
</script> 