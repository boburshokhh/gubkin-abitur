<template>
  <el-dialog
    :model-value="isVisible"
    :title="title"
    width="min(480px, 92vw)"
    @close="onCancel"
  >
    <el-alert :title="message" type="warning" show-icon :closable="false" />

    <template #footer>
      <el-button @click="onCancel">
        {{ cancelText }}
      </el-button>
      <el-button type="danger" @click="onConfirm">
        {{ confirmText }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Подтверждение действия'
  },
  message: {
    type: String,
    default: 'Вы уверены, что хотите выполнить это действие?'
  },
  confirmText: {
    type: String,
    default: 'Подтвердить'
  },
  cancelText: {
    type: String,
    default: 'Отмена'
  }
});

const emit = defineEmits(['confirm', 'cancel']);

const onConfirm = () => {
  emit('confirm');
};

const onCancel = () => {
  emit('cancel');
};
</script> 