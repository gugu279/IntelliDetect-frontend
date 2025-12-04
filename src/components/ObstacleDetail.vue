<template>
  <div class="obstacle-detail-container">
    <div class="header">
      <div class="nav-controls">
        <button @click="handleBack" class="back-btn">返回</button>
        <h1>障碍物详情</h1>
      </div>
      <div class="user-info">
        <span>欢迎，{{ currentUser?.uname }}！</span>
        <button @click="handleLogout" class="logout-btn">退出登录</button>
      </div>
    </div>
    
    <div class="content">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>加载失败</h3>
        <p>{{ error }}</p>
        <button @click="fetchObstacleDetail" class="retry-btn">重试</button>
      </div>
      
      <!-- 障碍物详情 -->
      <div v-else-if="obstacle" class="obstacle-detail">
        <!-- 基本信息卡片 -->
        <div class="info-card">
          <div class="card-header">
            <h2>{{ obstacle.location || '未知位置' }}</h2>
            <span :class="['risk-tag', `risk-${obstacle.riskLevel}`]">
              {{ getRiskLevelName(obstacle.riskLevel) }}
            </span>
          </div>
          
          <div class="obstacle-media">
            <div class="media-content">
              <div class="image-container">
                <img :src="obstacle.imageUrl" :alt="obstacle.location" class="obstacle-image" />
              </div>
            </div>
          </div>
          
          <div class="detail-info">
            <div class="info-row">
              <span class="info-label">障碍物ID:</span>
              <span class="info-value">{{ obstacle.id }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">检测时间:</span>
              <span class="info-value">{{ formatDate(obstacle.detectionTime) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">类型:</span>
              <span class="info-value">{{ getObstacleTypeName(obstacle.type) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">高度:</span>
              <span class="info-value">{{ obstacle.height }} 米</span>
            </div>
            <div class="info-row">
              <span class="info-label">距离:</span>
              <span class="info-value">{{ obstacle.distance }} 米</span>
            </div>
            <div class="info-row">
              <span class="info-label">坐标:</span>
              <span class="info-value">
                {{ obstacle.coordinates?.latitude?.toFixed(6) }}, {{ obstacle.coordinates?.longitude?.toFixed(6) }}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">状态:</span>
              <span :class="['status-tag', `status-${obstacle.status}`]">
                {{ getStatusName(obstacle.status) }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- 地图位置卡片 -->
        <div class="map-card" v-if="obstacle.coordinates">
          <h3>位置地图</h3>
          <div class="map-placeholder">
            <div class="map-coordinates">
              <p>纬度: {{ obstacle.coordinates.latitude?.toFixed(6) }}</p>
              <p>经度: {{ obstacle.coordinates.longitude?.toFixed(6) }}</p>
            </div>
            <div class="map-note">
              <p>地图集成功能待开发</p>
              <p>实际项目中可集成百度地图/高德地图API</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 未找到 -->
      <div v-else class="not-found">
        <div class="not-found-icon">🔍</div>
        <h3>障碍物不存在</h3>
        <p>找不到指定的障碍物信息</p>
        <button @click="handleBack" class="back-to-list-btn">返回列表</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { obstacleApi } from '../services/api'

// 路由和响应式数据
const route = useRoute()
const router = useRouter()
const isLoading = ref(true)
const error = ref('')
const obstacle = ref<any>(null)

// 获取障碍物ID
const obstacleId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? parseInt(id, 10) : id
})

// 注入全局用户状态
const currentUser = inject<Ref<any>>('currentUser', ref(null))

// 障碍物类型映射
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

// 风险等级映射
const getRiskLevelName = (level: string) => {
  const levelMap: Record<string, string> = {
    'low': '低风险',
    'medium': '中风险',
    'high': '高风险'
  }
  return levelMap[level] || level
}

// 状态映射
const getStatusName = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': '待处理',
    'confirmed': '已确认',
    'resolved': '已解决'
  }
  return statusMap[status] || status
}

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 返回上一页
const handleBack = () => {
  router.push('/obstacles')
}

// 退出登录
const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

// 获取障碍物详情
const fetchObstacleDetail = async () => {
  if (!obstacleId.value) {
    error.value = '无效的障碍物ID'
    isLoading.value = false
    return
  }
  
  isLoading.value = true
  error.value = ''
  
  try {
    const numericObstacleId = Number(obstacleId.value)
    if (isNaN(numericObstacleId)) {
      error.value = '无效的障碍物ID'
      isLoading.value = false
      return
    }
    const result = await obstacleApi.getObstacleById(numericObstacleId)
    if (result && result.code === 200) {
      obstacle.value = result.data
    } else {
      error.value = result?.message || '获取障碍物详情失败'
    }
  } catch (err: any) {
    console.error('获取障碍物详情失败:', err)
    error.value = err?.message || '网络错误，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchObstacleDetail()
})
</script>

<style scoped>
.obstacle-detail-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.header {
  background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
  color: white;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.nav-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-btn {
  padding: 0.5rem 1rem;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.back-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.header h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info span {
  font-size: 1rem;
  font-weight: 500;
}

.logout-btn {
  padding: 0.5rem 1rem;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* 加载状态和错误状态 */
.loading-state,
.error-state,
.not-found {
  text-align: center;
  padding: 4rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1e40af;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon,
.not-found-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.error-state h3,
.not-found h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

.error-state p,
.not-found p {
  margin: 0 0 1.5rem 0;
  color: #666;
}

.retry-btn,
.back-to-list-btn {
  padding: 0.75rem 1.5rem;
  background-color: #1e40af;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.retry-btn:hover,
.back-to-list-btn:hover {
  background-color: #1e3a8a;
}

/* 障碍物详情卡片样式 */
.obstacle-detail {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-card,
.map-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.card-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.6rem;
  font-weight: 700;
  flex: 1;
  margin-right: 1rem;
}

.card-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.3rem;
  font-weight: 600;
}

.risk-tag,
.status-tag {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
}

.risk-low {
  background-color: #d1fae5;
  color: #065f46;
}

.risk-medium {
  background-color: #fef3c7;
  color: #92400e;
}

.risk-high {
  background-color: #fee2e2;
  color: #991b1b;
}

.status-pending {
  background-color: #fef3c7;
  color: #92400e;
}

.status-confirmed {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-resolved {
  background-color: #d1fae5;
  color: #065f46;
}

/* 媒体展示区域 */
.obstacle-media {
  margin-bottom: 1.5rem;
}

.media-content {
  border-radius: 8px;
  overflow: hidden;
  background-color: #000;
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.obstacle-image {
  max-width: 100%;
  max-height: 500px;
  object-fit: contain;
}

/* 详细信息 */
.detail-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-weight: 500;
  color: #666;
}

.info-value {
  color: #333;
  font-weight: 600;
}

/* 地图卡片 */
.map-placeholder {
  height: 300px;
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #0369a1;
  text-align: center;
}

.map-coordinates {
  margin-bottom: 2rem;
}

.map-coordinates p {
  margin: 0.5rem 0;
  font-family: monospace;
  font-size: 1.1rem;
}

.map-note p {
  margin: 0.5rem 0;
  font-size: 0.9rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .nav-controls {
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }
  
  .content {
    padding: 1rem;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .card-header h2 {
    font-size: 1.4rem;
  }
  
  .detail-info {
    grid-template-columns: 1fr;
  }
  
  .image-container {
    min-height: 250px;
  }
}
</style>