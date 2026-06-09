<template>
  <el-form label-position="top">
    <el-form-item label="Заголовок (kicker)">
      <el-input v-model="local.kicker" />
    </el-form-item>

    <el-form-item label="Основной заголовок">
      <el-input v-model="local.title" />
    </el-form-item>

    <el-form-item label="Подзаголовок / место проведения">
      <el-input v-model="local.subtitle" type="textarea" :rows="2" />
    </el-form-item>

    <el-divider>Экзамены</el-divider>
    <el-collapse>
      <el-collapse-item v-for="(exam, idx) in local.exams" :key="idx" :name="idx">
        <template #title>
          <div class="title-row">
            <span>{{ exam.subject || `Экзамен ${idx + 1}` }}</span>
            <div class="row-actions">
              <el-button size="small" text :disabled="idx === 0" @click.stop="moveItem(local.exams, idx, -1)">↑</el-button>
              <el-button size="small" text :disabled="idx === local.exams.length - 1" @click.stop="moveItem(local.exams, idx, 1)">↓</el-button>
              <el-button type="danger" size="small" text @click.stop="removeExam(idx)">Удалить</el-button>
            </div>
          </div>
        </template>

        <el-row :gutter="12">
          <el-col :span="10">
            <el-form-item label="Предмет">
              <el-input v-model="exam.subject" />
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="Дата">
              <el-input v-model="exam.date" placeholder="03 июля" />
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="Время">
              <el-input v-model="exam.time" placeholder="09:00" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="12">
          <el-col :span="8">
            <el-form-item label="Формат">
              <el-input v-model="exam.format" placeholder="Письменно" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Продолжительность">
              <el-input v-model="exam.duration" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Тип уведомления">
              <el-select v-model="exam.type">
                <el-option value="primary" label="Основной" />
                <el-option value="info" label="Информация" />
                <el-option value="success" label="Успех" />
                <el-option value="warning" label="Предупреждение" />
                <el-option value="error" label="Ошибка" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="Для кого">
          <el-input v-model="exam.scope" />
        </el-form-item>

        <el-form-item label="Описание">
          <el-input v-model="exam.description" type="textarea" :rows="2" />
        </el-form-item>

        <el-divider content-position="left">Детали экзамена</el-divider>
        <div v-for="(detail, detailIdx) in exam.details" :key="detailIdx" class="subitem-block">
          <el-row :gutter="12">
            <el-col :span="8">
              <el-form-item label="Подпись">
                <el-input v-model="detail.label" placeholder="Апелляция" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Значение">
                <el-input v-model="detail.value" placeholder="04-05 июля, 13:00-15:00" />
              </el-form-item>
            </el-col>
            <el-col :span="4" class="remove-col">
              <el-button size="small" text :disabled="detailIdx === 0" @click="moveItem(exam.details, detailIdx, -1)">↑</el-button>
              <el-button size="small" text :disabled="detailIdx === exam.details.length - 1" @click="moveItem(exam.details, detailIdx, 1)">↓</el-button>
              <el-button type="danger" size="small" text @click="removeDetail(exam, detailIdx)">✕</el-button>
            </el-col>
          </el-row>
        </div>
        <el-button type="primary" plain size="small" @click="addDetail(exam)">+ Добавить деталь</el-button>

        <el-divider content-position="left">Предупреждение</el-divider>
        <el-form-item label="Показывать предупреждение">
          <el-switch
            :model-value="Boolean(exam.warning)"
            active-text="Да"
            inactive-text="Нет"
            @update:model-value="toggleWarning(exam, $event)"
          />
        </el-form-item>
        <el-form-item v-if="exam.warning !== null" label="Текст предупреждения">
          <el-input v-model="exam.warning" type="textarea" :rows="2" />
        </el-form-item>
      </el-collapse-item>
    </el-collapse>
    <el-button type="primary" plain size="small" class="section-action" @click="addExam">
      + Добавить экзамен
    </el-button>

    <el-divider>Правила проведения экзаменов</el-divider>
    <el-form-item label="Показывать блок правил">
      <el-switch
        v-model="local.rules.show_rules"
        active-text="Показывать"
        inactive-text="Скрыть"
      />
    </el-form-item>

    <el-form-item label="Заголовок блока правил">
      <el-input v-model="local.rules.title" />
    </el-form-item>

    <el-row :gutter="12">
      <el-col :span="12">
        <el-form-item label="Заголовок: допуск">
          <el-input v-model="local.rules.admission_title" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="Заголовок: запреты">
          <el-input v-model="local.rules.forbidden_title" />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="12">
      <el-col :span="12">
        <el-form-item label="Подпись документов">
          <el-input v-model="local.rules.admission_docs_label" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="Документы для допуска">
          <el-input v-model="local.rules.admission_docs" />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="12">
      <el-col :span="12">
        <el-form-item label="Подпись времени">
          <el-input v-model="local.rules.admission_time_label" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="Время получения / допуска">
          <el-input v-model="local.rules.admission_time" />
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item label="Штраф / предупреждение при нарушении">
      <el-input v-model="local.rules.penalty" type="textarea" :rows="2" />
    </el-form-item>

    <div v-for="(item, idx) in local.rules.forbidden" :key="idx" class="item-block">
      <el-row :gutter="12">
        <el-col :span="20">
          <el-form-item :label="`Запрещено ${idx + 1}`">
            <el-input v-model="local.rules.forbidden[idx]" type="textarea" :rows="2" />
          </el-form-item>
        </el-col>
        <el-col :span="4" class="remove-col">
          <el-button size="small" text :disabled="idx === 0" @click="moveItem(local.rules.forbidden, idx, -1)">↑</el-button>
          <el-button size="small" text :disabled="idx === local.rules.forbidden.length - 1" @click="moveItem(local.rules.forbidden, idx, 1)">↓</el-button>
          <el-button type="danger" size="small" text @click="removeForbidden(idx)">✕</el-button>
        </el-col>
      </el-row>
    </div>
    <el-button type="primary" plain size="small" @click="addForbidden">+ Добавить запрет</el-button>

    <el-divider content-position="left">Результаты ЕГЭ</el-divider>
    <el-form-item label="Заголовок блока ЕГЭ">
      <el-input v-model="local.rules.ege_title" />
    </el-form-item>
    <el-form-item label="Текст про результаты ЕГЭ">
      <el-input v-model="local.rules.ege_text" type="textarea" :rows="3" />
    </el-form-item>

    <el-divider>Результаты и даты публикации</el-divider>
    <div v-for="(result, idx) in local.results" :key="idx" class="item-block">
      <el-row :gutter="12">
        <el-col :span="14">
          <el-form-item label="Название">
            <el-input v-model="result.title" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="Дата / значение">
            <el-input v-model="result.value" />
          </el-form-item>
        </el-col>
        <el-col :span="4" class="remove-col">
          <el-button size="small" text :disabled="idx === 0" @click="moveItem(local.results, idx, -1)">↑</el-button>
          <el-button size="small" text :disabled="idx === local.results.length - 1" @click="moveItem(local.results, idx, 1)">↓</el-button>
          <el-button type="danger" size="small" text @click="removeResult(idx)">✕</el-button>
        </el-col>
      </el-row>
    </div>
    <el-button type="primary" plain size="small" @click="addResult">+ Добавить дату</el-button>
  </el-form>
