<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-lg transition-shadow duration-300">
    <div class="flex items-start gap-4 mb-4">

      <div class="flex-grow">
        <h3 class="text-xl font-bold text-gray-900 mb-1">{{ program.name }}</h3>
        <p class="text-sm text-gray-500 font-mono">{{ program.code }}</p>
      </div>
    </div>

    <div class="mb-5 text-gray-600 text-sm leading-relaxed">
      {{ program.description }}
    </div>

    <div class="mb-5 space-y-3">
        <h4 class="text-sm font-semibold text-gray-800">Профили и специализации:</h4>
        <ul v-if="program.program_tracks && program.program_tracks.length > 0" class="list-disc list-inside text-sm space-y-1 pl-2">
            <li v-for="track in program.program_tracks" :key="track.id">{{ track.name }}</li>
        </ul>
        <p v-else class="text-xs text-gray-500 italic">Профили не указаны.</p>
    </div>

    <div class="mt-auto pt-5 border-t border-gray-100">
       <router-link :to="`/programs/${program.id}`" class="text-primary-600 hover:text-primary-800 font-medium text-sm flex items-center">
        Подробнее
        <!-- <Icon name="arrow-right" class="w-4 h-4 ml-1" /> -->
      </router-link>
    </div>
  </div>
</template>

<script setup>

defineProps({
  program: {
    type: Object,
    required: true,
  },
});
</script> 