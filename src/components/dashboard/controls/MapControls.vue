<template>
  <div class="map-controls">
    <button class="control-btn" @click="$emit('zoom-in')">放大</button>
    <button class="control-btn" @click="$emit('zoom-out')">缩小</button>
    <button class="control-btn" @click="$emit('reset-view')">重置视图</button>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  'zoom-in': []
  'zoom-out': []
  'reset-view': []
}>()
</script>

<style scoped>
.map-controls {
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
  z-index: 100;
}

.control-btn {
  background: white;
  border: none;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  transition: background-color 0.3s;
}

.control-btn:hover {
  background: #f5f5f5;
}
</style>