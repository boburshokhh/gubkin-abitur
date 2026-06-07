<template>
  <el-form label-position="top">
    <el-form-item label="Заголовок секции">
      <el-input v-model="local.title" />
    </el-form-item>
    <el-divider>Вопросы и ответы</el-divider>
    <div v-for="(item, idx) in local.items" :key="idx" class="item-block">
      <div class="item-block-header">
        <span class="item-num">Вопрос {{ idx + 1 }}</span>
        <el-button type="danger" size="small" text circle @click="removeItem(idx)">✕</el-button>
      </div>
      <el-form-item label="Вопрос">
        <el-input v-model="item.question" placeholder="Вопрос абитуриента" />
      </el-form-item>
      <el-form-item label="Ответ">
        <el-input v-model="item.answer" type="textarea" :rows="3" placeholder="Ответ" />
      </el-form-item>
    </div>
    <el-button type="primary" plain size="small" @click="addItem">+ Добавить вопрос</el-button>
  </el-form>
</template>

<script setup>
import { nextTick, reactive, ref, watch } from 'vue'

const props = defineProps({ modelValue: { type: Object, default: () => ({}) } })
const emit = defineEmits(['update:modelValue'])
const isSyncingFromModel = ref(false)

const local = reactive({
  title: props.modelValue?.title || '',
  items: (props.modelValue?.items || []).map(i => ({ ...i }))
})

function addItem() { local.items.push({ question: '', answer: '' }) }
function removeItem(idx) { local.items.splice(idx, 1) }
function getLocalValue() { return { ...local, items: local.items.map(i => ({ ...i })) } }
function isSameValue(value) { return JSON.stringify(value || {}) === JSON.stringify(getLocalValue()) }

watch(local, () => {
  if (isSyncingFromModel.value) return
  emit('update:modelValue', getLocalValue())
}, { deep: true })

watch(() => props.modelValue, async (v) => {
  if (isSameValue(v)) return

  isSyncingFromModel.value = true
  local.title = v?.title || ''
  local.items = (v?.items || []).map(i => ({ ...i }))
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
.item-num { font-weight: 600; font-size: 13px; }
</style>
