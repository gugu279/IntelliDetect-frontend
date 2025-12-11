<template>
  <div class="dashboard-container">
    <!-- 头部导航 -->
    <DashboardHeader
      :active-tab="activeTab"
      :user-avatar="userAvatar"
      :user-name="userName"
      @tab-change="setActiveTab"
    />

<<<<<<< HEAD
    <!-- 调试面板 - 已隐藏 -->
    <div 
      v-if="false" 
      class="debug-panel"
      style="position: fixed; top: 70px; right: 20px; background: white; padding: 10px; border: 1px solid #ccc; z-index: 1000; font-size: 12px; max-width: 300px;"
    >
      <!-- 调试控制台已隐藏 -->
=======
    <!-- 调试面板 -->
    <div class="debug-panel" style="position: fixed; top: 70px; right: 20px; background: white; padding: 10px; border: 1px solid #ccc; z-index: 1000; font-size: 12px; max-width: 300px;">
      <div><strong>调试控制台</strong></div>
      <div>障碍物数量: {{ obstacles.length }}</div>
      <div v-for="obstacle in obstacles.slice(0, 3)" :key="obstacle.id">
        #{{ obstacle.id }}: {{ obstacle.location }} ({{ obstacle.mapPosition?.top }}%, {{ obstacle.mapPosition?.left }}%)
      </div>
      <div v-if="obstacles.length === 0">没有障碍物数据</div>
      <div v-else-if="obstacles.length > 3">... 还有 {{ obstacles.length - 3 }} 个障碍物</div>
      
      <!-- 添加调试按钮 -->
      <div style="margin-top: 10px;">
        <button @click="generateMockObstacle" style="margin-right: 5px; padding: 4px 8px; font-size: 11px;">
          模拟一个
        </button>
        <button @click="clearMockData" style="margin-right: 5px; padding: 4px 8px; font-size: 11px;">
          清除全部
        </button>
        <button @click="generateMultipleMockObstacles(5)" style="padding: 4px 8px; font-size: 11px;">
          模拟5个
        </button>
      </div>
      
      <!-- 显示控制变量 -->
      <div style="margin-top: 10px;">
        <div>模拟数量: <input v-model.number="simulationCount" type="number" style="width: 50px; font-size: 11px;"></div>
        <button @click="generateMultipleMockObstacles(simulationCount)" style="margin-top: 5px; padding: 4px 8px; font-size: 11px; width: 100%;">
          模拟 {{ simulationCount }} 个
        </button>
      </div>
>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
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
<<<<<<< HEAD
          :show-time="true"
=======
          :show-position="true"
>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
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
<<<<<<< HEAD
            @clear-all-markers="clearAllMarkers"
=======
>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
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
<<<<<<< HEAD
import type { Obstacle, ObstacleStats, SafeObstacle } from '../types/api'
=======
import type { Obstacle, ObstacleStats } from '../types/api'
>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65

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
<<<<<<< HEAD
  detectionTime: '14:30',
  image: '',
  type: 'stone' as 'stone' | 'trash'
})

const selectedObstacleType = ref<'stone' | 'trash'>('stone')
=======
  detectionTime: '2024-01-15 14:30:25',
  image: ''
})

const selectedObstacleType = ref<'building' | 'crane' | 'tree' | 'equipment' | 'other'>('building')
>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
const selectedObstacleId = ref<number | null>(null)

const router = useRouter()

// 注入全局用户状态
const currentUser = inject<Ref<any>>('currentUser', ref(null))

<<<<<<< HEAD
=======
// 控制变量
const simulationCount = ref(3);

>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
// 计算属性
const userName = computed(() => currentUser.value?.uname || currentUser.value?.username || '未登录')
const userAvatar = computed(() => userName.value.charAt(0) || '用')
const userEmail = computed(() => currentUser.value?.email || `${userName.value}@airport.com`)

<<<<<<< HEAD
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

=======
>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
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
<<<<<<< HEAD
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
=======
  selectedObstacleId.value = obstacle.id
  currentCoordinate.value = {
    longitude: obstacle.coordinates?.longitude?.toString() ?? '0',
    latitude: obstacle.coordinates?.latitude?.toString() ?? '0',
    area: obstacle.location || '未知区域',
    detectionTime: formatDate(obstacle.detectionTime),
    image: obstacle.imageUrl || ''
>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
  }
  activeTab.value = 'coordinates'
}

<<<<<<< HEAD
// 查看检测详情 - 修复：确保参数类型正确
const viewDetectionDetail = (obstacle: Obstacle) => {
  const safeObstacle = getSafeObstacle(obstacle)
  selectedObstacleId.value = safeObstacle.id
  handleMarkerClick(obstacle)
}
=======
// 查看检测详情
const viewDetectionDetail = (obstacle: Obstacle) => {
  selectedObstacleId.value = obstacle.id
  handleMarkerClick(obstacle)
}

