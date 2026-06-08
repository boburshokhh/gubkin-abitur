<template>
  <el-form label-position="top">
    <el-form-item label="Заголовок страницы">
      <el-input v-model="local.title" placeholder="Часто задаваемые вопросы" />
    </el-form-item>

    <el-form-item label="Описание под заголовком">
      <el-input
        v-model="local.subtitle"
        type="textarea"
        :rows="2"
        placeholder="Краткое описание страницы"
      />
    </el-form-item>

    <el-divider>Категории</el-divider>
    <div v-for="(category, idx) in local.categories" :key="idx" class="category-row">
      <el-input v-model="category.id" placeholder="id: application" />
      <el-input v-model="category.name" placeholder="Название категории" />
      <el-button type="danger" size="small" text circle @click="removeCategory(idx)">✕</el-button>
    </div>
    <el-button type="primary" plain size="small" @click="addCategory">+ Добавить категорию</el-button>

    <el-divider>Вопросы и ответы</el-divider>
    <div v-for="(item, idx) in local.items" :key="idx" class="item-block">
      <div class="item-block-header">
        <div class="item-title">
          <span class="item-num">Вопрос {{ idx + 1 }}</span>
          <el-tag :type="item.is_published === false ? 'info' : 'success'" size="small">
            {{ item.is_published === false ? 'Скрыт' : 'Опубликован' }}
          </el-tag>
        </div>
        <div class="item-actions">
          <el-button size="small" text :disabled="idx === 0" @click="moveItem(idx, -1)">↑</el-button>
          <el-button size="small" text :disabled="idx === local.items.length - 1" @click="moveItem(idx, 1)">↓</el-button>
          <el-button type="danger" size="small" text circle @click="removeItem(idx)">✕</el-button>
        </div>
      </div>

      <el-form-item label="Вопрос">
        <el-input v-model="item.question" placeholder="Вопрос абитуриента" />
      </el-form-item>

      <el-form-item label="Категория">
        <el-select v-model="item.category" placeholder="Выберите категорию" filterable allow-create>
          <el-option
            v-for="category in local.categories"
            :key="category.id"
            :label="category.name"
            :value="category.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Ответ">
        <el-input
          v-model="item.answer"
          type="textarea"
          :rows="5"
          placeholder="Ответ. Переносы строк сохраняются на странице."
        />
      </el-form-item>

      <el-form-item label="Публикация">
        <el-switch
          v-model="item.is_published"
          active-text="Показывать"
          inactive-text="Скрыть"
        />
      </el-form-item>
    </div>

    <el-button type="primary" plain size="small" @click="addItem">+ Добавить вопрос</el-button>
  </el-form>
</template>

<script setup>
import { nextTick, reactive, ref, watch } from 'vue'
import { defaultFaqCategories } from '@/content/default-faq.js'

const props = defineProps({ modelValue: { type: Object, default: () => ({}) } })
const emit = defineEmits(['update:modelValue'])
const isSyncingFromModel = ref(false)

function getAnswerText(item = {}) {
  if (item.answer) return item.answer
  if (item.answerIntro && item.answerOutro) return `${item.answerIntro}\n\n${item.answerOutro}`
  return item.answerIntro || ''
}

function normalizeCategory(category = {}) {
  return {
    id: category.id || '',
    name: category.name || ''
  }
}

function normalizeItem(item = {}) {
  return {
    id: item.id ?? null,
    question: item.question || '',
    answer: getAnswerText(item),
    category: item.category || 'general',
    is_published: item.is_published !== false
  }
}

function normalizeValue(value = {}) {
  const categories = Array.isArray(value.categories) && value.categories.length
    ? value.categories
    : defaultFaqCategories

  return {
    title: value.title || '',
    subtitle: value.subtitle || '',
    categories: categories.map(normalizeCategory),
    items: (value.items || []).map(normalizeItem)
  }
}

const initialValue = normalizeValue(props.modelValue)
const local = reactive({
  title: initialValue.title,
  subtitle: initialValue.subtitle,
  categories: initialValue.categories,
  items: initialValue.items
})

function addCategory() {
  local.categories.push({ id: '', name: '' })
}

function removeCategory(idx) {
  local.categories.splice(idx, 1)
}

function addItem() {
  local.items.push({
    id: Date.now(),
    question: '',
    answer: '',
    category: local.categories[0]?.id || 'general',
    is_published: true
  })
}

function removeItem(idx) { local.items.splice(idx, 1) }

function moveItem(idx, direction) {
  const targetIdx = idx + direction
  if (targetIdx < 0 || targetIdx >= local.items.length) return

  const [item] = local.items.splice(idx, 1)
  local.items.splice(targetIdx, 0, item)
}

function getLocalValue() {
  return {
    title: local.title,
    subtitle: local.subtitle,
    categories: local.categories
      .filter(category => category.id && category.name)
      .map(category => ({ ...category })),
    items: local.items.map(item => ({
      id: item.id,
      question: item.question,
      answer: item.answer,
      category: item.category,
      is_published: item.is_published !== false
    }))
  }
}

function isSameValue(value) {
  return JSON.stringify(normalizeValue(value || {})) === JSON.stringify(normalizeValue(getLocalValue()))
}

watch(local, () => {
  if (isSyncingFromModel.value) return
  emit('update:modelValue', getLocalValue())
}, { deep: true })

watch(() => props.modelValue, async (v) => {
  if (isSameValue(v)) return

  const nextValue = normalizeValue(v)
  isSyncingFromModel.value = true
  local.title = nextValue.title
  local.subtitle = nextValue.subtitle
  local.categories = nextValue.categories
  local.items = nextValue.items
  await nextTick()
  isSyncingFromModel.value = false
}, { deep: true })
</script>

<style scoped>
.item-block {
  padding: 14px;
  margin-bottom: 10px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
}
.item-block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.item-title,
.item-actions,
.category-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.category-row {
  margin-bottom: 8px;
}
.item-num { font-weight: 600; font-size: 13px; }
</style>
