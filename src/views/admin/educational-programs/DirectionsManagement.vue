<template>
  <div>
    <!-- Фильтры -->
    <DirectionFilters 
      v-model="filters"
      :fields="filteredFields"
      :total-count="filteredDirections.length"
      @add="openDirectionModal()"
    />
    
    <!-- Список направлений -->
    <DirectionList 
      :items="filteredDirections"
      :loading="isLoading"
      :direction-subjects-map="directionSubjectsMap"
      :subjects-data="subjectsData"
      :field-mapping="fieldMapping"
      @edit="openDirectionModal"
      @delete="confirmDeleteDirection"
    />
    
    <!-- Модальное окно направления -->
    <BaseModal 
      v-model="showDirectionModal"
      :title="isEditMode ? 'Редактирование направления' : 'Добавление направления'" 
      @close="closeDirectionModal"
      class="w-full sm:w-11/12 md:w-4/5 lg:w-3/5 xl:w-3/5 mx-auto"
    >
      <form @submit.prevent="saveDirection" class="direction-form space-y-4 overflow-y-auto max-h-[80vh]">
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
              @change="handleProgramTypeChange"
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
              <option v-for="field in availableFields" :key="field.value" :value="field.value">
                {{ field.label }}
              </option>
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
          
          <!-- Новая секция для выбора предметов для экзамена -->
          <div class="col-span-2 border-t border-gray-200 pt-4 mt-2">
            <h3 class="text-lg font-medium text-gray-900 mb-3">Предметы для экзамена</h3>
            
            <div v-if="isLoadingSubjects" class="py-2">
              <div class="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary-600 mr-2"></div>
              <span class="text-sm text-gray-500">Загрузка предметов...</span>
            </div>
            
            <div v-else class="space-y-3">
              <div class="flex flex-wrap gap-2">
                <div 
                  v-for="subject in subjectsData" 
                  :key="subject.id" 
                  class="flex-1 min-w-[160px] max-w-full sm:max-w-[200px]"
                >
                  <label class="flex items-center p-2 border rounded-md w-full cursor-pointer" 
                    :class="isSubjectSelected(subject.id) ? 'bg-primary-50 border-primary-300' : 'border-gray-300'"
                  >
                    <input 
                      type="checkbox" 
                      :value="subject.id" 
                      v-model="selectedSubjectIds"
                      class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span class="ml-2 text-sm truncate">{{ subject.name }}</span>
                  </label>
                </div>
              </div>
              
              <div v-if="selectedSubjectIds.length > 0" class="mt-4 space-y-3">
                <h4 class="font-medium text-sm text-gray-700">Минимальные баллы для выбранных предметов:</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div v-for="subjectId in selectedSubjectIds" :key="subjectId" 
                       class="flex items-center gap-3 border p-2 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <div class="flex-grow">
                      <span class="text-sm font-medium">{{ getSubjectName(subjectId) }}</span>
                    </div>
                    <div class="w-24 flex items-center">
                      <input 
                        v-model="subjectScores[subjectId]" 
                        type="number" 
                        min="0" 
                        max="100" 
                        class="block w-full pl-3 pr-2 py-1 text-base border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                        placeholder="Мин. балл"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-if="selectedSubjectIds.length === 0" class="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-md">
                Выберите хотя бы один предмет для экзамена
              </div>
            </div>
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
import { directions, profiles, subjects } from '@/api/supabase';
import { BaseButton, BaseModal } from '@/components/ui';
import { useToast } from 'vue-toastification';
import DirectionFilters from '@/components/admin/directions/DirectionFilters.vue';
import DirectionList from '@/components/admin/directions/DirectionList.vue';
import useDirections from '@/composables/useDirections';

const toast = useToast();

// Используем composable для работы с направлениями
const {
  isLoading, 
  isSaving, 
  isDeleting,
  isLoadingSubjects,
  directionsData,
  subjectsData,
  directionSubjectsMap,
  fetchData, 
  fetchSubjects,
  getFieldName,
  deleteDirection: removeDirection
} = useDirections();

