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
  </el-form>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({ modelValue: { type: Object, default: () => ({}) } })
const emit = defineEmits(['update:modelValue'])

const local = reactive({
  kicker: props.modelValue?.kicker || '',
  title: props.modelValue?.title || '',
  subtitle: props.modelValue?.subtitle || '',
  ...props.modelValue
})

watch(local, () => emit('update:modelValue', { ...local }), { deep: true })
watch(() => props.modelValue, (v) => Object.assign(local, v), { deep: true })
</script>
