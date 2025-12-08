<template>
  <div class="detections-tab">
    <h3>历史检测记录</h3>
    <div class="detection-list">
      <div 
        v-for="obstacle in obstacles" 
        :key="obstacle.id"
        class="detection-item" 
        @click="emit('view-detection-detail', obstacle)"
        :class="{ active: selectedObstacleId === obstacle.id }"
      >
        <div class="detection-time">{{ formatDate(obstacle.detectionTime) }}</div>
        <div class="detection-coords">
          坐标: {{ obstacle.coordinates?.longitude ?? 0 }}, {{ obstacle.coordinates?.latitude ?? 0 }}
        </div>
        <div class="detection-type">类型: {{ getObstacleTypeName(obstacle.type) }}</div>
        <div class="detection-risk">风险等级: {{ getRiskLevelName(obstacle.riskLevel) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Obstacle } from '../../../types/api'

interface Props {
  obstacles: Obstacle[]
  selectedObstacleId: number | null
}

interface Emits {
  (e: 'view-detection-detail', obstacle: Obstacle): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const getObstacleTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    'building': '建筑',
    'crane': '起重机',
    'tree': '树木',
    'equipment': '设备',
    'other': '其他'
  }
  return typeMap[type] || type
}

const getRiskLevelName = (level: string) => {
  const levelMap: Record<string, string> = {
    'low': '低风险',
    'medium': '中风险',
    'high': '高风险'
  }
  return levelMap[level] || level
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.detection-list {
  max-height: 400px;
  overflow-y: auto;
}

.detection-item {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.detection-item:hover,
.detection-item.active {
  background: #e9ecef;
  border-color: #2a5298;
}

.detection-time {
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}

.detection-coords,
.detection-type,
.detection-risk {
  font-size: 14px;
  color: #333;
  margin-bottom: 3px;
}
</style>