// Фильтры
const filters = reactive({
  programType: '',
  field: '',
  search: ''
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

// Маппинг полей для использования в компонентах
const fieldMapping = computed(() => {
  const result = {};
  
  // Бакалавриат
  result['oil_bachelor'] = 'Нефтегазовое дело (21.03.01)';
  result['economics_bachelor'] = 'Экономика (38.03.01)';
  result['management_bachelor'] = 'Менеджмент (38.03.02)';
  result['geology_bachelor'] = 'Геология (21.03.01)';
  
  // Специалитет
  result['oil_tech_specialist'] = 'Нефтегазовые техника и технологии (21.05.06)';
  result['geology_tech_specialist'] = 'Технология геологической разведки (21.05.03)';
  
  // Старые значения для совместимости
  result['oil'] = 'Нефтегазовое дело';
  result['economics'] = 'Экономика';
  result['management'] = 'Менеджмент';
  result['geology'] = 'Геология';
  
  return result;
});

// Фильтрованные области в зависимости от выбранного типа программы
const filteredFields = computed(() => {
  // Если не выбран тип программы, возвращаем все возможные области
  if (!filters.programType) {
    return [
      // Для бакалавриата
      { value: 'oil_bachelor', label: 'Нефтегазовое дело (21.03.01)' },
      { value: 'economics_bachelor', label: 'Экономика (38.03.01)' },
      { value: 'management_bachelor', label: 'Менеджмент (38.03.02)' },
      { value: 'geology_bachelor', label: 'Геология (21.03.01)' },
      // Для специалитета
      { value: 'oil_tech_specialist', label: 'Нефтегазовые техника и технологии (21.05.06)' },
      { value: 'geology_tech_specialist', label: 'Технология геологической разведки (21.05.03)' },
      // Старые значения для совместимости
      { value: 'oil', label: 'Нефтегазовое дело' },
      { value: 'economics', label: 'Экономика' },
      { value: 'management', label: 'Менеджмент' },
      { value: 'geology', label: 'Геология' }
    ];
  }
  
  // Для бакалавриата
  if (filters.programType === 'bachelor') {
    return [
      { value: 'oil_bachelor', label: 'Нефтегазовое дело (21.03.01)' },
      { value: 'economics_bachelor', label: 'Экономика (38.03.01)' },
      { value: 'management_bachelor', label: 'Менеджмент (38.03.02)' },
      { value: 'geology_bachelor', label: 'Геология (21.03.01)' },
      // Для обратной совместимости
      { value: 'oil', label: 'Нефтегазовое дело' },
      { value: 'economics', label: 'Экономика' },
      { value: 'management', label: 'Менеджмент' },
      { value: 'geology', label: 'Геология' }
    ];
  }
  
  // Для специалитета
  if (filters.programType === 'specialist') {
    return [
      { value: 'oil_tech_specialist', label: 'Нефтегазовые техника и технологии (21.05.06)' },
      { value: 'geology_tech_specialist', label: 'Технология геологической разведки (21.05.03)' }
    ];
  }
  
  return [];
});

// Модальные окна
const showDirectionModal = ref(false);
const showDeleteModal = ref(false);
const isEditMode = ref(false);

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
const selectedSubjectIds = ref([]);
const subjectScores = ref({});

// Добавляем состояние для ошибок формы
const formErrors = ref({
  code: '',
  name: '',
  slug: ''
});

// Вычисляемое свойство для доступных областей в зависимости от типа программы
const availableFields = computed(() => {
  if (currentDirection.value.program_type === 'bachelor') {
    return [
      { value: 'oil_bachelor', label: 'Нефтегазовое дело (21.03.01)' },
      { value: 'economics_bachelor', label: 'Экономика (38.03.01)' },
      { value: 'management_bachelor', label: 'Менеджмент (38.03.02)' },
      { value: 'geology_bachelor', label: 'Геология (21.03.01)' }
    ];
  } else if (currentDirection.value.program_type === 'specialist') {
    return [
      { value: 'oil_tech_specialist', label: 'Нефтегазовые техника и технологии (21.05.06)' },
      { value: 'geology_tech_specialist', label: 'Технология геологической разведки (21.05.03)' }
    ];
  }
  
  // По умолчанию возвращаем пустой массив
  return [];
});

// Обработчик изменения типа программы
const handleProgramTypeChange = () => {
  const fieldsForCurrentType = availableFields.value.map(f => f.value);
  
  // Если текущее значение поля не входит в список доступных для нового типа программы,
  // устанавливаем первое доступное значение
  if (!fieldsForCurrentType.includes(currentDirection.value.field) && fieldsForCurrentType.length > 0) {
    currentDirection.value.field = fieldsForCurrentType[0];
  }
};

// Функции для работы с предметами
const isSubjectSelected = (subjectId) => {
  return selectedSubjectIds.value.includes(subjectId);
};

const getSubjectName = (subjectId) => {
  const subject = subjectsData.value.find(s => s.id === subjectId);
  return subject ? subject.name : 'Неизвестный предмет';
};

// Открытие модального окна для создания/редактирования
const openDirectionModal = async (direction = null) => {
  try {
    // Сбрасываем выбранные предметы и баллы
    selectedSubjectIds.value = [];
    subjectScores.value = {};
    
    if (direction) {
      // Режим редактирования
      isEditMode.value = true;
      currentDirection.value = { ...direction };
      tagsInput.value = direction.tags ? direction.tags.join(', ') : '';
      
      // Загружаем связанные предметы
      try {
        const { data: directionSubjects, error } = await subjects.getByDirectionId(direction.id);
        
        if (error) throw error;
        
        if (directionSubjects && directionSubjects.length > 0) {
          // Заполняем выбранные предметы и их баллы
          selectedSubjectIds.value = directionSubjects.map(ds => ds.subject_id);
          
          // Заполняем минимальные баллы
          directionSubjects.forEach(ds => {
            subjectScores.value[ds.subject_id] = ds.min_score;
          });
        }
      } catch (error) {
        console.error('Ошибка при загрузке предметов направления:', error);
        toast.error('Не удалось загрузить предметы для направления');
      }
    } else {
      // Режим создания
      isEditMode.value = false;
      currentDirection.value = { ...defaultDirection };
      // При создании нового направления устанавливаем поле по умолчанию
      if (currentDirection.value.program_type === 'bachelor' && availableFields.value.length > 0) {
        currentDirection.value.field = availableFields.value[0].value;
      } else if (currentDirection.value.program_type === 'specialist' && availableFields.value.length > 0) {
        currentDirection.value.field = availableFields.value[0].value;
      }
      tagsInput.value = '';
    }
    
    showDirectionModal.value = true;
  } catch (error) {
    console.error('Ошибка при открытии модального окна:', error);
    toast.error('Произошла ошибка при открытии формы направления');
  }
};

// Закрытие модального окна
const closeDirectionModal = () => {
  showDirectionModal.value = false;
  // Сбрасываем ошибки формы
  formErrors.value = {
    code: '',
    name: '',
    slug: ''
  };
  currentDirection.value = { ...defaultDirection };
  tagsInput.value = '';
  selectedSubjectIds.value = [];
  subjectScores.value = {};
};

// Функция валидации формы
const validateForm = () => {
  let isValid = true;
  
  // Сбрасываем ошибки
  formErrors.value = {
    code: '',
    name: '',
    slug: ''
  };
  
  if (!currentDirection.value.code?.trim()) {
    formErrors.value.code = 'Код направления обязателен';
    isValid = false;
  }
  
  if (!currentDirection.value.name?.trim()) {
    formErrors.value.name = 'Название обязательно';
    isValid = false;
  }
  
  if (!currentDirection.value.slug?.trim()) {
    formErrors.value.slug = 'URL-slug обязателен';
    isValid = false;
  }
  
  return isValid;
};

// Сохранение направления
const saveDirection = async (event) => {
  event.preventDefault();
  
  // Проверяем валидность формы
  if (!validateForm()) {
    toast.error('Пожалуйста, заполните все обязательные поля');
    return;
  }
  
  isSaving.value = true;
  
  try {
    // Преобразуем теги из строки в массив
    const tags = tagsInput.value.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag);
    
    // Формируем объект для сохранения
    const directionToSave = {
      ...currentDirection.value,
      tags,
      updated_at: new Date().toISOString()
    };
    
    let result;
    
    if (isEditMode.value) {
      result = await directions.update(directionToSave.id, directionToSave);
    } else {
      directionToSave.created_at = new Date().toISOString();
      result = await directions.create(directionToSave);
    }
    
    if (result.error) {
      throw result.error;
    }
    
    // Сохраняем связи с предметами
    const directionId = result.data.id;
    
    // Удаляем старые связи и создаем новые
    if (selectedSubjectIds.value.length > 0) {
      // Сначала удаляем существующие связи
      const { error: deleteError } = await subjects.deleteDirectionSubjects(directionId);
      
      if (deleteError) {
        console.error('Ошибка при удалении старых связей с предметами:', deleteError);
        toast.warning('Возникли проблемы при обновлении предметов');
      }
      
      // Создаем новые связи
      const subjectsToSave = selectedSubjectIds.value.map(subjectId => ({
        direction_id: directionId,
        subject_id: subjectId,
        min_score: subjectScores.value[subjectId] || 40
      }));
      
      const { error: saveSubjectsError } = await subjects.saveDirectionSubjects(subjectsToSave);
      
      if (saveSubjectsError) {
        console.error('Ошибка при сохранении связей с предметами:', saveSubjectsError);
        toast.warning('Возникли проблемы при сохранении предметов');
      }
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
  
  try {
    // Вызываем метод удаления из composable
    const success = await removeDirection(directionToDelete.value.id);
    
    if (success) {
      cancelDelete();
    }
  } catch (error) {
    console.error('Ошибка при удалении направления:', error);
    toast.error('Не удалось удалить направление');
  }
};

// Загрузка данных при монтировании компонента
onMounted(() => {
  fetchData();
});
</script> 