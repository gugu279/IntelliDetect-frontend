<<<<<<< HEAD
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
=======
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
>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
      </div>
    </div>
  </div>
</template>

<<<<<<< HEAD
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
=======
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
>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
}

.detection-time {
  font-size: 12px;
<<<<<<< HEAD
  color: #999;
}

.detection-status {
  font-size: 12px;
  margin-top: 5px;
=======
  color: #666;
  margin-bottom: 5px;
}

.detection-coords,
.detection-type,
.detection-risk {
  font-size: 14px;
  color: #333;
  margin-bottom: 3px;
>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
}
</style>