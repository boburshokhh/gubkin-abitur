<template>
  <el-form label-position="top">
    <el-form-item label="Заголовок">
      <el-input v-model="local.title" placeholder="Заголовок баннера" />
    </el-form-item>
    <el-form-item label="Подзаголовок">
      <el-input v-model="local.subtitle" type="textarea" :rows="3" placeholder="Описание под заголовком" />
    </el-form-item>
    <el-row :gutter="16">
      <el-col :span="12">
        <el-form-item label="Текст основной кнопки">
          <el-input v-model="local.button_primary_text" placeholder="Подать документы" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="Ссылка основной кнопки">
          <el-input v-model="local.button_primary_href" placeholder="/register" />
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="16">
      <el-col :span="12">
        <el-form-item label="Текст дополнительной кнопки">
          <el-input v-model="local.button_secondary_text" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="Ссылка дополнительной кнопки">
          <el-input v-model="local.button_secondary_href" />
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({ modelValue: { type: Object, default: () => ({}) } })
const emit = defineEmits(['update:modelValue'])

const local = reactive({ ...props.modelValue })

watch(local, () => emit('update:modelValue', { ...local }), { deep: true })
watch(() => props.modelValue, (v) => Object.assign(local, v), { deep: true })
</script>
