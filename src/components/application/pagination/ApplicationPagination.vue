<template>
  <div class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
    <div class="flex flex-1 justify-between sm:hidden">
      <button
        @click="$emit('change-page', currentPage - 1)"
        :disabled="currentPage === 1"
        :class="[
          currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50',
          'relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700'
        ]"
      >
        Предыдущая
      </button>
      <button
        @click="$emit('change-page', currentPage + 1)"
        :disabled="currentPage === totalPages"
        :class="[
          currentPage === totalPages ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50',
          'relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700'
        ]"
      >
        Следующая
      </button>
    </div>
    <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
      <div>
        <p class="text-sm text-gray-700">
          Показано <span class="font-medium">{{ startItem }}</span> - 
          <span class="font-medium">{{ endItem }}</span> из 
          <span class="font-medium">{{ totalItems }}</span> заявок
        </p>
      </div>
      <div>
        <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
          <button
            @click="$emit('change-page', currentPage - 1)"
            :disabled="currentPage === 1"
            :class="[
              currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50',
              'relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300'
            ]"
          >
            <span class="sr-only">Предыдущая</span>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
            </svg>
          </button>
          
          <!-- Первая страница -->
          <button
            v-if="showFirstPage"
            @click="$emit('change-page', 1)"
            :class="[
              currentPage === 1 ? 'bg-primary-50 text-primary-600' : 'text-gray-900 hover:bg-gray-50',
              'relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300'
            ]"
          >
            1
          </button>
          
          <!-- Многоточие в начале -->
          <span
            v-if="showLeftEllipsis"
            class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300"
          >
            ...
          </span>
          
          <!-- Средние страницы -->
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="$emit('change-page', page)"
            :class="[
              currentPage === page ? 'bg-primary-50 text-primary-600' : 'text-gray-900 hover:bg-gray-50',
              'relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300'
            ]"
          >
            {{ page }}
          </button>
          
          <!-- Многоточие в конце -->
          <span
            v-if="showRightEllipsis"
            class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300"
          >
            ...
          </span>
          
          <!-- Последняя страница -->
          <button
            v-if="showLastPage && totalPages > 1"
            @click="$emit('change-page', totalPages)"
            :class="[
              currentPage === totalPages ? 'bg-primary-50 text-primary-600' : 'text-gray-900 hover:bg-gray-50',
              'relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300'
            ]"
          >
            {{ totalPages }}
          </button>
          
          <button
            @click="$emit('change-page', currentPage + 1)"
            :disabled="currentPage === totalPages"
            :class="[
              currentPage === totalPages ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50',
              'relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300'
            ]"
          >
            <span class="sr-only">Следующая</span>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
            </svg>
          </button>
        </nav>
      </div>
    </div>
    
    <div class="mt-4 sm:mt-0 sm:ml-4">
      <label for="pageSize" class="sr-only">Записей на странице</label>
      <select
        id="pageSize"
        v-model="selectedPageSize"
        @change="$emit('change-page-size', selectedPageSize)"
        class="rounded-md border border-gray-300 py-1 pl-2 pr-8 text-sm"
      >
        <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }} на странице</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  pageSize: {
    type: Number,
    required: true
  },
  totalItems: {
    type: Number,
    required: true
  },
  pageSizeOptions: {
    type: Array,
    default: () => [10, 20, 50, 100]
  }
});

const emit = defineEmits(['change-page', 'change-page-size']);

const selectedPageSize = ref(props.pageSize);

// Отслеживаем изменение размера страницы из родительского компонента
watch(() => props.pageSize, (newSize) => {
  selectedPageSize.value = newSize;
});

// Вычисляемые свойства для пагинации
const totalPages = computed(() => Math.max(1, Math.ceil(props.totalItems / props.pageSize)));
const startItem = computed(() => props.totalItems === 0 ? 0 : (props.currentPage - 1) * props.pageSize + 1);
const endItem = computed(() => Math.min(props.currentPage * props.pageSize, props.totalItems));

// Логика отображения страниц
const maxVisiblePages = 5; // Максимальное количество отображаемых страниц (без учета первой и последней)

const visiblePages = computed(() => {
  if (totalPages.value <= maxVisiblePages) {
    // Если общее количество страниц меньше или равно максимальному отображаемому, показываем все страницы
    return Array.from({ length: totalPages.value }, (_, i) => i + 1);
  }
  
  // Определяем диапазон отображаемых страниц
  let startPage = Math.max(2, props.currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages.value - 1, startPage + maxVisiblePages - 1);
  
  // Если достигли конца, сдвигаем начало
  if (endPage === totalPages.value - 1) {
    startPage = Math.max(2, endPage - maxVisiblePages + 1);
  }
  
  // Если в начале, расширяем конец
  if (startPage === 2) {
    endPage = Math.min(totalPages.value - 1, startPage + maxVisiblePages - 1);
  }
  
  return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
});

// Флаги для отображения элементов пагинации
const showFirstPage = computed(() => totalPages.value > maxVisiblePages);
const showLastPage = computed(() => totalPages.value > maxVisiblePages);
const showLeftEllipsis = computed(() => visiblePages.value[0] > 2);
const showRightEllipsis = computed(() => visiblePages.value[visiblePages.value.length - 1] < totalPages.value - 1);
</script> 