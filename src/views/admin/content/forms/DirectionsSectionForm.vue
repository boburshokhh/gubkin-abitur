<template>
  <el-form label-position="top">
    <el-alert
      class="form-alert"
      type="info"
      :closable="false"
      show-icon
      title="Направления и профили берутся из раздела «Образовательные программы»"
      description="В этой форме редактируются только тексты секции и настройки отображения на странице приема."
    />

    <el-form-item label="Заголовок (kicker)">
      <el-input v-model="local.kicker" />
    </el-form-item>

    <el-form-item label="Основной заголовок">
      <el-input v-model="local.title" placeholder="5 направлений, 11 профилей, 330 мест" />
    </el-form-item>

    <el-form-item label="Подзаголовок">
      <el-input v-model="local.subtitle" type="textarea" :rows="2" />
    </el-form-item>

    <el-divider>Настройки карточек</el-divider>

    <el-form-item label="Число мест по умолчанию для одного профиля">
      <el-input-number v-model="local.default_profile_places" :min="0" style="width: 100%" />
    </el-form-item>

    <el-form-item label="Показывать коды профилей в скобках">
      <el-switch v-model="local.show_profile_codes" />
    </el-form-item>

    <el-divider>Важная информация</el-divider>

    <el-form-item label="Заголовок блока">
      <el-input v-model="local.important_title" />
    </el-form-item>

    <el-form-item label="Описание блока">
      <el-input v-model="local.important_description" type="textarea" :rows="3" />
    </el-form-item>
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
    kicker: value.kicker || 'Направления подготовки',
    title: value.title || '',
    subtitle: value.subtitle || 'Выберите конкурсные группы с единым набором вступительных испытаний.',
    default_profile_places: Number(value.default_profile_places) || 30,
    show_profile_codes: Boolean(value.show_profile_codes),
    important_title: value.important_title || 'Важная информация',
    important_description: value.important_description || 'Вступительные испытания одинаковые для всех направлений как для бюджетных мест, так и для мест по договорам. Абитуриенты могут указать конкурсные группы с приоритетом.'
  }
}

function getLocalValue() {
  return { ...local }
}

function isSameValue(value) {
  return JSON.stringify(getFormValue(value || {})) === JSON.stringify(getLocalValue())
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
.form-alert {
  margin-bottom: 16px;
  border-radius: 10px;
}
</style>
