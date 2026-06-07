<template>
  <el-form label-position="top">
    <el-row :gutter="16">
      <el-col :span="12">
        <el-form-item label="Тег (например: Прием 2026/2027)">
          <el-input v-model="local.tag" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="Квота (число мест)">
          <el-input-number v-model="local.quota" :min="0" style="width:100%" />
        </el-form-item>
      </el-col>
    </el-row>
    <el-form-item label="Заголовок страницы">
      <el-input v-model="local.title" />
    </el-form-item>
    <el-form-item label="Описание">
      <el-input v-model="local.description" type="textarea" :rows="3" />
    </el-form-item>
    <el-divider>Карточка с параметрами (справа)</el-divider>
    <div v-for="(item, idx) in local.items" :key="idx" class="item-block">
      <div class="item-block-header">
        <span class="item-num">Параметр {{ idx + 1 }}</span>
        <el-button type="danger" size="small" text circle @click="removeItem(idx)">✕</el-button>
      </div>
      <el-row :gutter="12">
        <el-col :span="10">
          <el-form-item label="Подпись">
            <el-input v-model="item.label" placeholder="Прием документов" />
          </el-form-item>
        </el-col>
        <el-col :span="14">
          <el-form-item label="Значение">
            <el-input v-model="item.value" placeholder="16 июня - 01 июля" />
          </el-form-item>
        </el-col>
      </el-row>
    </div>
    <el-button type="primary" plain size="small" @click="addItem">+ Добавить параметр</el-button>
  </el-form>
</template>

<script setup>
import { nextTick, reactive, ref, watch } from 'vue'

const props = defineProps({ modelValue: { type: Object, default: () => ({}) } })
const emit = defineEmits(['update:modelValue'])
const isSyncingFromModel = ref(false)

const local = reactive({
  tag: props.modelValue?.tag || '',
  title: props.modelValue?.title || '',
  description: props.modelValue?.description || '',
  quota: props.modelValue?.quota || 330,
  quota_suffix: props.modelValue?.quota_suffix || 'мест',
  quota_title: props.modelValue?.quota_title || 'Общая квота',
  items: (props.modelValue?.items || []).map(i => ({ ...i }))
})

function addItem() { local.items.push({ label: '', value: '' }) }
function removeItem(idx) { local.items.splice(idx, 1) }

watch(local, () => {
  if (isSyncingFromModel.value) return
  emit('update:modelValue', { ...local, items: local.items.map(i => ({ ...i })) })
}, { deep: true })

watch(() => props.modelValue, async (v) => {
  isSyncingFromModel.value = true
  Object.assign(local, { ...v, items: (v?.items || []).map(i => ({ ...i })) })
  await nextTick()
  isSyncingFromModel.value = false
}, { deep: true })
</script>

<style scoped>
.item-block {
  padding: 14px; margin-bottom: 10px;
  border: 1px solid var(--el-border-color); border-radius: 8px;
  background: var(--el-fill-color-lighter);
}
.item-block-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;
}
.item-num { font-weight: 600; font-size: 13px; }
</style>
