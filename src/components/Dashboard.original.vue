<template>
  <div class="dashboard-container">
    <!-- 头部导航 -->
    <header class="header">
      <div class="nav-container">
        <div class="logo">机场障碍物检测系统</div>
        <ul class="nav-links">
          <li><a href="#" class="nav-link active" @click.prevent="setActiveTab('coordinates')">检测面板</a></li>
          <li><a href="#" class="nav-link" @click.prevent="setActiveTab('detections')">历史记录</a></li>
          <li><a href="#" class="nav-link" @click.prevent="setActiveTab('user')">用户信息</a></li>
        </ul>
        <div class="user-info">
          <div class="user-avatar">{{ userAvatar }}</div>
          <div class="user-name">{{ userName }}</div>
        </div>
      </div>
    </header>

      <!-- 调试面板 -->
      <div class="debug-panel" style="position: fixed; top: 70px; right: 20px; background: white; padding: 10px; border: 1px solid #ccc; z-index: 1000; font-size: 12px;">
        <div>障碍物数量: {{ obstacles.length }}</div>
        <div v-for="obstacle in obstacles" :key="obstacle.id">
          #{{ obstacle.id }}: {{ obstacle.location }} ({{ obstacle.mapPosition?.top }}%, {{ obstacle.mapPosition?.left }}%)
        </div>
        <div v-if="obstacles.length === 0">没有障碍物数据</div>
      </div>

    <!-- 主内容区域 -->
    <div class="main-container">
      <!-- 地图区域 -->
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

            <!-- 测试标记点（始终显示在中心） -->
            <div 
              class="map-marker test-marker" 
              style="top: 50%; left: 50%;"
              @click="handleTestMarkerClick"
              title="测试标记点"
            ></div>

            <!-- 动态生成标记点 - 添加更多调试信息 -->
            <!-- 在动态生成标记点的div中添加以下内容 -->
            <div 
              v-for="obstacle in obstacles" 
              :key="obstacle.id"
              class="map-marker" 
              :style="getMarkerStyle(obstacle)"
              @click="handleMarkerClick(obstacle)"
              :title="`${obstacle.location} - ${getRiskLevelName(obstacle.riskLevel)}`"
              :data-obstacle-id="obstacle.id"
              :data-position="`${obstacle.mapPosition?.top}-${obstacle.mapPosition?.left}`"
            >
              <!-- 添加数字标识和位置显示 -->
              <span class="marker-number">{{ obstacle.id }}</span>
              <div class="marker-position" style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); white-space: nowrap; font-size: 10px; color: white; background: rgba(0,0,0,0.5); padding: 2px 5px; border-radius: 3px;">
                {{ obstacle.mapPosition?.top }}%, {{ obstacle.mapPosition?.left }}%
              </div>
            </div>
          </div>
        </div>
    
        <!-- 地图控制按钮 -->
        <div class="map-controls">
          <button class="control-btn" @click="zoomIn">放大</button>
          <button class="control-btn" @click="zoomOut">缩小</button>
          <button class="control-btn" @click="resetView">重置视图</button>
        </div>
      </section>
    

      <!-- 右侧信息面板 -->
      <section class="info-panel">
        <div class="panel-tabs">
          <div 
            class="tab" 
            :class="{ active: activeTab === 'coordinates' }"
            @click="setActiveTab('coordinates')"
          >坐标信息</div>
          <div 
            class="tab" 
            :class="{ active: activeTab === 'detections' }"
            @click="setActiveTab('detections')"
          >检测记录</div>
          <div 
            class="tab" 
            :class="{ active: activeTab === 'user' }"
            @click="setActiveTab('user')"
          >用户信息</div>
        </div>

        <div class="tab-content">
          <!-- 坐标信息标签页 -->
          <div class="tab-pane" :class="{ active: activeTab === 'coordinates' }">
            <h3>实时坐标信息</h3>
            <div class="coordinate-card">
              <div class="coord-item">
                <span class="coord-label">经度:</span>
                <span class="coord-value">{{ currentCoordinate.longitude }}</span>
              </div>
              <div class="coord-item">
                <span class="coord-label">纬度:</span>
                <span class="coord-value">{{ currentCoordinate.latitude }}</span>
              </div>
              <div class="coord-item">
                <span class="coord-label">区域:</span>
                <span class="coord-value">{{ currentCoordinate.area }}</span>
              </div>
              <div class="coord-item">
                <span class="coord-label">检测时间:</span>
                <span class="coord-value">{{ currentCoordinate.detectionTime }}</span>
              </div>
            </div>

            <h4>图片预览</h4>
            <div class="image-preview">
              <img :src="currentCoordinate.image" :alt="currentCoordinate.area" v-if="currentCoordinate.image">
              <div v-else class="image-placeholder">暂无图片</div>
            </div>

            <div class="form-group">
              <label for="obstacleType">障碍物类型</label>
              <select class="form-control" id="obstacleType" v-model="selectedObstacleType">
                <option value="building">建筑</option>
                <option value="crane">起重机</option>
                <option value="tree">树木</option>
                <option value="equipment">设备</option>
                <option value="other">其他</option>
              </select>
            </div>

            <button class="btn btn-primary" style="width: 100%;" @click="confirmMark">确认标注</button>
          </div>

          <!-- 检测记录标签页 -->
          <div class="tab-pane" :class="{ active: activeTab === 'detections' }">
            <h3>历史检测记录</h3>
            <div class="detection-list">
              <div 
                v-for="obstacle in obstacles" 
                :key="obstacle.id"
                class="detection-item" 
                @click="viewDetectionDetail(obstacle)"
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

          <!-- 用户信息标签页 -->
          <div class="tab-pane" :class="{ active: activeTab === 'user' }">
            <div class="user-profile">
              <div class="profile-avatar">{{ userAvatar }}</div>
              <h3>{{ userName }}</h3>
              <p>{{ userEmail }}</p>
            </div>
            
            <div class="user-stats">
              <h4>用户统计</h4>
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-label">总检测数</span>
                  <span class="stat-value">{{ stats?.totalObstacles ?? 0 }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">高风险</span>
                  <span class="stat-value">{{ stats?.highRiskObstacles ?? 0 }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">今日新增</span>
                  <span class="stat-value">{{ stats?.pendingObstacles ?? 0 }}</span>
                </div>
              </div>
            </div>

            <button class="btn btn-secondary" style="width: 100%; margin-top: 20px;" @click="handleLogout">退出登录</button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject, type Ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { obstacleApi } from '../services/api'
import type { Obstacle, ObstacleStats } from '../types/api'

// 响应式数据
const isLoading = ref(false)
const activeTab = ref('coordinates')
const obstacles = ref<Obstacle[]>([])
const stats = ref<ObstacleStats>({
  totalObstacles: 0,
  highRiskObstacles: 0,
  resolvedObstacles: 0,
  pendingObstacles: 0,
  detectionRate: 0
})

// 地图相关数据
const mapImage = ref('/map-placeholder.jpg')
const scale = ref(1)
const offsetX = ref(0)
const offsetY = ref(0)
const isDragging = ref(false)
const lastX = ref(0)
const lastY = ref(0)
const mapLoaded = ref(false)

// 当前选中的坐标和障碍物
const currentCoordinate = ref({
  longitude: '116.3974',
  latitude: '39.9093',
  area: '跑道A区',
  detectionTime: '2024-01-15 14:30:25',
  image: ''
})

const selectedObstacleType = ref('building')
const selectedObstacleId = ref<number | null>(null)

const router = useRouter()

// 注入全局用户状态
const currentUser = inject<Ref<any>>('currentUser', ref(null))

// 计算属性
const userName = computed(() => currentUser.value?.uname || currentUser.value?.username || '未登录')
const userAvatar = computed(() => userName.value.charAt(0) || '用')
const userEmail = computed(() => currentUser.value?.email || `${userName.value}@airport.com`)

const mapWrapperStyle = computed(() => ({
  transform: `translate(${offsetX.value}px, ${offsetY.value}px) scale(${scale.value})`
}))

// 地图加载完成
const onMapLoad = () => {
  mapLoaded.value = true
  console.log('地图图片加载完成')
}

// 地图加载错误处理
const onMapError = (event: Event) => {
  console.error('地图图片加载失败:', event)
  const mapContainer = document.getElementById('mapContainer')
  if (mapContainer) {
    mapContainer.style.backgroundColor = '#e9ecef'
  }
}

// 标记点样式
const getMarkerStyle = (obstacle: Obstacle) => {
  if (!obstacle.mapPosition) return {}
  
  return {
    top: `${obstacle.mapPosition.top}%`,
    left: `${obstacle.mapPosition.left}%`
  } as any
}

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

// 格式化日期
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

// 标签页切换
const setActiveTab = (tab: string) => {
  activeTab.value = tab
}

// 退出登录
const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

// 地图操作方法
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
  
  offsetX.value += deltaX
  offsetY.value += deltaY
  
  lastX.value = event.clientX
  lastY.value = event.clientY
}

const stopDrag = () => {
  isDragging.value = false
}

// 触摸事件处理
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

  offsetX.value += deltaX
  offsetY.value += deltaY

  lastX.value = event.touches[0]?.clientX ?? 0
  lastY.value = event.touches[0]?.clientY ?? 0
}

