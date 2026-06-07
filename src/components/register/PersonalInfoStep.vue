<template>
  <div v-if="isLoading" class="py-10">
    <el-skeleton :rows="6" animated />
  </div>

  <el-form v-else label-position="top" class="register-step-form">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <el-form-item label="Фамилия" required :error="errors.lastName">
        <el-input :model-value="modelValue.lastName" placeholder="Введите фамилию" clearable @update:model-value="updateField('lastName', $event)" />
      </el-form-item>

      <el-form-item label="Имя" required :error="errors.firstName">
        <el-input :model-value="modelValue.firstName" placeholder="Введите имя" clearable @update:model-value="updateField('firstName', $event)" />
      </el-form-item>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <el-form-item label="Отчество">
        <el-input :model-value="modelValue.middleName" placeholder="Введите отчество (если есть)" clearable @update:model-value="updateField('middleName', $event)" />
      </el-form-item>

      <el-form-item label="Дата рождения" required :error="errors.birthDate">
        <el-date-picker
          :model-value="modelValue.birthDate"
          class="w-full"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="Выберите дату"
          @update:model-value="updateField('birthDate', $event)"
        />
      </el-form-item>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <el-form-item label="Регион проживания" required :error="errors.region_id">
        <el-select v-model="residenceRegion" class="w-full" filterable placeholder="Выберите регион">
          <el-option
            v-for="region in localRegions"
            :key="region.id"
            :label="region.name"
            :value="region.id"
          />
          <el-option label="Другая страна" value="foreign" />
        </el-select>
      </el-form-item>

      <el-form-item label="Полный адрес места проживания" required :error="errors.address">
        <el-input
          :model-value="modelValue.address"
          :placeholder="modelValue.isForeignResidence ? 'Страна, город/регион, полный адрес' : 'Укажите полный адрес'"
          clearable
          @update:model-value="updateField('address', $event)"
        />
      </el-form-item>
    </div>

    <el-alert
      v-if="modelValue.isForeignResidence"
      title="Для другой страны укажите страну и регион/город в поле полного адреса."
      type="info"
      show-icon
      :closable="false"
    />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <el-form-item label="Телефон" required :error="errors.phone">
        <el-input
          :model-value="modelValue.phone"
          :placeholder="modelValue.isForeignResidence ? '+71234567890' : '+998 90 123 45 67'"
          clearable
          @update:model-value="updateField('phone', $event)"
          @input="() => emit('phone-format', 'phone')"
        />
      </el-form-item>

      <el-form-item label="Телефон одного из родителей" required :error="errors.parentPhone">
        <el-input
          :model-value="modelValue.parentPhone"
          :placeholder="modelValue.isForeignResidence ? '+71234567890' : '+998 90 123 45 67'"
          clearable
          @update:model-value="updateField('parentPhone', $event)"
          @input="() => emit('phone-format', 'parentPhone')"
        />
      </el-form-item>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <el-form-item label="Email" required :error="errors.email">
        <el-input :model-value="modelValue.email" type="email" placeholder="example@mail.com" clearable @update:model-value="updateField('email', $event)" />
      </el-form-item>

      <el-form-item label="Пол" required :error="errors.gender">
        <el-radio-group :model-value="modelValue.gender" @update:model-value="updateField('gender', $event)">
          <el-radio value="male">Мужской</el-radio>
          <el-radio value="female">Женский</el-radio>
        </el-radio-group>
      </el-form-item>
    </div>
  </el-form>
</template>

<script setup>
import { computed } from 'vue';
import { useApplicationStore } from '@/stores/application';

const appStore = useApplicationStore();

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  errors: {
    type: Object,
    default: () => ({})
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  regions: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:modelValue', 'phone-format']);

const regionsData = computed(() => props.regions.length ? props.regions : appStore.regions);

const localRegions = computed(() => {
  return regionsData.value?.filter(region => region.code !== 'FOREIGN') || [];
});

function updateField(key, value) {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value
  });
}

function updateFields(fields) {
  emit('update:modelValue', {
    ...props.modelValue,
    ...fields
  });
}

const residenceRegion = computed({
  get() {
    return props.modelValue.isForeignResidence ? 'foreign' : props.modelValue.region_id;
  },
  set(value) {
    updateFields({
      isForeignResidence: value === 'foreign',
      region_id: value === 'foreign' ? null : value
    });
    emit('phone-format', 'phone');
    emit('phone-format', 'parentPhone');
  }
});
</script>

<style scoped>
.register-step-form {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}

:deep(.el-form-item__label) {
  justify-content: flex-start;
  height: auto;
  margin-bottom: 8px;
  color: #374151;
  font-weight: 500;
  line-height: 1.35;
}

:deep(.el-form-item__content),
:deep(.el-input),
:deep(.el-select),
:deep(.el-date-editor.el-input) {
  width: 100%;
}
</style>