>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
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
      
<<<<<<< HEAD
      obstacles.value = obstaclesData.map((obstacle: Obstacle, index: number) => {
=======
      // 为障碍物添加地图位置（如果API没有提供）
      obstacles.value = obstaclesData.map((obstacle: Obstacle, index: number) => {
        // 如果API返回的数据已经有mapPosition，使用它
        // 否则使用模拟位置
>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
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
<<<<<<< HEAD
=======
      // API返回空数据或失败时，使用初始模拟数据
>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
      console.log('API返回空数据，使用初始模拟数据...');
      useInitialMockData();
    }
  } catch (error) {
    console.error('获取障碍物数据失败，使用模拟数据:', error);
<<<<<<< HEAD
=======
    // API失败时，使用初始模拟数据
>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
    useInitialMockData();
  }
}

// 初始模拟数据函数
const useInitialMockData = () => {
<<<<<<< HEAD
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
=======
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
      mapPosition: { top: 30, left: 30 }
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
  ];
  
  obstacles.value = mockObstacles;
  console.log('初始模拟数据设置完成:', obstacles.value);
  
  if (obstacles.value.length > 0 && obstacles.value[0]) {
    handleMarkerClick(obstacles.value[0]);
>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
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
<<<<<<< HEAD
    stats.value = {
      totalObstacles: 1,
      highRiskObstacles: 0,
      resolvedObstacles: 0,
      pendingObstacles: 1,
=======
    // 模拟数据
    stats.value = {
      totalObstacles: 5,
      highRiskObstacles: 2,
      resolvedObstacles: 2,
      pendingObstacles: 3,
>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
      detectionRate: 95.5
    }
  }
}

<<<<<<< HEAD
// 格式化时间为 HH:mm
const formatTime = (dateString: string) => {
  if (!dateString) return '--:--'
  const date = new Date(dateString)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 模拟数据生成函数
const generateMockObstacle = () => {
=======
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

// 模拟数据生成函数 - 修复版本
const generateMockObstacle = () => {
  // 定义三个跑道的范围（根据你提供的参数）
>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
  const runwayRanges = [
    { name: '跑道1', top: [20, 21] as [number, number], left: [40, 80] as [number, number] },
    { name: '跑道2', top: [43, 44] as [number, number], left: [40, 82] as [number, number] },
    { name: '跑道3', top: [73.5, 74.5] as [number, number], left: [26, 56] as [number, number] }
  ]

<<<<<<< HEAD
=======
  // 随机选择一个跑道
>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
  const randomRunwayIndex = Math.floor(Math.random() * runwayRanges.length)
  const selectedRunway = runwayRanges[randomRunwayIndex]

  if (!selectedRunway) {
<<<<<<< HEAD
    console.error('跑道选择失败')
=======
    console.error('跑道选择失败，selectedRunway 为 undefined')
>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
    alert('生成模拟数据失败：跑道选择错误')
    return
  }

<<<<<<< HEAD
  const randomTop = selectedRunway.top[0] + Math.random() * (selectedRunway.top[1] - selectedRunway.top[0])
  const randomLeft = selectedRunway.left[0] + Math.random() * (selectedRunway.left[1] - selectedRunway.left[0])

  const obstacleTypes: Array<'stone' | 'trash'> = ['stone', 'trash']
  const riskLevels: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high']
  const statuses: Array<'pending' | 'confirmed' | 'resolved'> = ['pending', 'confirmed', 'resolved']
  
=======
  // 在选定跑道范围内生成随机位置
  const randomTop = selectedRunway.top[0] + Math.random() * (selectedRunway.top[1] - selectedRunway.top[0])
  const randomLeft = selectedRunway.left[0] + Math.random() * (selectedRunway.left[1] - selectedRunway.left[0])

  // 障碍物类型和风险等级选项
  const obstacleTypes: Array<Obstacle['type']> = ['building', 'crane', 'tree', 'equipment', 'other']
  const riskLevels: Array<Obstacle['riskLevel']> = ['high', 'medium', 'low']
  const statuses: Array<Obstacle['status']> = ['pending', 'confirmed', 'resolved']
  
  // 随机选择类型和风险等级
>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
  const randomType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)]
  const randomRisk = riskLevels[Math.floor(Math.random() * riskLevels.length)]
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]

<<<<<<< HEAD
=======
  // 生成障碍物ID（使用当前最大ID+1）
>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
  const maxId = obstacles.value.length > 0 
    ? Math.max(...obstacles.value.map(o => o.id)) 
    : 0
  const newId = maxId + 1

<<<<<<< HEAD
  const baseLongitude = 116.3974
  const baseLatitude = 39.9093
  
  const now = new Date()
  const detectionTime = now.toISOString()
  
=======
  // 根据跑道和随机位置生成对应的经纬度
  const baseLongitude = 116.3974
  const baseLatitude = 39.9093
  
  // 创建新的模拟障碍物对象 - 类型完全匹配 Obstacle 接口
>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
  const mockObstacle: Obstacle = {
    id: newId,
    imageUrl: '/detection1.jpg',
    location: `${selectedRunway.name}-区域${Math.floor(Math.random() * 5) + 1}`,
    type: randomType,
    height: Math.floor(Math.random() * 30) + 5,
    distance: Math.floor(Math.random() * 500) + 50,
    riskLevel: randomRisk,
    status: randomStatus,
<<<<<<< HEAD
    detectionTime: detectionTime,
=======
    detectionTime: new Date().toISOString(),
>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
    coordinates: { 
      latitude: baseLatitude + (randomTop - 50) * 0.001,
      longitude: baseLongitude + (randomLeft - 50) * 0.001
    },
<<<<<<< HEAD
    description: `检测到${randomType === 'stone' ? '石子' : '垃圾'}障碍物`,
=======
    description: `模拟生成的${randomType === 'building' ? '建筑' : randomType === 'crane' ? '起重机' : randomType === 'tree' ? '树木' : randomType === 'equipment' ? '设备' : '其他'}障碍物`,
>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
    mapPosition: { 
      top: parseFloat(randomTop.toFixed(2)), 
      left: parseFloat(randomLeft.toFixed(2))
    }
  }

<<<<<<< HEAD
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
=======
  console.log(`生成模拟障碍物:`, {
    跑道: selectedRunway.name,
    位置: `top: ${mockObstacle.mapPosition?.top}%, left: ${mockObstacle.mapPosition?.left}%`,
    类型: mockObstacle.type,
    风险等级: mockObstacle.riskLevel
  })

  // 将新障碍物添加到现有障碍物列表
  obstacles.value = [...obstacles.value, mockObstacle]
  
  // 自动选中新生成的障碍物
  handleMarkerClick(mockObstacle)
  
  // 提示用户
  alert(`已成功生成模拟障碍物！\n位置：${selectedRunway.name}\n类型：${mockObstacle.type}\n风险等级：${mockObstacle.riskLevel}`)
}

