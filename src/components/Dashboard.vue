<template>
  <div class="dashboard-container">
    <!-- 头部导航 -->
    <DashboardHeader
      :active-tab="activeTab"
      :user-avatar="userAvatar"
      :user-name="userName"
      @tab-change="setActiveTab"
    />

    <!-- 调试面板 - 已隐藏 -->
    <div 
      v-if="false" 
      class="debug-panel"
      style="position: fixed; top: 70px; right: 20px; background: white; padding: 10px; border: 1px solid #ccc; z-index: 1000; font-size: 12px; max-width: 300px;"
    >
      <!-- 调试控制台已隐藏 -->
    </div>

    <!-- 主内容区域 -->
    <div class="main-container">
      <!-- 地图区域 -->
      <MapView
        :map-image="mapImage"
        :scale="scale"
        :offset-x="offsetX"
        :offset-y="offsetY"
        @update:scale="updateScale"
        @update:offset-x="updateOffsetX"
        @update:offset-y="updateOffsetY"
        @zoom-in="zoomIn"
        @zoom-out="zoomOut"
        @reset-view="resetView"
        @test-marker-click="handleTestMarkerClick"
      >
        <!-- 障碍物标记点 - 使用默认插槽 -->
        <ObstacleMarker
          v-for="obstacle in obstacles"
          :key="obstacle.id"
          :obstacle="obstacle"
          @click="handleMarkerClick"
          :show-time="true"
        />
      </MapView>

      <!-- 右侧信息面板 -->
      <InfoPanel :active-tab="activeTab" @tab-change="setActiveTab">
        <!-- 坐标信息标签页 -->
        <template #coordinates-tab>
          <CoordinatesTab
            :current-coordinate="currentCoordinate"
            :selected-obstacle-type="selectedObstacleType"
            @update:selected-obstacle-type="selectedObstacleType = $event"
            @confirm-mark="confirmMark"
            @generate-mock="generateMockObstacle"
            @clear-all-markers="clearAllMarkers"
          />
        </template>

        <!-- 检测记录标签页 -->
        <template #detections-tab>
          <DetectionsTab
            :obstacles="obstacles"
            :selected-obstacle-id="selectedObstacleId"
            @view-detection-detail="viewDetectionDetail"
          />
        </template>

        <!-- 用户信息标签页 -->
        <template #user-tab>
          <UserTab
            :user-avatar="userAvatar"
            :user-name="userName"
            :user-email="userEmail"
            :stats="stats"
            @logout="handleLogout"
          />
        </template>
      </InfoPanel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject, type Ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { obstacleApi } from '../services/api'
import type { Obstacle, ObstacleStats, SafeObstacle } from '../types/api'

// 导入子组件
import DashboardHeader from './dashboard/DashboardHeader.vue'
import MapView from './dashboard/MapView.vue'                  
import InfoPanel from './dashboard/InfoPanel.vue'            
import ObstacleMarker from './dashboard/markers/ObstacleMarker.vue'
import CoordinatesTab from './dashboard/tabs/CoordinatesTab.vue'   
import DetectionsTab from './dashboard/tabs/DetectionsTab.vue'      
import UserTab from './dashboard/tabs/UserTab.vue'

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

// 当前选中的坐标和障碍物
const currentCoordinate = ref({
  longitude: '116.3974',
  latitude: '39.9093',
  area: '跑道A区',
  detectionTime: '14:30',
  image: '',
  type: 'stone' as 'stone' | 'trash'
})

const selectedObstacleType = ref<'stone' | 'trash'>('stone')
const selectedObstacleId = ref<number | null>(null)

const router = useRouter()

// 注入全局用户状态
const currentUser = inject<Ref<any>>('currentUser', ref(null))

// 计算属性
const userName = computed(() => currentUser.value?.uname || currentUser.value?.username || '未登录')
const userAvatar = computed(() => userName.value.charAt(0) || '用')
const userEmail = computed(() => currentUser.value?.email || `${userName.value}@airport.com`)

