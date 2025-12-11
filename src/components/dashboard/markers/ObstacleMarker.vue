<template>
  <div 
    class="map-marker" 
    :style="markerStyle"
    @click="handleClick"
    :title="title"
    :data-obstacle-id="obstacle.id"
<<<<<<< HEAD
    :class="markerClass"
  >
    <span class="marker-number">{{ obstacle.id }}</span>
    <div class="marker-info" v-if="showTime">
      <div class="marker-time">{{ formattedTime }}</div>
      <div class="marker-type">{{ typeName }}</div>
=======
  >
    <span class="marker-number">{{ obstacle.id }}</span>
    <div class="marker-position" v-if="showPosition">
      {{ obstacle.mapPosition?.top }}%, {{ obstacle.mapPosition?.left }}%
>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Obstacle } from '../../../types/api'
import { computed } from 'vue'

interface Props {
  obstacle: Obstacle
<<<<<<< HEAD
  showTime?: boolean
=======
  showPosition?: boolean
>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
}

interface Emits {
  (e: 'click', obstacle: Obstacle): void
}

const props = withDefaults(defineProps<Props>(), {
<<<<<<< HEAD
  showTime: false
=======
  showPosition: false
>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
})
const emit = defineEmits<Emits>()

const markerStyle = computed(() => {
  if (!props.obstacle.mapPosition) return {}
  
  return {
    top: `${props.obstacle.mapPosition.top}%`,
    left: `${props.obstacle.mapPosition.left}%`
  }
})

<<<<<<< HEAD
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
=======
const title = computed(() => {
  return `${props.obstacle.location} - ${getRiskLevelName(props.obstacle.riskLevel)}`
>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
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
<<<<<<< HEAD
  width: 40px;
  height: 40px;
=======
  width: 30px;
  height: 30px;
  background: #ff4444;
>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
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
<<<<<<< HEAD
  font-size: 14px;
}

.marker-stone {
  background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
}

.marker-trash {
  background: linear-gradient(135deg, #fd7e14 0%, #e8590c 100%);
}

.marker-stone::after {
=======
  font-size: 12px;
}

.map-marker::after {
>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
  content: '';
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
<<<<<<< HEAD
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
=======
  border-top: 12px solid #ff4444;
>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
}

.map-marker:hover {
  transform: translate(-50%, -50%) scale(1.3);
<<<<<<< HEAD
  z-index: 101;
}

.marker-stone:hover {
  box-shadow: 0 4px 15px rgba(108, 117, 125, 0.8);
}

.marker-trash:hover {
  box-shadow: 0 4px 15px rgba(253, 126, 20, 0.8);
}

=======
  box-shadow: 0 4px 15px rgba(255, 68, 68, 0.8);
  z-index: 101;
}

>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
.marker-number {
  position: relative;
  z-index: 102;
}

<<<<<<< HEAD
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
=======
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
>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 68, 68, 0.7);
  }
  70% {
<<<<<<< HEAD
    box-shadow: 0 0 0 10px rgba(255, 68, 68, 0);
=======
    box-shadow: 0 0 0 15px rgba(255, 68, 68, 0);
>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 68, 68, 0);
  }
}
<<<<<<< HEAD

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
=======
>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
</style>