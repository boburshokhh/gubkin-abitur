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

    <el-divider>Карточки информации</el-divider>

    <div v-for="(card, cardIndex) in local.cards" :key="cardIndex" class="item-block">
      <div class="item-block-header">
        <span class="item-num">Карточка {{ cardIndex + 1 }}</span>
        <el-button type="danger" size="small" text circle @click="removeCard(cardIndex)">✕</el-button>
      </div>

      <el-row :gutter="12">
        <el-col :span="16">
          <el-form-item label="Название карточки">
            <el-input v-model="card.title" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Иконка">
            <el-select v-model="card.icon_type">
              <el-option value="office-building" label="Здание" />
              <el-option value="data-analysis" label="Статистика" />
              <el-option value="calendar" label="Календарь" />
              <el-option value="user" label="Пользователь" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">Строки карточки</el-divider>
      <div v-for="(item, itemIndex) in card.items" :key="itemIndex" class="subitem-block">
        <el-row :gutter="12">
          <el-col :span="8">
            <el-form-item label="Подпись">
              <el-input v-model="item.label" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Значение">
              <el-input v-model="item.value" />
            </el-form-item>
          </el-col>
          <el-col :span="2">
            <el-form-item label="Акцент">
              <el-switch v-model="item.accent" />
            </el-form-item>
          </el-col>
          <el-col :span="2" class="remove-col">
            <el-button type="danger" size="small" text @click="removeItem(card, itemIndex)">✕</el-button>
          </el-col>
        </el-row>
      </div>
      <el-button plain size="small" @click="addItem(card)">+ Добавить строку</el-button>

      <el-divider content-position="left">Заметка</el-divider>
      <el-form-item label="Показывать заметку">
        <el-switch :model-value="Boolean(card.note)" @update:model-value="toggleNote(card, $event)" />
      </el-form-item>
      <template v-if="card.note">
        <el-row :gutter="12">
          <el-col :span="16">
            <el-form-item label="Заголовок заметки">
              <el-input v-model="card.note.title" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Тип">
              <el-select v-model="card.note.type">
                <el-option value="info" label="Информация" />
                <el-option value="warning" label="Предупреждение" />
                <el-option value="success" label="Успех" />
                <el-option value="error" label="Ошибка" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="Описание заметки">
          <el-input v-model="card.note.description" type="textarea" :rows="2" />
        </el-form-item>
      </template>
    </div>

    <el-button type="primary" plain size="small" @click="addCard">+ Добавить карточку</el-button>
  </el-form>
</template>

<script setup>
import { nextTick, reactive, ref, watch } from 'vue'

const props = defineProps({ modelValue: { type: Object, default: () => ({}) } })
const emit = defineEmits(['update:modelValue'])
const isSyncingFromModel = ref(false)

const local = reactive(getFormValue(props.modelValue))

function getFormValue(value = {}) {
  return {
    kicker: value.kicker || 'Общая информация',
    title: value.title || 'О филиале Губкина в Ташкенте',
    subtitle: value.subtitle || 'Краткая информация об учебном заведении и формате обучения.',
    cards: (value.cards || []).map(card => ({
      title: card.title || '',
      icon_type: card.icon_type || card.icon || 'office-building',
      items: (card.items || []).map(item => ({
        label: item.label || '',
        value: item.value || '',
        accent: Boolean(item.accent)
      })),
      note: card.note ? { ...card.note } : null
    }))
  }
}

function getLocalValue() {
  return {
    ...local,
    cards: local.cards.map(card => ({
      ...card,
      items: card.items.map(item => ({ ...item })),
      note: card.note ? { ...card.note } : null
    }))
  }
}

function isSameValue(value) {
  return JSON.stringify(getFormValue(value || {})) === JSON.stringify(getLocalValue())
}

function addCard() {
  local.cards.push({ title: '', icon_type: 'office-building', items: [], note: null })
}

function removeCard(index) {
  local.cards.splice(index, 1)
}

function addItem(card) {
  card.items.push({ label: '', value: '', accent: false })
}

function removeItem(card, index) {
  card.items.splice(index, 1)
}

function toggleNote(card, shouldShow) {
  card.note = shouldShow ? { title: '', description: '', type: 'info' } : null
}

watch(local, () => {
  if (isSyncingFromModel.value) return
  emit('update:modelValue', getLocalValue())
}, { deep: true })

watch(() => props.modelValue, async (value) => {
  if (isSameValue(value)) return

  isSyncingFromModel.value = true
  Object.assign(local, getFormValue(value))
  await nextTick()
  isSyncingFromModel.value = false
}, { deep: true })
</script>

<style scoped>
.item-block {
  padding: 14px;
  margin-bottom: 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
}

.subitem-block {
  padding: 10px;
  margin-bottom: 8px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-bg-color);
}

.item-block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.item-num {
  font-weight: 600;
  font-size: 13px;
}

.remove-col {
  display: flex;
  align-items: flex-end;
  padding-bottom: 18px;
}
</style>
