<template>
  <div 
    class="map-marker" 
    :style="markerStyle"
    @click="handleClick"
    :title="title"
    :data-obstacle-id="obstacle.id"
    :class="markerClass"
  >
    <span class="marker-number">{{ obstacle.id }}</span>
    <div class="marker-info" v-if="showTime">
      <div class="marker-time">{{ formattedTime }}</div>
      <div class="marker-type">{{ typeName }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Obstacle } from '../../../types/api'
import { computed } from 'vue'

interface Props {
  obstacle: Obstacle
  showTime?: boolean
}

interface Emits {
  (e: 'click', obstacle: Obstacle): void
}

const props = withDefaults(defineProps<Props>(), {
  showTime: false
})
const emit = defineEmits<Emits>()

const markerStyle = computed(() => {
  if (!props.obstacle.mapPosition) return {}
  
  return {
    top: `${props.obstacle.mapPosition.top}%`,
    left: `${props.obstacle.mapPosition.left}%`
  }
})

const markerClass = computed(() => {
  return {
    'marker-stone': props.obstacle.type === 'stone',
    'marker-trash': props.obstacle.type === 'trash'
  }
})

const typeName = computed(() => {
  return props.obstacle.type === 'stone' ? '石子' : '垃圾'
})

const formattedTime = computed(() => {
  if (!props.obstacle.detectionTime) return '--:--'
  const date = new Date(props.obstacle.detectionTime)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
})

const title = computed(() => {
  const riskName = getRiskLevelName(props.obstacle.riskLevel)
  return `${props.obstacle.location} - ${typeName.value} - ${riskName}`
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
  width: 40px;
  height: 40px;
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
  font-size: 14px;
}

.marker-stone {
  background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
}

.marker-trash {
  background: linear-gradient(135deg, #fd7e14 0%, #e8590c 100%);
}

.marker-stone::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 12px solid #495057;
}

.marker-trash::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 12px solid #e8590c;
}

.map-marker:hover {
  transform: translate(-50%, -50%) scale(1.3);
  z-index: 101;
}

.marker-stone:hover {
  box-shadow: 0 4px 15px rgba(108, 117, 125, 0.8);
}

.marker-trash:hover {
  box-shadow: 0 4px 15px rgba(253, 126, 20, 0.8);
}

.marker-number {
  position: relative;
  z-index: 102;
}

.marker-info {
  position: absolute;
  top: -45px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: 12px;
  color: white;
  background: rgba(0,0,0,0.7);
  padding: 4px 8px;
  border-radius: 4px;
  text-align: center;
  min-width: 80px;
  z-index: 103;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.marker-time {
  font-weight: bold;
  font-size: 13px;
}

.marker-type {
  font-size: 11px;
  opacity: 0.9;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 68, 68, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 68, 68, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 68, 68, 0);
  }
}

.marker-stone {
  animation: pulse-stone 2s infinite;
}

.marker-trash {
  animation: pulse-trash 2s infinite;
}

@keyframes pulse-stone {
  0% {
    box-shadow: 0 0 0 0 rgba(108, 117, 125, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(108, 117, 125, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(108, 117, 125, 0);
  }
}

@keyframes pulse-trash {
  0% {
    box-shadow: 0 0 0 0 rgba(253, 126, 20, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(253, 126, 20, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(253, 126, 20, 0);
  }
}
</style>