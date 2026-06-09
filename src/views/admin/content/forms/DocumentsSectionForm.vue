<template>
  <el-form label-position="top">
    <el-form-item label="Заголовок (kicker)">
      <el-input v-model="local.kicker" />
    </el-form-item>

    <el-form-item label="Основной заголовок">
      <el-input v-model="local.title" />
    </el-form-item>

    <el-form-item label="Подзаголовок">
      <el-input v-model="local.subtitle" type="textarea" :rows="2" />
    </el-form-item>

    <el-divider>Документы</el-divider>
    <div v-for="(item, idx) in local.items" :key="idx" class="item-block">
      <div class="item-block-header">
        <span class="item-num">{{ item.title || `Документ ${idx + 1}` }}</span>
        <div class="row-actions">
          <el-button size="small" text :disabled="idx === 0" @click="moveItem(local.items, idx, -1)">↑</el-button>
          <el-button size="small" text :disabled="idx === local.items.length - 1" @click="moveItem(local.items, idx, 1)">↓</el-button>
          <el-button type="danger" size="small" text circle @click="removeDocument(idx)">✕</el-button>
        </div>
      </div>

      <el-row :gutter="12">
        <el-col :span="6">
          <el-form-item label="Номер">
            <el-input v-model="item.number" placeholder="01" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Название">
            <el-input v-model="item.title" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="Метка">
            <el-input v-model="item.status_label" placeholder="Обязательно" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="Описание">
        <el-input v-model="item.description" type="textarea" :rows="3" />
      </el-form-item>

      <el-divider content-position="left">Примечания</el-divider>
      <div v-for="(note, noteIdx) in item.notes" :key="noteIdx" class="subitem-block">
        <el-row :gutter="12">
          <el-col :span="8">
            <el-form-item label="Заголовок">
              <el-input v-model="note.title" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Тип">
              <el-select v-model="note.type">
                <el-option value="info" label="Информация" />
                <el-option value="warning" label="Предупреждение" />
                <el-option value="success" label="Успех" />
                <el-option value="error" label="Ошибка" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8" class="remove-col">
            <el-button size="small" text :disabled="noteIdx === 0" @click="moveItem(item.notes, noteIdx, -1)">↑</el-button>
            <el-button size="small" text :disabled="noteIdx === item.notes.length - 1" @click="moveItem(item.notes, noteIdx, 1)">↓</el-button>
            <el-button type="danger" size="small" text @click="removeNote(item, noteIdx)">Удалить</el-button>
          </el-col>
        </el-row>
        <el-form-item label="Описание">
          <el-input v-model="note.description" type="textarea" :rows="2" />
        </el-form-item>
      </div>
      <el-button type="primary" plain size="small" @click="addNote(item)">+ Добавить примечание</el-button>
    </div>
    <el-button type="primary" plain size="small" @click="addDocument">+ Добавить документ</el-button>

    <el-divider>Сроки и режим работы</el-divider>
    <el-form-item label="Показывать блок">
      <el-switch v-model="local.summary.show_summary" active-text="Показывать" inactive-text="Скрыть" />
    </el-form-item>

    <el-form-item label="Заголовок блока">
      <el-input v-model="local.summary.title" />
    </el-form-item>

    <el-row :gutter="12">
      <el-col :span="12">
        <el-form-item label="Заголовок уведомления">
          <el-input v-model="local.summary.notice_title" placeholder="Прием документов" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="Тип уведомления">
          <el-select v-model="local.summary.notice_type">
            <el-option value="info" label="Информация" />
            <el-option value="warning" label="Предупреждение" />
            <el-option value="success" label="Успех" />
            <el-option value="error" label="Ошибка" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item label="Описание сроков">
      <el-input v-model="local.summary.date_info" type="textarea" :rows="3" />
    </el-form-item>

    <el-row :gutter="12">
      <el-col :span="8">
        <el-form-item label="Подпись адреса">
          <el-input v-model="local.summary.address_label" />
        </el-form-item>
      </el-col>
      <el-col :span="16">
        <el-form-item label="Адрес">
          <el-input v-model="local.summary.address" type="textarea" :rows="2" />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="12">
      <el-col :span="8">
        <el-form-item label="Подпись телефона">
          <el-input v-model="local.summary.phone_title" />
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="Телефон для ссылки">
          <el-input v-model="local.summary.phone" placeholder="+998712000156" />
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="Телефон на сайте">
          <el-input v-model="local.summary.phone_label" placeholder="(+99871) 200-01-56" />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="12">
      <el-col :span="8">
        <el-form-item label="Подпись ответственного">
          <el-input v-model="local.summary.contact_person_label" />
        </el-form-item>
      </el-col>
      <el-col :span="16">
        <el-form-item label="Ответственное лицо">
          <el-input v-model="local.summary.contact_person" />
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script setup>
import { nextTick, reactive, ref, watch } from 'vue'

