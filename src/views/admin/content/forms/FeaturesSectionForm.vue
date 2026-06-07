<template>
  <el-form label-position="top">
    <el-form-item label="Заголовок секции">
      <el-input v-model="local.title" />
    </el-form-item>
    <el-divider>Карточки преимуществ</el-divider>
    <div v-for="(item, idx) in local.items" :key="idx" class="item-block">
      <div class="item-block-header">
        <span class="item-num">{{ idx + 1 }}</span>
        <el-button type="danger" size="small" text circle @click="removeItem(idx)">✕</el-button>
      </div>
      <el-form-item :label="`Заголовок ${idx + 1}`">
        <el-input v-model="item.title" />
      </el-form-item>
      <el-form-item :label="`Описание ${idx + 1}`">
        <el-input v-model="item.description" type="textarea" :rows="2" />
      </el-form-item>
    </div>
    <el-button type="primary" plain size="small" @click="addItem">+ Добавить карточку</el-button>
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

function addItem() { local.items.push({ icon_type: 'building', title: '', description: '' }) }
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
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
}
.item-block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.item-num { font-weight: 600; color: var(--el-color-primary); }
</style>
