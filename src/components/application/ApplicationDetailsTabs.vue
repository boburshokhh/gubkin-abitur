<template>
  <el-card shadow="never" class="application-details-tabs">
    <el-tabs :model-value="activeTab" @tab-change="$emit('change-tab', $event)">
      <el-tab-pane v-for="tab in tabs" :key="tab.id" :name="tab.id">
        <template #label>
          <el-space>
            <component :is="tab.icon" v-if="tab.icon" class="application-details-tabs__icon" />
            <span>{{ tab.title }}</span>
            <el-tag v-if="tab.count && tab.count > 0" size="small" type="info" effect="light">
              {{ tab.count }}
            </el-tag>
          </el-space>
        </template>
      </el-tab-pane>
    </el-tabs>

    <slot />
  </el-card>
</template>

<script setup>
defineProps({
  activeTab: {
    type: String,
    required: true
  },
  tabs: {
    type: Array,
    required: true
  }
});

defineEmits(['change-tab']);
</script>

<style scoped>
.application-details-tabs {
  margin-bottom: 32px;
}

.application-details-tabs__icon {
  width: 18px;
  height: 18px;
}

.application-details-tabs :deep(.el-tabs__header) {
  margin-bottom: 24px;
}
</style>