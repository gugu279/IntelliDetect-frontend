<!-- DetectionsTab.vue -->
<script setup lang="ts">
import type { Obstacle } from '../../../types/api'

defineProps<{
  obstacles: Obstacle[]
  selectedObstacleId: number | null
}>()

const emit = defineEmits<{
  (e: 'view-detection-detail', obstacle: Obstacle): void
}>()

// 安全访问函数，确保不会出现 undefined
const getSafeValue = (obstacle: Obstacle) => {
  return {
    id: obstacle.id,
    imageUrl: obstacle.imageUrl || '',
    location: obstacle.location || '未知区域',
    type: obstacle.type || 'stone',
    riskLevel: obstacle.riskLevel || 'medium',
    status: obstacle.status || 'pending',
    detectionTime: obstacle.detectionTime || '',
    description: obstacle.description || '',
    // 确保 coordinates 存在
    coordinates: obstacle.coordinates || { latitude: 0, longitude: 0 }
  }
}

const handleViewDetail = (obstacle: Obstacle) => {
  emit('view-detection-detail', getSafeValue(obstacle))
}
</script>

<template>
  <div class="detections-tab">
    <div 
      v-for="obstacle in obstacles" 
      :key="obstacle.id"
      class="detection-item"
      :class="{ 'selected': obstacle.id === selectedObstacleId }"
      @click="handleViewDetail(obstacle)"
    >
      <div class="detection-info">
        <div class="detection-header">
          <span class="detection-type">{{ getSafeValue(obstacle).type === 'stone' ? '石子' : '垃圾' }}</span>
          <span class="detection-risk" :class="getSafeValue(obstacle).riskLevel">
            {{ getSafeValue(obstacle).riskLevel === 'high' ? '高风险' : 
               getSafeValue(obstacle).riskLevel === 'medium' ? '中风险' : '低风险' }}
          </span>
        </div>
        <div class="detection-location">{{ getSafeValue(obstacle).location }}</div>
        <div class="detection-time">检测时间: {{ 
          getSafeValue(obstacle).detectionTime ? 
          new Date(getSafeValue(obstacle).detectionTime).toLocaleString('zh-CN') : 
          '未知时间' 
        }}</div>
        <div class="detection-status">{{ 
          getSafeValue(obstacle).status === 'pending' ? '待处理' : 
          getSafeValue(obstacle).status === 'confirmed' ? '已确认' : '已解决' 
        }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detections-tab {
  padding: 10px;
}

.detection-item {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.detection-item:hover {
  background-color: #f5f5f5;
}

.detection-item.selected {
  border-color: #1890ff;
  background-color: #e6f7ff;
}

.detection-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.detection-type {
  font-weight: bold;
}

.detection-risk {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
}

.detection-risk.high {
  background-color: #ff4d4f;
  color: white;
}

.detection-risk.medium {
  background-color: #faad14;
  color: white;
}

.detection-risk.low {
  background-color: #52c41a;
  color: white;
}

.detection-location {
  color: #666;
  margin-bottom: 5px;
}

.detection-time {
  font-size: 12px;
  color: #999;
}

.detection-status {
  font-size: 12px;
  margin-top: 5px;
}
</style>