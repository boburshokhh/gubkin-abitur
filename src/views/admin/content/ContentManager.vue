<template>
  <div class="content-manager">
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="Главная страница" name="home">
        <HomePageEditor />
      </el-tab-pane>
      <el-tab-pane label="Admission 2025" name="admission">
        <AdmissionEditor />
      </el-tab-pane>
      <el-tab-pane label="Новости" name="news">
        <NewsManager />
      </el-tab-pane>
      <el-tab-pane label="Контакты и настройки" name="contacts">
        <ContactsEditor />
      </el-tab-pane>
      <el-tab-pane label="Медиатека" name="assets">
        <AssetsManager />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import HomePageEditor from './HomePageEditor.vue'
import AdmissionEditor from './AdmissionEditor.vue'
import NewsManager from './NewsManager.vue'
import ContactsEditor from './ContactsEditor.vue'
import AssetsManager from './AssetsManager.vue'

const activeTab = ref('home')
</script>

<style scoped>
.content-manager {
  margin-top: 8px;
}
</style>