const zoomIn = () => {
  scale.value = Math.min(scale.value * 1.2, 5)
}

const zoomOut = () => {
  scale.value = Math.max(scale.value / 1.2, 0.2)
}

const resetView = () => {
  scale.value = 1
  offsetX.value = 0
  offsetY.value = 0
}

// 标记点点击
const handleMarkerClick = (obstacle: Obstacle) => {
  selectedObstacleId.value = obstacle.id
  currentCoordinate.value = {
    longitude: obstacle.coordinates?.longitude?.toString() ?? '0',
    latitude: obstacle.coordinates?.latitude?.toString() ?? '0',
    area: obstacle.location || '未知区域',
    detectionTime: formatDate(obstacle.detectionTime),
    image: obstacle.imageUrl || ''
  }
  activeTab.value = 'coordinates'
}

// 查看检测详情
const viewDetectionDetail = (obstacle: Obstacle) => {
  selectedObstacleId.value = obstacle.id
  handleMarkerClick(obstacle)
}

// 测试标记点点击处理
const handleTestMarkerClick = () => {
  console.log('测试标记点被点击')
  alert('测试标记点工作正常！')
}

// 确认标注
const confirmMark = () => {
  console.log('标注障碍物类型:', selectedObstacleType.value)
  alert('标注成功！')
}