// 辅助函数：将可选的 Obstacle 转换为安全的 SafeObstacle
const getSafeObstacle = (obstacle: Obstacle): SafeObstacle => {
  // 确保 coordinates 存在
  const coordinates = obstacle.coordinates || { latitude: 39.9093, longitude: 116.3974 }
  
  return {
    id: obstacle.id,
    imageUrl: obstacle.imageUrl || '/detection1.jpg',
    location: obstacle.location || '未知区域',
    type: obstacle.type || 'stone',
    height: obstacle.height || 10,
    distance: obstacle.distance || 100,
    riskLevel: obstacle.riskLevel || 'medium',
    status: obstacle.status || 'pending',
    detectionTime: obstacle.detectionTime || new Date().toISOString(),
    coordinates: coordinates,
    description: obstacle.description || '检测到的障碍物',
    createTime: obstacle.createTime,
    updateTime: obstacle.updateTime,
    mapPosition: obstacle.mapPosition || { top: 50, left: 50 }
  }
}

// 地图操作方法
const updateScale = (newScale: number) => {
  scale.value = newScale
}

const updateOffsetX = (newOffsetX: number) => {
  offsetX.value = newOffsetX
}

const updateOffsetY = (newOffsetY: number) => {
  offsetY.value = newOffsetY
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

// 标记点点击
const handleMarkerClick = (obstacle: Obstacle) => {
  const safeObstacle = getSafeObstacle(obstacle)
  selectedObstacleId.value = safeObstacle.id
  const detectionTime = formatTime(safeObstacle.detectionTime)
  
  currentCoordinate.value = {
    longitude: safeObstacle.coordinates.longitude.toString(),
    latitude: safeObstacle.coordinates.latitude.toString(),
    area: safeObstacle.location,
    detectionTime: detectionTime,
    image: safeObstacle.imageUrl,
    type: safeObstacle.type
  }
  activeTab.value = 'coordinates'
}

// 查看检测详情 - 修复：确保参数类型正确
const viewDetectionDetail = (obstacle: Obstacle) => {
  const safeObstacle = getSafeObstacle(obstacle)
  selectedObstacleId.value = safeObstacle.id
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

// 获取障碍物数据
const fetchObstacles = async () => {
  try {
    console.log('开始获取障碍物数据...');
    const result = await obstacleApi.getObstacles(1, 50);
    console.log('API响应:', result);
    
    if (result.code === 200 && result.data?.records?.length > 0) {
      const obstaclesData = result.data.records || [];
      console.log('从API获取到的障碍物数据:', obstaclesData.length, '条');
      
      obstacles.value = obstaclesData.map((obstacle: Obstacle, index: number) => {
        const mapPosition = obstacle.mapPosition || {
          top: 20 + (index * 15) % 70,
          left: 30 + (index * 20) % 60
        };
        return {
          ...obstacle,
          mapPosition
        };
      });
    } else {
      console.log('API返回空数据，使用初始模拟数据...');
      useInitialMockData();
    }
  } catch (error) {
    console.error('获取障碍物数据失败，使用模拟数据:', error);
    useInitialMockData();
  }
}

// 初始模拟数据函数
const useInitialMockData = () => {
  const mockObstacle: Obstacle = {
    id: 1,
    imageUrl: '/detection1.jpg',
    location: '跑道1-区域3',
    type: 'stone',
    height: 15,
    distance: 200,
    riskLevel: 'medium',
    status: 'pending',
    detectionTime: new Date().toISOString(),
    coordinates: { latitude: 39.9093, longitude: 116.3974 },
    description: '检测到的石子障碍物',
    mapPosition: { top: 20.5, left: 65 }
  };
  
  obstacles.value = [mockObstacle];
  console.log('初始模拟数据设置完成:', obstacles.value);
  
  if (obstacles.value.length > 0 && obstacles.value[0]) {
    handleMarkerClick(getSafeObstacle(obstacles.value[0]));
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
    stats.value = {
      totalObstacles: 1,
      highRiskObstacles: 0,
      resolvedObstacles: 0,
      pendingObstacles: 1,
      detectionRate: 95.5
    }
  }
}

// 格式化时间为 HH:mm
const formatTime = (dateString: string) => {
  if (!dateString) return '--:--'
  const date = new Date(dateString)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 模拟数据生成函数
const generateMockObstacle = () => {
  const runwayRanges = [
    { name: '跑道1', top: [20, 21] as [number, number], left: [40, 80] as [number, number] },
    { name: '跑道2', top: [43, 44] as [number, number], left: [40, 82] as [number, number] },
    { name: '跑道3', top: [73.5, 74.5] as [number, number], left: [26, 56] as [number, number] }
  ]

  const randomRunwayIndex = Math.floor(Math.random() * runwayRanges.length)
  const selectedRunway = runwayRanges[randomRunwayIndex]

  if (!selectedRunway) {
    console.error('跑道选择失败')
    alert('生成模拟数据失败：跑道选择错误')
    return
  }

  const randomTop = selectedRunway.top[0] + Math.random() * (selectedRunway.top[1] - selectedRunway.top[0])
  const randomLeft = selectedRunway.left[0] + Math.random() * (selectedRunway.left[1] - selectedRunway.left[0])

  const obstacleTypes: Array<'stone' | 'trash'> = ['stone', 'trash']
  const riskLevels: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high']
  const statuses: Array<'pending' | 'confirmed' | 'resolved'> = ['pending', 'confirmed', 'resolved']
  
  const randomType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)]
  const randomRisk = riskLevels[Math.floor(Math.random() * riskLevels.length)]
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]

  const maxId = obstacles.value.length > 0 
    ? Math.max(...obstacles.value.map(o => o.id)) 
    : 0
  const newId = maxId + 1

  const baseLongitude = 116.3974
  const baseLatitude = 39.9093
  
  const now = new Date()
  const detectionTime = now.toISOString()
  
  const mockObstacle: Obstacle = {
    id: newId,
    imageUrl: '/detection1.jpg',
    location: `${selectedRunway.name}-区域${Math.floor(Math.random() * 5) + 1}`,
    type: randomType,
    height: Math.floor(Math.random() * 30) + 5,
    distance: Math.floor(Math.random() * 500) + 50,
    riskLevel: randomRisk,
    status: randomStatus,
    detectionTime: detectionTime,
    coordinates: { 
      latitude: baseLatitude + (randomTop - 50) * 0.001,
      longitude: baseLongitude + (randomLeft - 50) * 0.001
    },
    description: `检测到${randomType === 'stone' ? '石子' : '垃圾'}障碍物`,
    mapPosition: { 
      top: parseFloat(randomTop.toFixed(2)), 
      left: parseFloat(randomLeft.toFixed(2))
    }
  }

  console.log(`生成模拟障碍物:`, mockObstacle)
  obstacles.value = [...obstacles.value, mockObstacle]
  handleMarkerClick(getSafeObstacle(mockObstacle))
  
  const displayTime = formatTime(detectionTime)
  alert(`已成功生成模拟障碍物！\n位置：${selectedRunway.name}\n时间：${displayTime}\n种类：${randomType === 'stone' ? '石子' : '垃圾'}`)
}

