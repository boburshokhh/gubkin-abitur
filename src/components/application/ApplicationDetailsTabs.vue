<!-- <template>
  <div class="bg-white shadow rounded-lg overflow-hidden mb-8">
    <div class="border-b border-gray-200">
      <nav class="flex -mb-px">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="$emit('change-tab', tab.id)"
          :class="[
            'py-4 px-6 text-center font-medium text-sm border-b-2 focus:outline-none',
            activeTab === tab.id 
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          <span class="flex items-center">
            <component :is="tab.icon" class="h-5 w-5 mr-2" />
            {{ tab.title }}
            <span 
              v-if="tab.count && tab.count > 0" 
              class="ml-2 bg-gray-100 text-gray-800 py-0.5 px-2 rounded-full text-xs"
            >
              {{ tab.count }}
            </span>
          </span>
        </button>
      </nav>
    </div>
    
    <div class="p-6">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  activeTab: {
    type: String,
    required: true
  },
  tabs: {
    type: Array,
    required: true
  }
});

defineEmits(['change-tab']);
</script>  -->