</template>

<script setup>
import { nextTick, reactive, ref, watch } from 'vue'

const props = defineProps({ modelValue: { type: Object, default: () => ({}) } })
const emit = defineEmits(['update:modelValue'])
const isSyncingFromModel = ref(false)

const defaultRules = {
  show_rules: true,
  title: 'Правила проведения экзаменов',
  admission_title: 'Допуск на экзамен',
  admission_docs_label: 'Документы',
  admission_docs: 'Экзаменационный лист и паспорт/ID-карта.',
  admission_time_label: 'Получение экзаменационного листа',
  admission_time: 'В день экзамена с 07:00 до 08:45.',
  forbidden_title: 'Категорически запрещается',
  forbidden: [
    'Проносить мобильные телефоны, микрокалькуляторы, компьютеры и средства связи.',
    'Покидать аудиторию во время экзамена, кроме случаев плохого самочувствия.',
    'Опаздывать к началу экзамена.'
  ],
  penalty: 'За нарушение правил - удаление с экзамена и отстранение от конкурса',
  ege_title: 'Результаты ЕГЭ',
  ege_text: ''
}

function normalizeDetail(detail = {}) {
  return {
    label: detail.label || '',
    value: detail.value || ''
  }
}

function normalizeExam(exam = {}) {
  return {
    subject: exam.subject || '',
    date: exam.date || '',
    time: exam.time || '',
    format: exam.format || '',
    duration: exam.duration || '',
    type: exam.type || 'primary',
    scope: exam.scope || '',
    description: exam.description || '',
    details: (exam.details || []).map(normalizeDetail),
    warning: exam.warning || null
  }
}

