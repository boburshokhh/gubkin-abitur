<template>
  <div class="content-manager">
    <div class="content-manager__header">
      <div>
        <h2>Контент сайта</h2>
        <el-text type="info">
          Единый раздел для редактирования страниц, новостей, контактов и медиатеки
        </el-text>
      </div>
    </div>

    <el-collapse v-model="activePanels" class="content-manager__sections">
      <el-collapse-item title="Главная страница" name="home">
        <HomePageEditor />
      </el-collapse-item>

      <el-collapse-item title="Приёмная кампания" name="admission">
        <AdmissionEditor />
      </el-collapse-item>

      <el-collapse-item title="Часто задаваемые вопросы" name="faq">
        <FaqEditor />
      </el-collapse-item>

      <el-collapse-item title="Новости" name="news">
        <NewsManager />
      </el-collapse-item>

      <el-collapse-item title="Контакты и настройки" name="contacts">
        <ContactsEditor />
      </el-collapse-item>

      <el-collapse-item title="Медиатека" name="assets">
        <AssetsManager />
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import HomePageEditor from './HomePageEditor.vue'
import AdmissionEditor from './AdmissionEditor.vue'
import FaqEditor from './FaqEditor.vue'
import NewsManager from './NewsManager.vue'
import ContactsEditor from './ContactsEditor.vue'
import AssetsManager from './AssetsManager.vue'

const activePanels = ref(['home'])
</script>

<style scoped>
.content-manager {
  margin-top: 8px;
}

.content-manager__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.content-manager__header h2 {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 700;
}

.content-manager__sections {
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  overflow: hidden;
  background: var(--el-bg-color);
}

.content-manager__sections :deep(.el-collapse-item__header) {
  padding: 0 18px;
  font-weight: 600;
  background: var(--el-fill-color-lighter);
}

.content-manager__sections :deep(.el-collapse-item__content) {
  padding: 18px;
}
</style>
