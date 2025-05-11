import { ref, reactive, computed } from 'vue';
import { directions, profiles, subjects } from '@/api/supabase';
import { useToast } from 'vue-toastification';

export default function useDirections() {
  const toast = useToast();

  // Состояние загрузки
  const isLoading = ref(false);
  const isSaving = ref(false);
  const isDeleting = ref(false);
  const isLoadingSubjects = ref(false);

  // Данные направлений, предметов и связей
  const directionsData = ref([]);
  const subjectsData = ref([]);
  const directionSubjectsMap = ref({});
  
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

  // Получение названия области обучения
  const getFieldName = (fieldId) => {
    const fields = {
      // Бакалавриат
      'oil_bachelor': 'Нефтегазовое дело (21.03.01)',
      'economics_bachelor': 'Экономика (38.03.01)',
      'management_bachelor': 'Менеджмент (38.03.02)',
      'geology_bachelor': 'Геология (21.03.01)',
      // Специалитет
      'oil_tech_specialist': 'Нефтегазовые техника и технологии (21.05.06)',
      'geology_tech_specialist': 'Технология геологической разведки (21.05.03)',
      // Старые значения для совместимости
      'oil': 'Нефтегазовое дело',
      'economics': 'Экономика',
      'management': 'Менеджмент',
      'geology': 'Геология'
    };
    
    return fields[fieldId] || fieldId;
  };

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

  // Загрузка предметов
  const fetchSubjects = async () => {
    isLoadingSubjects.value = true;
    
    try {
      const { data, error } = await subjects.getAll();
      
      if (error) throw error;
      
      subjectsData.value = data || [];
    } catch (error) {
      console.error('Ошибка при загрузке предметов:', error);
      toast.error('Не удалось загрузить список предметов');
    } finally {
      isLoadingSubjects.value = false;
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
      
      // Загружаем предметы
      await fetchSubjects();
      
      // Загружаем предметы для всех направлений
      const subjectsMap = {};
      for (const direction of directionsData.value) {
        const { data } = await subjects.getByDirectionId(direction.id);
        if (data) {
          subjectsMap[direction.id] = data;
        }
      }
      directionSubjectsMap.value = subjectsMap;
      
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
      toast.error('Не удалось загрузить данные направлений');
    } finally {
      isLoading.value = false;
    }
  };

  // Удаление направления
  const deleteDirection = async (directionId) => {
    if (!directionId) return;
    
    isDeleting.value = true;
    
    try {
      // Сначала удаляем связанные предметы
      await subjects.deleteDirectionSubjects(directionId);
      
      // Затем удаляем само направление
      const { error } = await directions.delete(directionId);
      
      if (error) throw error;
      
      toast.success('Направление успешно удалено');
      
      // Обновляем данные
      await fetchData();
      
      return true;
    } catch (error) {
      console.error('Ошибка при удалении направления:', error);
      toast.error('Не удалось удалить направление');
      return false;
    } finally {
      isDeleting.value = false;
    }
  };
  
  return {
    // Состояния
    isLoading,
    isSaving,
    isDeleting,
    isLoadingSubjects,
    
    // Данные
    directionsData,
    subjectsData,
    directionSubjectsMap,
    filters,
    filteredDirections,
    filteredFields,
    fieldMapping,
    
    // Методы
    fetchData,
    fetchSubjects,
    getFieldName,
    deleteDirection
  };
} 