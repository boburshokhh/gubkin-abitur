<template>
  <el-card shadow="never">
    <div class="application-pagination">
      <el-text type="info">
        Показано {{ startItem }} - {{ endItem }} из {{ totalItems }} заявок
      </el-text>

      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :page-sizes="pageSizeOptions"
        :total="totalItems"
        layout="sizes, prev, pager, next"
        background
        @update:current-page="emit('change-page', $event)"
        @update:page-size="emit('change-page-size', $event)"
      />
    </div>
  </el-card>
</template>

<script setup>
import { computed } from 'vue';

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

// Вычисляемые свойства для пагинации
const startItem = computed(() => props.totalItems === 0 ? 0 : (props.currentPage - 1) * props.pageSize + 1);
const endItem = computed(() => Math.min(props.currentPage * props.pageSize, props.totalItems));
</script> 

<style scoped>
.application-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

@media (max-width: 768px) {
  .application-pagination {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>