const fetchObstacles = async () => {
  try {
    console.log('开始获取障碍物数据...')
    const result = await obstacleApi.getObstacles(1, 50)
    console.log('API响应:', result)
    console.log('API响应code:', result.code)
    console.log('API响应data:', result.data)
    console.log('API响应data.records:', result.data?.records)
    
    if (result.code === 200) {
      const obstaclesData = result.data?.records || []
      console.log('获取到的障碍物数据:', obstaclesData)
      console.log('障碍物数据长度:', obstaclesData.length)
      
      // 如果API返回空数据，使用模拟数据
      if (obstaclesData.length === 0) {
        console.log('API返回空数据，使用模拟数据...')
        throw new Error('API返回空数据') // 强制进入catch块
      }
      
      // 为障碍物添加地图位置
      obstacles.value = obstaclesData.map((obstacle: Obstacle, index: number) => {
        const mapPosition = obstacle.mapPosition || {
          top: 20 + (index * 15) % 70,
          left: 30 + (index * 20) % 60
        }
        console.log(`障碍物 ${obstacle.id} 的地图位置:`, mapPosition)
        return {
          ...obstacle,
          mapPosition
        }
      })

      console.log('处理后的障碍物数据（包含地图位置）:', obstacles.value)
      console.log('障碍物数组长度:', obstacles.value.length)

      if (obstacles.value.length > 0 && obstacles.value[0]) {
        handleMarkerClick(obstacles.value[0])
      }
    }
  } catch (error) {
    console.error('获取障碍物数据失败:', error)
    // 使用模拟数据 - 确保所有必需属性都有值
    console.log('使用模拟数据...')
    const mockObstacles: Obstacle[] = [
      {
        id: 1,
        imageUrl: '/detection1.jpg',
        location: '跑道A区',
        type: 'building',
        height: 15,
        distance: 200,
        riskLevel: 'high',
        status: 'pending',
        detectionTime: new Date().toISOString(),
        coordinates: { latitude: 39.9093, longitude: 116.3974 },
        description: '临时施工建筑，高度超标',
        mapPosition: { top: 30, left: 30 } // 确保不在中心点
      },
      {
        id: 2,
        imageUrl: '/detection1.jpg',
        location: '跑道B区',
        type: 'crane',
        height: 25,
        distance: 150,
        riskLevel: 'medium',
        status: 'confirmed',
        detectionTime: new Date(Date.now() - 3600000).toISOString(),
        coordinates: { latitude: 39.9087, longitude: 116.3981 },
        description: '施工起重机，需要监控',
        mapPosition: { top: 60, left: 60 }
      },
      {
        id: 3,
        imageUrl: '/detection1.jpg',
        location: '停机坪',
        type: 'equipment',
        height: 8,
        distance: 300,
        riskLevel: 'low',
        status: 'resolved',
        detectionTime: new Date(Date.now() - 7200000).toISOString(),
        coordinates: { latitude: 39.9102, longitude: 116.3968 },
        description: '地面设备，已处理',
        mapPosition: { top: 70, left: 20 }
      }
    ]
    
    obstacles.value = mockObstacles
    console.log('模拟数据设置完成:', obstacles.value)
    console.log('模拟数据长度:', obstacles.value.length)
    
    if (obstacles.value.length > 0 && obstacles.value[0]) {
      handleMarkerClick(obstacles.value[0])
    }
  }
}

