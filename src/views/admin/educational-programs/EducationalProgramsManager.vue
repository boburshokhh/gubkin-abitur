<template>
  <div>
    <el-tabs v-model="currentTab" class="educational-programs-manager__tabs">
      <el-tab-pane
        v-for="tab in tabs"
        :key="tab.id"
        :label="tab.name"
        :name="tab.id"
      />
    </el-tabs>

    <ProgramsManagement v-if="currentTab === 'directions'" />
    <ProfilesManagement v-else-if="currentTab === 'profiles'" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ProgramsManagement from './ProgramsManagement.vue';
import ProfilesManagement from './ProfilesManagement.vue';

const tabs = [
  { id: 'directions', name: 'Направления' },
  { id: 'profiles', name: 'Профили и специализации' }
];

const currentTab = ref('directions');
</script>

<style scoped>
.educational-programs-manager__tabs {
  margin-bottom: 24px;
}
</style>