// 清除所有标记点
const clearAllMarkers = () => {
  if (obstacles.value.length === 0) {
    alert('当前没有标记点可清除')
    return
  }
  
  if (confirm(`确定要清除所有 ${obstacles.value.length} 个标记点吗？`)) {
    obstacles.value = []
    console.log('已清除所有标记点')
    
    currentCoordinate.value = {
      longitude: '0',
      latitude: '0',
      area: '无',
      detectionTime: '--:--',
      image: '',
      type: 'stone'
    }
    
    alert('已清除所有标记点')
  }
}

// 组件挂载时获取数据
onMounted(() => {
  isLoading.value = true
  Promise.all([fetchObstacles(), fetchStats()]).finally(() => {
    isLoading.value = false
  })
})

// 监控障碍物数据变化
watch(obstacles, (newVal) => {
  console.log('障碍物数量:', newVal.length)
  newVal.forEach((obstacle, index) => {
    const safeObstacle = getSafeObstacle(obstacle)
    console.log(`障碍物 ${index + 1} (ID: ${obstacle.id}):`, {
      位置: safeObstacle.mapPosition,
      类型: safeObstacle.type === 'stone' ? '石子' : '垃圾',
      风险等级: safeObstacle.riskLevel
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

.main-container {
  display: flex;
  flex: 1;
  height: calc(100vh - 60px);
}

@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
  }
  
  .debug-panel {
    display: none;
  }
}

.btn-simulate {
  background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s, transform 0.2s;
  font-weight: bold;
}

.btn-simulate:hover {
  background: linear-gradient(135deg, #66BB6A 0%, #388E3C 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-simulate:active {
  transform: translateY(0);
}
</style>