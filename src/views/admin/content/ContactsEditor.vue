<template>
  <div class="contacts-editor">
    <div class="editor-header">
      <h3>Контакты и настройки сайта</h3>
      <el-button type="primary" :loading="isSaving" @click="saveAll">Сохранить все</el-button>
    </div>

    <el-skeleton v-if="isLoading" :rows="10" animated />

    <template v-else>
      <el-card shadow="never" class="settings-card">
        <template #header><h4>Контакты</h4></template>
        <el-form label-position="left" label-width="260px">
          <el-form-item
            v-for="setting in contactSettings"
            :key="setting.id"
            :label="setting.label || setting.key"
          >
            <el-input v-model="setting.value" />
          </el-form-item>
        </el-form>
      </el-card>

      <el-card shadow="never" class="settings-card">
        <template #header><h4>Социальные сети и ссылки</h4></template>
        <el-form label-position="left" label-width="260px">
          <el-form-item
            v-for="setting in socialSettings"
            :key="setting.id"
            :label="setting.label || setting.key"
          >
            <el-input v-model="setting.value" />
          </el-form-item>
        </el-form>
      </el-card>

      <el-card shadow="never" class="settings-card">
        <template #header><h4>Общие настройки</h4></template>
        <el-form label-position="left" label-width="260px">
          <el-form-item
            v-for="setting in generalSettings"
            :key="setting.id"
            :label="setting.label || setting.key"
          >
            <el-switch
              v-if="setting.key === 'admission_open'"
              :model-value="setting.value === 'true'"
              active-text="Открыт"
              inactive-text="Закрыт"
              @change="(v) => setting.value = String(v)"
            />
            <el-input v-else v-model="setting.value" />
          </el-form-item>
        </el-form>
      </el-card>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { adminGetSettings, adminUpdateSetting } from '@/api/cms.js'

const allSettings = ref([])
const isLoading = ref(false)
const isSaving = ref(false)

const contactSettings = computed(() => allSettings.value.filter(s => s.category === 'contact'))
const socialSettings = computed(() => allSettings.value.filter(s => s.category === 'social'))
const generalSettings = computed(() => allSettings.value.filter(s => s.category === 'general'))

async function fetchSettings() {
  isLoading.value = true
  try {
    allSettings.value = await adminGetSettings()
  } catch (err) {
    ElMessage.error('Ошибка загрузки: ' + err.message)
  } finally {
    isLoading.value = false
  }
}

async function saveAll() {
  isSaving.value = true
  let hasError = false
  try {
    for (const setting of allSettings.value) {
      await adminUpdateSetting(setting.category, setting.key, setting.value, setting.label)
    }
    ElMessage.success('Настройки сохранены')
  } catch (err) {
    hasError = true
    ElMessage.error('Ошибка сохранения: ' + err.message)
  } finally {
    isSaving.value = false
  }
}

onMounted(fetchSettings)
</script>

<style scoped>
.contacts-editor { padding: 4px 0; }
.editor-header {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;
}
.editor-header h3 { margin: 0; font-size: 16px; font-weight: 600; }
.settings-card { margin-bottom: 16px; border-radius: 10px; }
.settings-card h4 { margin: 0; font-size: 14px; font-weight: 600; }
</style>
