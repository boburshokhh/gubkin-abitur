<template>
  <component :is="embedded ? 'div' : 'el-card'" :shadow="embedded ? undefined : 'never'">
    <div class="application-pagination" :class="{ 'application-pagination--embedded': embedded }">
      <el-text type="info">
        Показано {{ startItem }} - {{ endItem }} из {{ normalizedTotal }} {{ itemLabel }}
      </el-text>

      <el-pagination
        :current-page="normalizedCurrentPage"
        :page-size="normalizedPageSize"
        :page-sizes="pageSizeOptions"
        :total="normalizedTotal"
        :hide-on-single-page="false"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @update:current-page="emit('change-page', $event)"
        @update:page-size="emit('change-page-size', $event)"
      />
    </div>
  </component>
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
  },
  itemLabel: {
    type: String,
    default: 'заявок'
  },
  embedded: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['change-page', 'change-page-size']);

const normalizedTotal = computed(() => Number(props.totalItems) || 0);
const normalizedCurrentPage = computed(() => Number(props.currentPage) || 1);
const normalizedPageSize = computed(() => Number(props.pageSize) || 10);

const startItem = computed(() => (
  normalizedTotal.value === 0 ? 0 : (normalizedCurrentPage.value - 1) * normalizedPageSize.value + 1
));
const endItem = computed(() => Math.min(
  normalizedCurrentPage.value * normalizedPageSize.value,
  normalizedTotal.value
));
</script> 

<style scoped>
.application-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.application-pagination--embedded {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}

@media (max-width: 768px) {
  .application-pagination {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>