<template>
  <div class="contacts-editor">
    <div class="editor-header">
      <h3>Контакты и настройки сайта</h3>
      <el-button type="primary" :loading="isSaving" @click="saveAll">Сохранить все</el-button>
    </div>

    <el-skeleton v-if="isLoading" :rows="10" animated />

    <template v-else>
      <el-card shadow="never" class="settings-card settings-card--highlight">
        <template #header>
          <h4>Управление подачей документов</h4>
        </template>
        <el-form label-position="left" label-width="260px">
          <el-form-item
            v-for="setting in admissionSettings"
            :key="setting.id"
            :label="setting.label || setting.key"
          >
            <el-switch
              :model-value="setting.value === 'true'"
              active-text="Прием открыт"
              inactive-text="Прием закрыт"
              @change="(value) => setting.value = String(value)"
            />
          </el-form-item>
        </el-form>
        <el-alert
          type="info"
          :closable="false"
          show-icon
          title="Этот переключатель управляет кнопками подачи на сайте и backend-доступом к созданию/отправке заявлений."
        />
      </el-card>

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
            <el-input v-model="setting.value" />
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
const admissionSettings = computed(() => allSettings.value.filter(s => s.category === 'general' && s.key === 'admission_open'))
const generalSettings = computed(() => allSettings.value.filter(s => s.category === 'general' && s.key !== 'admission_open'))

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
  try {
    for (const setting of allSettings.value) {
      await adminUpdateSetting(setting.category, setting.key, setting.value, setting.label)
    }
    ElMessage.success('Настройки сохранены')
  } catch (err) {
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
.settings-card--highlight { border-color: var(--el-color-primary-light-5); }
.settings-card h4 { margin: 0; font-size: 14px; font-weight: 600; }
</style>