const props = defineProps({ modelValue: { type: Object, default: () => ({}) } })
const emit = defineEmits(['update:modelValue'])
const isSyncingFromModel = ref(false)

function getSummaryValue(summary = {}) {
  return {
    show_summary: summary.show_summary !== false,
    title: summary.title || 'Сроки и режим работы',
    notice_title: summary.notice_title || 'Прием документов',
    notice_type: summary.notice_type || 'info',
    date_info: summary.date_info || '',
    address_label: summary.address_label || 'Адрес',
    address: summary.address || '',
    phone_title: summary.phone_title || 'Call-центр',
    phone: summary.phone || '',
    phone_label: summary.phone_label || '',
    contact_person_label: summary.contact_person_label || 'Ответственное лицо',
    contact_person: summary.contact_person || ''
  }
}

function getDocumentValue(item = {}) {
  return {
    number: item.number || '',
    title: item.title || '',
    status_label: item.status_label || 'Обязательно',
    description: item.description || '',
    notes: (item.notes || []).map(note => ({
      title: note.title || '',
      description: note.description || '',
      type: note.type || 'info'
    }))
  }
}

function getFormValue(value = {}) {
  return {
    kicker: value.kicker || 'Документы',
    title: value.title || 'Необходимые документы',
    subtitle: value.subtitle || '',
    items: (value.items || []).map(getDocumentValue),
    summary: getSummaryValue(value.summary || {})
  }
}

const local = reactive(getFormValue(props.modelValue))

function addDocument() {
  local.items.push({
    number: '',
    title: '',
    status_label: 'Обязательно',
    description: '',
    notes: []
  })
}

function removeDocument(idx) {
  local.items.splice(idx, 1)
}

function addNote(item) {
  item.notes.push({ title: '', description: '', type: 'info' })
}

function removeNote(item, idx) {
  item.notes.splice(idx, 1)
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
    items: local.items.map(item => ({
      ...item,
      notes: item.notes.map(note => ({ ...note }))
    })),
    summary: { ...local.summary }
  }
}

function syncLocalValue(value) {
  const nextValue = getFormValue(value)
  local.kicker = nextValue.kicker
  local.title = nextValue.title
  local.subtitle = nextValue.subtitle
  local.items = nextValue.items
  local.summary = nextValue.summary
}

function isSameValue(value) {
  return JSON.stringify(getFormValue(value || {})) === JSON.stringify(getFormValue(getLocalValue()))
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
.item-block,
.subitem-block {
  padding: 14px;
  margin-bottom: 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
}

.subitem-block {
  padding: 10px;
  border-color: var(--el-border-color-lighter);
  background: var(--el-bg-color);
}

.item-block-header,
.row-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.item-block-header {
  margin-bottom: 10px;
}

.item-num {
  font-weight: 600;
  font-size: 13px;
}

.remove-col {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: 4px;
  padding-bottom: 18px;
}
</style>