function normalizeRules(rules = {}) {
  return {
    ...defaultRules,
    ...rules,
    forbidden: Array.isArray(rules.forbidden)
      ? [...rules.forbidden]
      : [...defaultRules.forbidden]
  }
}

function normalizeValue(value = {}) {
  return {
    kicker: value.kicker || '',
    title: value.title || '',
    subtitle: value.subtitle || '',
    exams: (value.exams || []).map(normalizeExam),
    results: (value.results || []).map(result => ({ ...result })),
    rules: normalizeRules(value.rules || {})
  }
}

const initialValue = normalizeValue(props.modelValue)
const local = reactive(initialValue)

function addExam() {
  local.exams.push({
    subject: '',
    date: '',
    time: '09:00',
    format: 'Письменно',
    duration: '2 часа',
    type: 'primary',
    scope: '',
    description: '',
    details: [],
    warning: null
  })
}

function removeExam(idx) {
  local.exams.splice(idx, 1)
}

function addDetail(exam) {
  exam.details.push({ label: '', value: '' })
}

function removeDetail(exam, idx) {
  exam.details.splice(idx, 1)
}

function toggleWarning(exam, shouldShow) {
  exam.warning = shouldShow ? exam.warning || '' : null
}

function addForbidden() {
  local.rules.forbidden.push('')
}

function removeForbidden(idx) {
  local.rules.forbidden.splice(idx, 1)
}

function addResult() {
  local.results.push({ title: '', value: '' })
}

function removeResult(idx) {
  local.results.splice(idx, 1)
}

function moveItem(items, idx, direction) {
  const targetIdx = idx + direction
  if (!Array.isArray(items) || targetIdx < 0 || targetIdx >= items.length) return

  const [item] = items.splice(idx, 1)
  items.splice(targetIdx, 0, item)
}

function getLocalValue() {
  return {
    kicker: local.kicker,
    title: local.title,
    subtitle: local.subtitle,
    exams: local.exams.map(exam => ({
      ...exam,
      details: exam.details.map(detail => ({ ...detail })),
      warning: exam.warning || null
    })),
    results: local.results.map(result => ({ ...result })),
    rules: {
      ...local.rules,
      forbidden: [...local.rules.forbidden]
    }
  }
}

function syncLocalValue(value) {
  const nextValue = normalizeValue(value)
  local.kicker = nextValue.kicker
  local.title = nextValue.title
  local.subtitle = nextValue.subtitle
  local.exams = nextValue.exams
  local.results = nextValue.results
  local.rules = nextValue.rules
}

function isSameValue(value) {
  return JSON.stringify(normalizeValue(value || {})) === JSON.stringify(normalizeValue(getLocalValue()))
}

watch(local, () => {
  if (isSyncingFromModel.value) return

  emit('update:modelValue', getLocalValue())
}, { deep: true })

watch(() => props.modelValue, async (value) => {
  if (isSameValue(value)) return

  isSyncingFromModel.value = true
  syncLocalValue(value)
  await nextTick()
  isSyncingFromModel.value = false
}, { deep: true })
</script>

<style scoped>
.title-row,
.row-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
}

.title-row {
  padding-right: 12px;
}

.row-actions {
  justify-content: flex-end;
  width: auto;
}

.item-block,
.subitem-block {
  padding: 10px;
  margin-bottom: 8px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-bg-color);
}

.subitem-block {
  border-color: var(--el-border-color-lighter);
}

.remove-col {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: 4px;
  padding-bottom: 18px;
}

.section-action {
  margin-top: 12px;
}
</style>
