<template>
  <section class="map-section">
    <div 
      class="map-container" 
      id="mapContainer" 
      @mousedown="startDrag" 
      @mousemove="dragMap" 
      @mouseup="stopDrag" 
      @mouseleave="stopDrag"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="stopDrag"
    >
      <div class="map-image-wrapper" :style="mapWrapperStyle">
        <img 
          :src="mapImage" 
          alt="机场地图" 
          class="map-image" 
          @load="onMapLoad" 
          @error="onMapError"
        />

        <!-- 测试标记点 -->
        <div 
          v-if="showTestMarker"
          class="map-marker test-marker" 
          style="top: 50%; left: 50%;"
          @click="handleTestMarkerClick"
          title="测试标记点"
        ></div>

        <!-- 障碍物标记点 - 改为默认插槽 -->
        <slot></slot>
      </div>
    </div>
    
    <!-- 地图控制按钮 -->
    <div class="map-controls">
      <button class="control-btn" @click="emit('zoom-in')">放大</button>
      <button class="control-btn" @click="emit('zoom-out')">缩小</button>
      <button class="control-btn" @click="emit('reset-view')">重置视图</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  mapImage: string
  scale: number
  offsetX: number
  offsetY: number
  showTestMarker?: boolean
}

interface Emits {
  (e: 'update:scale', scale: number): void
  (e: 'update:offsetX', offsetX: number): void
  (e: 'update:offsetY', offsetY: number): void
  (e: 'zoom-in'): void
  (e: 'zoom-out'): void
  (e: 'reset-view'): void
  (e: 'test-marker-click'): void
}

const props = withDefaults(defineProps<Props>(), {
  showTestMarker: true
})
const emit = defineEmits<Emits>()

const isDragging = ref(false)
const lastX = ref(0)
const lastY = ref(0)

const mapWrapperStyle = computed(() => ({
  transform: `translate(${props.offsetX}px, ${props.offsetY}px) scale(${props.scale})`
}))

const onMapLoad = () => {
  console.log('地图图片加载完成')
}

const onMapError = (event: Event) => {
  console.error('地图图片加载失败:', event)
  const mapContainer = document.getElementById('mapContainer')
  if (mapContainer) {
    mapContainer.style.backgroundColor = '#e9ecef'
  }
}

const startDrag = (event: MouseEvent) => {
  isDragging.value = true
  lastX.value = event.clientX
  lastY.value = event.clientY
  event.preventDefault()
}

const dragMap = (event: MouseEvent) => {
  if (!isDragging.value) return
  
  const deltaX = event.clientX - lastX.value
  const deltaY = event.clientY - lastY.value
  
  emit('update:offsetX', props.offsetX + deltaX)
  emit('update:offsetY', props.offsetY + deltaY)
  
  lastX.value = event.clientX
  lastY.value = event.clientY
}

const stopDrag = () => {
  isDragging.value = false
}

const handleTouchStart = (event: TouchEvent) => {
  if (event.touches?.length === 1) {
    isDragging.value = true
    lastX.value = event.touches[0]?.clientX ?? 0
    lastY.value = event.touches[0]?.clientY ?? 0
  }
}

const handleTouchMove = (event: TouchEvent) => {
  if (!isDragging.value || event.touches?.length !== 1) return

  const deltaX = (event.touches[0]?.clientX ?? 0) - lastX.value
  const deltaY = (event.touches[0]?.clientY ?? 0) - lastY.value

  emit('update:offsetX', props.offsetX + deltaX)
  emit('update:offsetY', props.offsetY + deltaY)

  lastX.value = event.touches[0]?.clientX ?? 0
  lastY.value = event.touches[0]?.clientY ?? 0
}

const handleTestMarkerClick = () => {
  emit('test-marker-click')
}
</script>

<style scoped>
.map-section {
  flex: 3;
  background: #e9ecef;
  position: relative;
  overflow: hidden;
  min-height: 500px;
}

.map-container {
  width: 100%;
  height: 100%;
  background: #e9ecef;
  position: relative;
  overflow: hidden;
  cursor: grab;
  min-height: 500px;
}

.map-container:active {
  cursor: grabbing;
}

.map-image-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 2215px;
  height: 1615px;
  transform-origin: 0 0;
  transition: transform 0.1s ease;
}

.map-image {
  width: 100%;
  height: 100%;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
  background-color: #e9ecef;
}

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

/* 测试标记点 */
.test-marker {
  background: #00ff00 !important;
  z-index: 103;
}

.test-marker::after {
  border-top-color: #00ff00 !important;
}

.test-marker .marker-number {
  color: #000 !important;
}
</style>