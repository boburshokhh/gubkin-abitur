<template>
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Фильтр по статусу -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Статус заявки</label>
          <select 
            v-model="statusFilter" 
            class="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3"
            @change="updateFilters"
          >
            <option :value="null">Все статусы</option>
            <option 
              v-for="status in statuses" 
              :key="status.id" 
              :value="status.id"
            >
              {{ status.name }}
            </option>
          </select>
        </div>
        
        <!-- Фильтр по направлению -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Направление</label>
          <select 
            v-model="directionFilter" 
            class="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3"
            @change="updateFilters"
          >
            <option :value="null">Все направления</option>
            <option 
              v-for="direction in directions" 
              :key="direction.id" 
              :value="direction.id"
            >
              {{ direction.name }}
            </option>
          </select>
        </div>
        
        <!-- Поиск по ФИО -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Поиск по ФИО</label>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Введите ФИО абитуриента" 
            class="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3"
            @input="updateFilters"
          />
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue';
  
  const props = defineProps({
    statuses: {
      type: Array,
      required: true
    },
    directions: {
      type: Array,
      required: true
    },
    initialFilters: {
      type: Object,
      default: () => ({
        statusId: null,
        directionId: null,
        searchQuery: ''
      })
    }
  });
  
  const emit = defineEmits(['update:filters']);
  
  // Локальное состояние фильтров
  const statusFilter = ref(props.initialFilters.statusId);
  const directionFilter = ref(props.initialFilters.directionId);
  const searchQuery = ref(props.initialFilters.searchQuery);
  
  // Отслеживаем изменения входных параметров
  watch(() => props.initialFilters, (newFilters) => {
    statusFilter.value = newFilters.statusId;
    directionFilter.value = newFilters.directionId;
    searchQuery.value = newFilters.searchQuery;
  }, { deep: true });
  
  // Обновление фильтров при изменении
  function updateFilters() {
    emit('update:filters', {
      statusId: statusFilter.value,
      directionId: directionFilter.value,
      searchQuery: searchQuery.value
    });
  }
  </script>