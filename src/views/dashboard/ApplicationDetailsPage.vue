<template>
  <main class="application-details-page">
    <el-card shadow="never" class="application-details-page__header-card">
      <div class="application-details-page__header">
        <div>
          <el-text tag="h1" class="application-details-page__title">
            Заявление №{{ shortApplicationId }}
          </el-text>
          <el-text type="info" class="application-details-page__subtitle">
            Подробная информация, документы, история изменений и комментарии приемной комиссии.
          </el-text>
        </div>
        <el-button @click="router.push('/dashboard/applications')">Вернуться к списку</el-button>
      </div>
    </el-card>

    <DashboardNavigation />

    <el-card v-if="isLoading" shadow="never" class="application-details-page__state-card">
      <el-skeleton :rows="8" animated />
    </el-card>

    <el-alert
      v-else-if="error"
      title="Ошибка при загрузке данных"
      :description="error"
      type="error"
      show-icon
      class="application-details-page__alert"
    />

    <template v-else-if="application">
      <el-alert
        v-if="latestComment"
        :title="`Комментарий приемной комиссии от ${formatDate(latestComment.created_at)}`"
        :description="latestComment.comment"
        type="warning"
        show-icon
        class="application-details-page__alert"
      >
        <template #default>
          <el-button class="mt-3" size="small" type="warning" @click="activeTab = 'comments'">
            Все комментарии
          </el-button>
        </template>
      </el-alert>

      <el-card shadow="never" class="application-details-page__summary-card">
        <div class="application-details-page__summary">
          <div>
            <el-text tag="h2" class="application-details-page__summary-title">
              {{ applicantFullName }}
            </el-text>
            <el-text type="info" class="application-details-page__summary-subtitle">
              {{ applicant.email || 'Email не указан' }}
            </el-text>
          </div>
          <el-tag :type="statusTagType" effect="light" size="large">{{ statusText }}</el-tag>
        </div>

        <el-descriptions :column="3" border class="application-details-page__summary-descriptions">
          <el-descriptions-item label="Дата подачи">{{ formatDate(application.created_at) }}</el-descriptions-item>
          <el-descriptions-item label="Обновлено">{{ formatDate(application.updated_at) }}</el-descriptions-item>
          <el-descriptions-item label="Учебный год">{{ application.academic_year || new Date().getFullYear() }}</el-descriptions-item>
          <el-descriptions-item label="Выбрано профилей">{{ choices.length }}</el-descriptions-item>
          <el-descriptions-item label="Документы">{{ normalizedDocuments.length }}</el-descriptions-item>
          <el-descriptions-item label="Комментарии">{{ sortedComments.length }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card shadow="never">
        <el-tabs v-model="activeTab" class="application-details-page__tabs">
          <el-tab-pane label="Личные данные" name="personal">
            <section class="application-details-page__section">
              <el-text tag="h3" class="application-details-page__section-title">Контакты и паспорт</el-text>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="Фамилия">{{ applicant.last_name || 'Не указана' }}</el-descriptions-item>
                <el-descriptions-item label="Имя">{{ applicant.first_name || 'Не указано' }}</el-descriptions-item>
                <el-descriptions-item label="Отчество">{{ applicant.middle_name || 'Не указано' }}</el-descriptions-item>
                <el-descriptions-item label="Дата рождения">{{ formatDate(applicant.birth_date) }}</el-descriptions-item>
                <el-descriptions-item label="Пол">{{ getGenderText(applicant.gender) }}</el-descriptions-item>
                <el-descriptions-item label="Регион">{{ regionName }}</el-descriptions-item>
                <el-descriptions-item label="Адрес">{{ application.address || 'Не указан' }}</el-descriptions-item>
                <el-descriptions-item label="Телефон">{{ applicant.phone || 'Не указан' }}</el-descriptions-item>
                <el-descriptions-item label="Телефон родителя">{{ application.parent_phone || 'Не указан' }}</el-descriptions-item>
                <el-descriptions-item label="Email">{{ applicant.email || 'Не указан' }}</el-descriptions-item>
                <el-descriptions-item label="Паспорт">{{ application.passport_series || 'Не указан' }}</el-descriptions-item>
                <el-descriptions-item label="Дата выдачи паспорта">{{ formatDate(application.passport_issue_date) }}</el-descriptions-item>
                <el-descriptions-item label="Кем выдан" :span="2">
                  {{ application.passport_issued_by || 'Не указан' }}
                </el-descriptions-item>
              </el-descriptions>
            </section>

            <section class="application-details-page__section">
              <el-text tag="h3" class="application-details-page__section-title">Образование</el-text>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="Уровень">{{ getEducationLevelText(application.education_level) }}</el-descriptions-item>
                <el-descriptions-item label="Учебное заведение">{{ application.education_institution || 'Не указано' }}</el-descriptions-item>
                <el-descriptions-item label="Год окончания">{{ application.education_graduation_year || 'Не указан' }}</el-descriptions-item>
                <el-descriptions-item label="Номер документа">
                  {{ application.education_document_number || application.document_number || 'Не указан' }}
                </el-descriptions-item>
                <el-descriptions-item label="Дата документа">{{ formatDate(application.education_document_date || application.document_date) }}</el-descriptions-item>
              </el-descriptions>
            </section>
          </el-tab-pane>

          <el-tab-pane label="Заявление" name="details">
            <section class="application-details-page__section">
              <el-text tag="h3" class="application-details-page__section-title">Параметры заявления</el-text>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="Статус">
                  <el-tag :type="statusTagType" effect="light">{{ statusText }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="Форма обучения">{{ getStudyFormText(application.study_form) }}</el-descriptions-item>
                <el-descriptions-item label="Финансирование">{{ getFundingFormText(application.funding_form) }}</el-descriptions-item>
                <el-descriptions-item label="Общежитие">{{ application.accommodation_needed ? 'Да' : 'Нет' }}</el-descriptions-item>
                <el-descriptions-item label="Олимпиада">{{ application.olympiad_participant ? 'Да' : 'Нет' }}</el-descriptions-item>
                <el-descriptions-item label="Комментарий администратора">{{ application.admin_comment || 'Нет' }}</el-descriptions-item>
              </el-descriptions>
            </section>

            <section class="application-details-page__section">
              <div class="application-details-page__section-header">
                <el-text tag="h3" class="application-details-page__section-title">Выбранные профили</el-text>
                <el-tag effect="light">{{ choices.length }}</el-tag>
              </div>
              <div v-if="choices.length" class="application-details-page__choice-grid">
                <el-card v-for="choice in sortedChoices" :key="choice.id || choice.priority" shadow="never">
                  <el-tag type="primary" effect="light">Приоритет {{ choice.priority }}</el-tag>
                  <h4 class="application-details-page__choice-title">{{ getChoiceProfile(choice).name || 'Профиль не указан' }}</h4>
                  <p class="application-details-page__choice-meta">
                    {{ getChoiceDirection(choice).name || 'Направление не указано' }}
                    <span v-if="getChoiceDirection(choice).code">({{ getChoiceDirection(choice).code }})</span>
                  </p>
                </el-card>
              </div>
              <el-empty v-else description="Профили не выбраны" />
            </section>

            <div class="application-details-page__actions">
              <el-button
                v-if="[1, 'draft'].includes(application.status_id)"
                type="primary"
                :loading="isSubmitting"
                @click="submitApplication"
              >
                Отправить на рассмотрение
              </el-button>
              <el-button @click="router.push('/dashboard/applications')">Вернуться к списку</el-button>
            </div>
          </el-tab-pane>

          <el-tab-pane name="documents">
            <template #label>
              <span>Документы <el-tag v-if="normalizedDocuments.length" size="small" effect="plain">{{ normalizedDocuments.length }}</el-tag></span>
            </template>
            <template v-if="normalizedDocuments.length">
              <div class="application-details-page__documents-toolbar">
                <el-button
                  type="primary"
                  plain
                  :loading="isDownloadingArchive"
                  @click="downloadAllDocumentsAsZip"
                >
                  Скачать все ZIP
                </el-button>
              </div>
              <div class="application-details-page__document-list">
                <el-card v-for="document in normalizedDocuments" :key="document.key" shadow="never">
                  <div class="application-details-page__document-row">
                    <div class="application-details-page__document-info">
                      <el-icon size="30"><Document /></el-icon>
                      <div>
                        <h4 class="application-details-page__document-title">{{ document.title }}</h4>
                        <p class="application-details-page__document-meta">
                          {{ document.fileName }}
                          <el-tag size="small" effect="plain">{{ getFileExtension(document.fileName) || 'FILE' }}</el-tag>
                          <span>{{ formatFileSize(document.fileSize) }}</span>
                        </p>
                      </div>
                    </div>
                    <el-space>
                      <el-button size="small" @click="openFile(document.url)">Просмотреть</el-button>
                      <el-button
                        size="small"
                        type="primary"
                        plain
                        :loading="downloadingFileKey === document.key"
                        @click="downloadDocumentFile(document)"
                      >
                        Скачать
                      </el-button>
                    </el-space>
                  </div>
                </el-card>
              </div>
            </template>
            <el-empty v-else description="Нет загруженных документов" />
          </el-tab-pane>

          <el-tab-pane label="История" name="history">
            <el-skeleton v-if="isHistoryLoading" :rows="4" animated />
            <el-timeline v-else-if="sortedHistory.length">
              <el-timeline-item
                v-for="historyItem in sortedHistory"
                :key="historyItem.id"
                :timestamp="formatDate(historyItem.created_at)"
                :type="getTimelineType(historyItem.status_id)"
              >
                <strong>{{ getHistoryStatusText(historyItem) }}</strong>
                <p v-if="historyItem.comment" class="application-details-page__timeline-comment">
                  {{ historyItem.comment }}
                </p>
              </el-timeline-item>
            </el-timeline>
            <el-empty v-else description="История изменений пуста" />
          </el-tab-pane>

          <el-tab-pane name="comments">
            <template #label>
              <span>Комментарии <el-tag v-if="sortedComments.length" size="small" type="warning" effect="plain">{{ sortedComments.length }}</el-tag></span>
            </template>
            <el-timeline v-if="sortedComments.length">
              <el-timeline-item
                v-for="comment in sortedComments"
                :key="comment.id"
                :timestamp="formatDate(comment.created_at)"
                type="warning"
              >
                <el-card shadow="never">
                  <p>{{ comment.comment }}</p>
                  <el-text v-if="comment.created_by_user" type="info" size="small">
                    {{ getCommentAuthor(comment) }}
                  </el-text>
                </el-card>
              </el-timeline-item>
            </el-timeline>
            <el-empty v-else description="Комментариев нет" />
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </template>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Document } from '@element-plus/icons-vue'
import { appApi, applicationFiles, documents, olympiadCertificates } from '@/api/app-api'
import { useApplicationStore } from '@/stores/application'
import { subscribeApplicationUpdates } from '@/services/application-realtime'
import DashboardNavigation from '@/components/dashboard/DashboardNavigation.vue'
import {
  createZipBlob,
  downloadBlob,
  getApplicantFilePrefix,
  getApplicationFileLabel,
  getArchiveFileName,
  getDocumentFileLabel,
  getDownloadFileName,
  getOlympiadCertificateLabel,
  getUniqueFileName
} from '@/utils/application-downloads'

const route = useRoute()
const router = useRouter()
const appStore = useApplicationStore()

const isLoading = ref(true)
const error = ref('')
const isSubmitting = ref(false)
const isDownloadingArchive = ref(false)
const downloadingFileKey = ref('')
const activeTab = ref('personal')
const applicationHistory = ref([])
const isHistoryLoading = ref(false)
let unsubscribeApplicationUpdates = null

const application = computed(() => appStore.currentApplication)

const applicant = computed(() => application.value?.user || application.value?.users || {})
const choices = computed(() => application.value?.choices || application.value?.application_choices || [])
const sortedChoices = computed(() => [...choices.value].sort((a, b) => (a.priority || 0) - (b.priority || 0)))
const sortedHistory = computed(() => [...applicationHistory.value].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
const sortedComments = computed(() => sortedHistory.value.filter(item => item.comment?.trim()))
const latestComment = computed(() => sortedComments.value[0] || null)

const shortApplicationId = computed(() => application.value?.id?.slice(-8) || route.params.id?.slice?.(-8) || 'N/A')
const applicantFullName = computed(() => {
  const parts = [applicant.value.last_name, applicant.value.first_name, applicant.value.middle_name].filter(Boolean)
  return parts.length ? parts.join(' ') : 'Абитуриент'
})
const applicantFilePrefix = computed(() => getApplicantFilePrefix({
  application: application.value,
  applicant: applicant.value
}))
const statusId = computed(() => application.value?.status?.id || application.value?.status_id)
const statusText = computed(() => application.value?.status?.name || getStatusText(statusId.value))
const statusTagType = computed(() => getStatusTagType(statusId.value))
const regionName = computed(() => application.value?.region?.name || application.value?.regions?.name || applicant.value?.region?.name || applicant.value?.regions?.name || 'Не указан')

const normalizedDocuments = computed(() => {
  const app = application.value
  if (!app) return []

  const documents = (app.documents || []).map(document => ({
    key: `document-${document.id}`,
    id: document.id,
    source: 'document',
    title: document.document_type?.name || document.document_types?.name || 'Документ',
    label: getDocumentFileLabel(document),
    fileName: document.file_name || getFileNameFromPath(document.file_path),
    fileSize: document.file_size,
    url: getStorageUrl('application_documents', document.file_path),
    file: document
  }))

  const applicationFileRows = (app.application_files || []).map(file => ({
    key: `application-file-${file.id}`,
    id: file.id,
    source: 'application-file',
    title: getFileDisplayName(file),
    label: getApplicationFileLabel(file),
    fileName: file.file_name || getFileNameFromPath(file.file_path),
    fileSize: file.file_size,
    url: getStorageUrl('application_files', file.file_path),
    file
  }))

  const olympiadCertificates = (app.olympiad_certificates || []).map(certificate => ({
    key: `olympiad-${certificate.id}`,
    id: certificate.id,
    source: 'olympiad-certificate',
    title: certificate.name || 'Сертификат олимпиады',
    label: getOlympiadCertificateLabel(certificate),
    fileName: certificate.file_name || getFileNameFromPath(certificate.file_path),
    fileSize: certificate.file_size,
    url: getStorageUrl('application_files', certificate.file_path),
    file: certificate
  }))

  return [...documents, ...applicationFileRows, ...olympiadCertificates]
})

onMounted(async () => {
  const applicationId = route.params.id
  if (!applicationId) {
    router.push('/dashboard/applications')
    return
  }

  isLoading.value = true
  try {
    const success = await appStore.loadApplication(applicationId)
    if (!success) {
      error.value = appStore.error || 'Не удалось загрузить данные заявления'
      return
    }

    loadApplicationHistory()
    unsubscribeApplicationUpdates = subscribeApplicationUpdates(handleRealtimeApplicationUpdate)
  } catch (err) {
    console.error('Ошибка при загрузке заявления:', err)
    error.value = err.message || 'Произошла ошибка при загрузке заявления'
  } finally {
    isLoading.value = false
  }
})

onBeforeUnmount(() => {
  unsubscribeApplicationUpdates?.()
})

async function handleRealtimeApplicationUpdate(event) {
  const applicationId = route.params.id
  if (String(event.applicationId) !== String(applicationId)) return

  const success = await appStore.loadApplication(applicationId)
  if (success) loadApplicationHistory()
}

function loadApplicationHistory() {
  isHistoryLoading.value = true
  try {
    if (application.value?.application_history?.length) {
      applicationHistory.value = application.value.application_history
      return
    }

    if (application.value) {
      applicationHistory.value = [{
        id: 'initial',
        status_id: application.value.status_id,
        created_at: application.value.created_at,
        application_id: application.value.id,
        comment: 'Заявление создано'
      }]
    }
  } finally {
    isHistoryLoading.value = false
  }
}

async function submitApplication() {
  if (!application.value || ![1, 'draft'].includes(application.value.status_id)) return

  isSubmitting.value = true
  error.value = ''
  try {
    const result = await appStore.submitApplication(application.value.id)
    if (!result.success) throw new Error(result.error || 'Не удалось отправить заявление')

    await appStore.loadApplication(application.value.id)
    loadApplicationHistory()
    ElMessage.success('Заявление отправлено на рассмотрение')
  } catch (err) {
    console.error('Ошибка при отправке заявления:', err)
    error.value = err.message
  } finally {
    isSubmitting.value = false
  }
}

function getChoiceProfile(choice) {
  return choice.profile || choice.profiles || {}
}

function getChoiceDirection(choice) {
  const profile = getChoiceProfile(choice)
  return profile.direction || profile.directions || {}
}

function getStorageUrl(bucket, filePath) {
  if (!filePath) return '#'

  try {
    const { data } = appApi.storage.from(bucket).getPublicUrl(filePath)
    return data?.publicUrl || '#'
  } catch (err) {
    console.error('Ошибка получения URL файла:', err)
    return '#'
  }
}

function openFile(url) {
  if (!url || url === '#') return
  window.open(url, '_blank')
}

async function getDocumentBlob(document) {
  if (document.id) {
    const downloaders = {
      document: () => documents.downloadBlob(document.id),
      'application-file': () => applicationFiles.downloadBlob(document.id),
      'olympiad-certificate': () => olympiadCertificates.downloadBlob(document.id)
    }
    const download = downloaders[document.source]
    if (!download) throw new Error('Неизвестный тип файла')

    const { data, error } = await download()
    if (error) throw error
    if (!(data instanceof Blob)) throw new Error('Файл не получен')

    return data
  }

  if (!document.url || document.url === '#') throw new Error('Ссылка на файл недоступна')

  const response = await fetch(document.url)
  if (!response.ok) throw new Error('Не удалось скачать файл')

  return response.blob()
}

async function downloadDocumentFile(document) {
  downloadingFileKey.value = document.key

  try {
    const blob = await getDocumentBlob(document)
    const fileName = getDownloadFileName({
      prefix: applicantFilePrefix.value,
      label: document.label || document.title,
      originalFileName: document.fileName
    })

    downloadBlob(blob, fileName)
  } catch (err) {
    console.error('Ошибка скачивания файла:', err)
    ElMessage.error('Не удалось скачать файл. Попробуйте обновить заявку и скачать файл снова.')
  } finally {
    downloadingFileKey.value = ''
  }
}

async function downloadAllDocumentsAsZip() {
  if (!normalizedDocuments.value.length) {
    ElMessage.warning('В заявке нет файлов для скачивания.')
    return
  }

  isDownloadingArchive.value = true

  try {
    const usedNames = new Set()
    const files = []

    for (const document of normalizedDocuments.value) {
      const blob = await getDocumentBlob(document)
      const fileName = getUniqueFileName(getDownloadFileName({
        prefix: applicantFilePrefix.value,
        label: document.label || document.title,
        originalFileName: document.fileName
      }), usedNames)

      files.push({ fileName, blob })
    }

    const zipBlob = await createZipBlob(files)
    downloadBlob(zipBlob, getArchiveFileName({
      application: application.value,
      applicant: applicant.value
    }))
    ElMessage.success('Архив документов готов к скачиванию.')
  } catch (err) {
    console.error('Ошибка скачивания архива документов:', err)
    ElMessage.error('Не удалось скачать архив. Проверьте доступность файлов и попробуйте снова.')
  } finally {
    isDownloadingArchive.value = false
  }
}

function formatDate(dateString) {
  if (!dateString) return 'Не указана'
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatFileSize(bytes) {
  if (!bytes) return '0 Байт'
  const k = 1024
  const sizes = ['Байт', 'КБ', 'МБ', 'ГБ']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

function getStatusText(id) {
  const statuses = {
    1: 'Черновик',
    2: 'На рассмотрении',
    3: 'Одобрено',
    4: 'Отклонено',
    draft: 'Черновик',
    submitted: 'На рассмотрении',
    approved: 'Одобрено',
    rejected: 'Отклонено',
    additional_info: 'Требует доработки'
  }
  return statuses[id] || 'Неизвестный статус'
}

function getStatusTagType(id) {
  const types = {
    1: 'info',
    2: 'warning',
    3: 'success',
    4: 'danger',
    draft: 'info',
    submitted: 'warning',
    approved: 'success',
    rejected: 'danger',
    additional_info: 'warning'
  }
  return types[id] || 'info'
}

function getTimelineType(id) {
  const types = {
    1: 'info',
    2: 'primary',
    3: 'success',
    4: 'danger',
    draft: 'info',
    submitted: 'primary',
    approved: 'success',
    rejected: 'danger'
  }
  return types[id] || 'info'
}

function getHistoryStatusText(historyItem) {
  return historyItem.status?.name || historyItem.status_name || historyItem.new_status?.name || getStatusText(historyItem.status_id)
}

function getStudyFormText(form) {
  const forms = {
    'full-time': 'Очная',
    'part-time': 'Заочная',
    distance: 'Дистанционная'
  }
  return forms[form] || 'Не указана'
}

function getFundingFormText(form) {
  const forms = {
    budget: 'Бюджет',
    contract: 'Контракт'
  }
  return forms[form] || 'Не указан'
}

function getGenderText(gender) {
  const genders = {
    male: 'Мужской',
    female: 'Женский'
  }
  return genders[gender] || 'Не указан'
}

function getEducationLevelText(level) {
  const levels = {
    'high-school': 'Среднее общее',
    college: 'Среднее профессиональное',
    vocational: 'Среднее профессиональное',
    bachelor: 'Высшее - бакалавриат',
    master: 'Высшее - магистратура',
    specialist: 'Высшее - специалитет'
  }
  return levels[level] || 'Не указан'
}

function getFileDisplayName(file) {
  const names = {
    photo: 'Фотография 3x4',
    education_scan: 'Документ об образовании',
    passport_scan: 'Паспорт',
    passport_translation: 'Нотариально заверенный перевод паспорта'
  }
  return names[file.file_category] || file.file_name || 'Файл'
}

function getFileNameFromPath(filePath) {
  if (!filePath) return ''
  return filePath.split('/').pop() || filePath
}

function getFileExtension(filename) {
  if (!filename) return ''
  const lastDotIndex = filename.lastIndexOf('.')
  return lastDotIndex !== -1 ? filename.substring(lastDotIndex + 1).toUpperCase() : ''
}

function getCommentAuthor(comment) {
  const user = comment.created_by_user
  if (!user) return ''
  return [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || ''
}
</script>

<style scoped>
.application-details-page {
  max-width: 1180px;
  margin: 0 auto;
  padding: 24px 16px;
}

.application-details-page__header-card,
.application-details-page__state-card,
.application-details-page__alert,
.application-details-page__summary-card {
  margin-bottom: 24px;
}

.application-details-page__header,
.application-details-page__summary,
.application-details-page__section-header,
.application-details-page__document-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.application-details-page__title {
  display: block;
  margin: 0 0 8px;
  color: var(--el-text-color-primary);
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}

.application-details-page__subtitle,
.application-details-page__summary-subtitle {
  display: block;
}

.application-details-page__summary-title {
  display: block;
  margin: 0 0 6px;
  color: var(--el-text-color-primary);
  font-size: 22px;
  font-weight: 700;
}

.application-details-page__summary-descriptions {
  margin-top: 18px;
}

.application-details-page__section {
  margin-bottom: 28px;
}

.application-details-page__section:last-child {
  margin-bottom: 0;
}

.application-details-page__section-title {
  display: block;
  margin: 0 0 14px;
  color: var(--el-text-color-primary);
  font-size: 18px;
  font-weight: 650;
}

.application-details-page__choice-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.application-details-page__choice-title {
  margin: 12px 0 6px;
  color: var(--el-text-color-primary);
  font-size: 16px;
  font-weight: 650;
}

.application-details-page__choice-meta,
.application-details-page__document-meta,
.application-details-page__timeline-comment {
  margin: 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.application-details-page__document-list {
  display: grid;
  gap: 12px;
}

.application-details-page__documents-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.application-details-page__document-info {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
}

.application-details-page__document-title {
  margin: 0 0 4px;
  color: var(--el-text-color-primary);
  font-size: 15px;
  font-weight: 650;
}

.application-details-page__document-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.application-details-page__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 900px) {
  .application-details-page__choice-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .application-details-page {
    padding: 16px 12px;
  }

  .application-details-page__header,
  .application-details-page__summary,
  .application-details-page__section-header,
  .application-details-page__document-row {
    flex-direction: column;
  }

  .application-details-page__title {
    font-size: 24px;
  }

  .application-details-page__actions,
  .application-details-page__actions .el-button,
  .application-details-page__document-row .el-space {
    width: 100%;
  }
}
</style>
