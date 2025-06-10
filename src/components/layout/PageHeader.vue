<template>
  <div class="page-header">
    <h1>{{ title }}</h1>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  }
});
</script>

<style scoped>
.page-header {
  background-color: #f0f0f0;
  padding: 20px;
  border-radius: 10px;
}
</style>