// 批量生成函数（可选，用于一次性生成多个测试点）
const generateMultipleMockObstacles = (count = 5) => {
  for (let i = 0; i < count; i++) {
    // 使用setTimeout避免同时生成导致界面卡顿
    setTimeout(() => {
      generateMockObstacle()
    }, i * 100)
  }
}

// 清除模拟数据
const clearMockData = () => {
  if (confirm(`确定要清除所有 ${obstacles.value.length} 个模拟标记点吗？`)) {
    obstacles.value = []
    console.log('已清除所有模拟数据')
>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
  }
}

// 组件挂载时获取数据
onMounted(() => {
  isLoading.value = true
  Promise.all([fetchObstacles(), fetchStats()]).finally(() => {
    isLoading.value = false
  })
})

<<<<<<< HEAD
// 监控障碍物数据变化
watch(obstacles, (newVal) => {
  console.log('障碍物数量:', newVal.length)
  newVal.forEach((obstacle, index) => {
    const safeObstacle = getSafeObstacle(obstacle)
    console.log(`障碍物 ${index + 1} (ID: ${obstacle.id}):`, {
      位置: safeObstacle.mapPosition,
      类型: safeObstacle.type === 'stone' ? '石子' : '垃圾',
      风险等级: safeObstacle.riskLevel
=======
// 监控障碍物数据变化（可选，调试用）
watch(obstacles, (newVal) => {
  console.log('障碍物数量:', newVal.length)
  console.log('障碍物数据:', newVal)
  
  // 检查每个障碍物的 mapPosition
  newVal.forEach((obstacle, index) => {
    console.log(`障碍物 ${index + 1} (ID: ${obstacle.id}):`, {
      位置: obstacle.mapPosition,
      类型: obstacle.type,
      风险等级: obstacle.riskLevel
>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
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

<<<<<<< HEAD
=======
/* 主内容区域 */
>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
.main-container {
  display: flex;
  flex: 1;
  height: calc(100vh - 60px);
}

<<<<<<< HEAD
=======
/* 响应式设计 */
>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
  }
  
  .debug-panel {
    display: none;
  }
}

<<<<<<< HEAD
=======
/* 模拟按钮样式 */
>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
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