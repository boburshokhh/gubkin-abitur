<template>
  <div class="mt-8">
    <BaseCard>
      <div class="text-center">
        <div class="flex justify-center">
          <svg class="h-16 w-16 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 class="mt-4 text-2xl font-bold text-gray-900">Заявление успешно отправлено!</h2>
        <p class="mt-2 text-gray-600">
          Ваше заявление принято на рассмотрение. Номер заявления: <strong>{{ applicationNumber }}</strong>
        </p>
        <p class="mt-2 text-gray-600">
          В ближайшее время с вами свяжутся представители приемной комиссии для дальнейших инструкций.
        </p>
        
        <div class="mt-6">
          <BaseButton tag="router-link" to="/" variant="primary">
            Вернуться на главную
          </BaseButton>
        </div>
      </div>
    </BaseCard>
  </div>
</template>

<script setup>
import { BaseCard, BaseButton } from '@/components/ui';

defineProps({
  applicationNumber: {
    type: String,
    required: true
  }
});
</script> 