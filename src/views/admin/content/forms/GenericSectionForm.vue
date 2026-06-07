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
    <el-alert type="info" :closable="false" show-icon>
      <template #title>
        Дополнительное содержимое этой секции можно редактировать через JSON ниже
      </template>
    </el-alert>
    <el-form-item class="json-field" label="JSON содержимое" :error="jsonError">
      <el-input
        v-model="jsonText"
        type="textarea"
        :rows="14"
        resize="vertical"
        spellcheck="false"
        placeholder="{ ... }"
        @focus="isEditingJson = true"
        @blur="isEditingJson = false"
      />
    </el-form-item>
  </el-form>
</template>

<script setup>
import { nextTick, reactive, ref, watch } from 'vue'

const props = defineProps({ modelValue: { type: Object, default: () => ({}) } })
const emit = defineEmits(['update:modelValue'])

const local = reactive({
  kicker: props.modelValue?.kicker || '',
  title: props.modelValue?.title || '',
  subtitle: props.modelValue?.subtitle || '',
  ...props.modelValue
})

const jsonText = ref(JSON.stringify(local, null, 2))
const jsonError = ref('')
const isEditingJson = ref(false)
const isSyncingJson = ref(false)
const isSyncingFromModel = ref(false)

function replaceLocal(nextValue) {
  Object.keys(local).forEach((key) => delete local[key])
  Object.assign(local, nextValue || {})
}

watch(local, () => {
  if (isSyncingFromModel.value) return

  if (!isSyncingJson.value) emit('update:modelValue', { ...local })
  if (!isEditingJson.value) jsonText.value = JSON.stringify(local, null, 2)
}, { deep: true })

watch(jsonText, (value) => {
  if (!isEditingJson.value) return

  try {
    const parsedValue = JSON.parse(value)
    jsonError.value = ''
    isSyncingJson.value = true
    replaceLocal(parsedValue)
    emit('update:modelValue', { ...parsedValue })
  } catch (error) {
    jsonError.value = 'Некорректный JSON: ' + error.message
  } finally {
    isSyncingJson.value = false
  }
})

watch(() => props.modelValue, async (value) => {
  isSyncingFromModel.value = true
  replaceLocal(value)
  if (!isEditingJson.value) jsonText.value = JSON.stringify(value || {}, null, 2)
  await nextTick()
  isSyncingFromModel.value = false
}, { deep: true })
</script>

<style scoped>
.json-field {
  margin-top: 16px;
}

.json-field :deep(textarea) {
  font-family: Consolas, Monaco, 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
}
</style>