// 获取统计数据
const fetchStats = async () => {
  try {
    const result = await obstacleApi.getObstacleStats()
    if (result.code === 200) {
      const data = result.data
      stats.value = {
        totalObstacles: data.totalObstacles || 0,
        highRiskObstacles: data.highRiskObstacles || 0,
        resolvedObstacles: data.resolvedObstacles || 0,
        pendingObstacles: data.pendingObstacles || 0,
        detectionRate: data.detectionRate || 0
      }
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    // 模拟数据
    stats.value = {
      totalObstacles: 5,
      highRiskObstacles: 2,
      resolvedObstacles: 2,
      pendingObstacles: 3,
      detectionRate: 95.5
    }
  }
}

// 组件挂载时获取数据
onMounted(() => {
  isLoading.value = true
  Promise.all([fetchObstacles(), fetchStats()]).finally(() => {
    isLoading.value = false
    
    // 延迟检查标记点
    setTimeout(() => {
      console.log('延迟检查标记点...')
      console.log('当前 obstacles:', obstacles.value)
      
      // 强制重新渲染标记点
      const temp = [...obstacles.value]
      obstacles.value = []
      setTimeout(() => {
        obstacles.value = temp
        console.log('重新设置 obstacles:', obstacles.value)
      }, 100)
    }, 1000)
  })
})

// 添加监听器来观察 obstacles 的变化
import { watch } from 'vue'

watch(obstacles, (newObstacles) => {
  console.log('obstacles 发生变化:', newObstacles)
  console.log('obstacles 长度:', newObstacles.length)
  
  // 检查每个障碍物的 mapPosition
  newObstacles.forEach((obstacle, index) => {
    console.log(`障碍物 ${index + 1}:`, {
      id: obstacle.id,
      location: obstacle.location,
      mapPosition: obstacle.mapPosition
    })
  })
}, { deep: true, immediate: true })
</script>

<style scoped>
.dashboard-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 头部导航 */
.header {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
  padding: 0 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.logo {
  font-size: 24px;
  font-weight: bold;
}

.nav-links {
  display: flex;
  list-style: none;
}

.nav-links li {
  margin-left: 30px;
}

.nav-links a {
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background-color 0.3s;
  cursor: pointer;
}

.nav-links a:hover,
.nav-links a.active {
  background-color: rgba(255,255,255,0.1);
}

.user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #4CAF50;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  color: white;
  font-weight: bold;
}

/* 主内容区域 */
.main-container {
  display: flex;
  flex: 1;
  height: calc(100vh - 60px);
}

/* 确保地图容器有正确的尺寸 */
.map-section {
  flex: 3;
  background: #e9ecef;
  position: relative;
  overflow: hidden;
  min-height: 500px; /* 添加最小高度 */
}

.map-container {
  width: 100%;
  height: 100%;
  background: #e9ecef;
  position: relative;
  overflow: hidden;
  cursor: grab;
  min-height: 500px; /* 添加最小高度 */
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

/* 右侧信息面板 */
.info-panel {
  flex: 1;
  background: white;
  border-left: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  min-width: 350px;
  max-width: 400px;
}

.panel-tabs {
  display: flex;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.tab {
  padding: 15px 20px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
  flex: 1;
  text-align: center;
}

.tab.active {
  border-bottom-color: #2a5298;
  color: #2a5298;
  font-weight: bold;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.tab-pane {
  display: none;
}

.tab-pane.active {
  display: block;
}

/* 坐标信息卡片 */
.coordinate-card {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.coord-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 5px 0;
  border-bottom: 1px solid #eee;
}

.coord-label {
  font-weight: bold;
  color: #666;
}

.coord-value {
  color: #333;
}

/* 图片预览 */
.image-preview {
  width: 100%;
  height: 200px;
  background: #f0f0f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  border: 2px dashed #ddd;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.image-placeholder {
  color: #999;
  font-size: 14px;
}

/* 检测结果列表 */
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

/* 表单样式 */
.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-primary {
  background: #2a5298;
  color: white;
}

.btn-primary:hover {
  background: #1e3c72;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

/* 用户信息样式 */
.user-profile {
  text-align: center;
  padding: 20px;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #2a5298;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin: 0 auto 15px;
}

.user-stats {
  margin-top: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 10px;
}

.stat-item {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 6px;
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}

.stat-value {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #2a5298;
}

/* 地图标记点样式 */
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
  /* 添加动画效果 */
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

/* 标记点数字 */
.marker-number {
  position: relative;
  z-index: 102;
}

.test-marker {
  background: #00ff00 !important;
  z-index: 103; /* 确保绿色标记点在顶部 */
  animation: pulse-green 2s infinite;
}

/* 红色标记点样式修改，使其与绿色标记点基本一致 */
.map-marker:not(.test-marker) {
  z-index: 102; /* 比绿色标记点低一点 */
  animation: pulse-red 2s infinite;
}

/* 添加绿色标记点的动画 */
@keyframes pulse-green {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 255, 0, 0.7);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(0, 255, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 255, 0, 0);
  }
}

/* 添加红色标记点的动画 */
@keyframes pulse-red {
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

/* 响应式设计 */
@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
  }
  
  .info-panel {
    max-width: none;
    min-width: auto;
    height: 40vh;
  }

  .map-section {
    height: 60vh; /* 给地图设置合适的高度 */
  }
  
  .nav-links {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .nav-links li {
    margin: 5px 10px;
  }
  
  .map-controls {
    bottom: 10px;
    right: 10px;
  }
  
  .control-btn {
    padding: 8px 12px;
    font-size: 12px;
  }
}

/* 更小的屏幕 */
@media (max-width: 768px) {
  .logo {
    font-size: 18px;
  }
  
  .user-name {
    display: none; /* 小屏幕隐藏用户名 */
  }
  
  .nav-container {
    padding: 0 10px;
  }
}
</style>