<template>
  <div 
    class="map-marker" 
    :style="markerStyle"
    @click="handleClick"
    :title="title"
    :data-obstacle-id="obstacle.id"
  >
    <span class="marker-number">{{ obstacle.id }}</span>
    <div class="marker-position" v-if="showPosition">
      {{ obstacle.mapPosition?.top }}%, {{ obstacle.mapPosition?.left }}%
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Obstacle } from '../../../types/api'
import { computed } from 'vue'

interface Props {
  obstacle: Obstacle
  showPosition?: boolean
}

interface Emits {
  (e: 'click', obstacle: Obstacle): void
}

const props = withDefaults(defineProps<Props>(), {
  showPosition: false
})
const emit = defineEmits<Emits>()

const markerStyle = computed(() => {
  if (!props.obstacle.mapPosition) return {}
  
  return {
    top: `${props.obstacle.mapPosition.top}%`,
    left: `${props.obstacle.mapPosition.left}%`
  }
})

const title = computed(() => {
  return `${props.obstacle.location} - ${getRiskLevelName(props.obstacle.riskLevel)}`
})

const getRiskLevelName = (level: string) => {
  const levelMap: Record<string, string> = {
    'low': '低风险',
    'medium': '中风险',
    'high': '高风险'
  }
  return levelMap[level] || level
}

const handleClick = () => {
  emit('click', props.obstacle)
}
</script>

<style scoped>
.map-marker {
  position: absolute;
  width: 30px;
  height: 30px;
  background: #ff4444;
  border: 3px solid white;
  border-radius: 50%;
  box-shadow: 0 2px 10px rgba(0,0,0,0.5);
  cursor: pointer;
  transform: translate(-50%, -50%);
  transition: all 0.2s ease;
  z-index: 100;
  animation: pulse 2s infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  font-size: 12px;
}

.map-marker::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 12px solid #ff4444;
}

.map-marker:hover {
  transform: translate(-50%, -50%) scale(1.3);
  box-shadow: 0 4px 15px rgba(255, 68, 68, 0.8);
  z-index: 101;
}

.marker-number {
  position: relative;
  z-index: 102;
}

.marker-position {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: 10px;
  color: white;
  background: rgba(0,0,0,0.5);
  padding: 2px 5px;
  border-radius: 3px;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 68, 68, 0.7);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(255, 68, 68, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 68, 68, 0);
  }
}
</style>