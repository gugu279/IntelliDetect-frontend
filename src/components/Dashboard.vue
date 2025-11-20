<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1>事故管理系统</h1>
      <div class="user-welcome">
          <!-- 正确访问Ref对象中的用户名 -->
          <span>欢迎，{{ currentUser?.value?.uname || '' }}！</span>
          <button @click="handleLogout" class="logout-btn">退出登录</button>
        </div>
    </div>
    
    <div class="dashboard-content">
      <!-- 统计卡片区域 -->
      <div class="stats-cards">
        <div class="stat-card total">
          <div class="stat-icon">🚨</div>
          <div class="stat-content">
            <h3>总事故数</h3>
            <p class="stat-number">{{ stats.totalAccidents || 0 }}</p>
          </div>
        </div>
        
        <div class="stat-card severe">
          <div class="stat-icon">⚠️</div>
          <div class="stat-content">
            <h3>严重事故</h3>
            <p class="stat-number">{{ stats.criticalAccidents || 0 }}</p>
          </div>
        </div>
        
        <div class="stat-card today">
          <div class="stat-icon">📅</div>
          <div class="stat-content">
            <h3>今日新增</h3>
            <p class="stat-number">{{ stats.todayAccidents || 0 }}</p>
          </div>
        </div>
      </div>
      
      <!-- 快捷操作区域 -->
      <div class="quick-actions">
        <h2>快捷操作</h2>
        <div class="action-buttons">
          <router-link to="/accidents" class="action-btn">
            <div class="action-icon">📋</div>
            <span>查看事故列表</span>
          </router-link>
          

          
          <router-link v-if="currentUser" :to="{ name: 'UserInfo', params: { id: currentUser.id } }" class="action-btn">
            <div class="action-icon">👤</div>
            <span>个人信息</span>
          </router-link>
        </div>
      </div>
      
      <!-- 最近事故预览 -->
      <div class="recent-accidents">
        <div class="section-header">
          <h2>最近事故</h2>
          <router-link to="/accidents" class="view-all">查看全部</router-link>
        </div>
        
        <div v-if="recentAccidents.length > 0" class="accident-list">
          <div 
            v-for="accident in recentAccidents" 
            :key="accident.id" 
            class="accident-item"
            @click="viewAccidentDetail(accident.id)"
          >
            <div class="accident-preview">
              <img :src="accident.imageUrl" :alt="accident.accidentDescription" />
            </div>
            <div class="accident-info">
              <h4>{{ accident.accidentDescriptionText || '未命名事故' }}</h4>
              <p class="accident-time">{{ formatDate(accident.accidentDescriptionTime) }}</p>
              <span :class="['accident-state', accident.accidentDescriptionState]">
                {{ accident.accidentDescriptionState }}
              </span>
            </div>
          </div>
        </div>
        
        <div v-else class="no-data">
          <p>暂无事故记录</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { accidentApi } from '../services/api'

// 响应式数据
const isLoading = ref(false)
const stats = ref({
  totalAccidents: 0,
  criticalAccidents: 0,
  todayAccidents: 0,
  accidentRate: 0
})
const recentAccidents = ref<any[]>([])
const router = useRouter()

// 注入全局用户状态
const currentUser = inject<Ref<any>>('currentUser', ref(null))

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

// 退出登录
const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}



// 查看事故详情
const viewAccidentDetail = (id: number) => {
  router.push({ name: 'AccidentDetail', params: { id } })
}

// 获取统计数据
  const fetchStats = async () => {
    try {
      const result = await accidentApi.getAccidentStats()
      if (result.code === 200) {
        // 映射API返回的数据到修改后的属性名
        stats.value = {
          totalAccidents: result.data.totalAccidents || 0,
          criticalAccidents: result.data.resolvedAccidents || 0, // 使用resolvedAccidents数据作为criticalAccidents
          todayAccidents: result.data.pendingAccidents || 0, // 使用pendingAccidents数据作为todayAccidents
          accidentRate: result.data.accidentRate || 0
        }
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
    }
  }

  // 获取最近事故
  const fetchRecentAccidents = async () => {
    try {
      const result = await accidentApi.getAccidents(1, 5)
      if (result.code === 200) {
        // 获取事故列表并按时间降序排序（最新的在上面）
        const accidents = result.data.records || []
        recentAccidents.value = accidents.sort((a: any, b: any) => {
          const dateA = new Date(a.accidentDescriptionTime || 0).getTime()
          const dateB = new Date(b.accidentDescriptionTime || 0).getTime()
          return dateB - dateA // 降序排序
        })
      }
    } catch (error) {
      console.error('获取最近事故失败:', error)
    }
  }

// 组件挂载时获取数据
onMounted(() => {
  isLoading.value = true
  Promise.all([fetchStats(), fetchRecentAccidents()]).finally(() => {
    isLoading.value = false
  })
})
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.dashboard-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.dashboard-header h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
}

.user-welcome {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-welcome span {
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

.dashboard-content {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* 统计卡片样式 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.stat-card.total {
  border-left: 4px solid #667eea;
}

.stat-card.severe {
  border-left: 4px solid #f0ad4e;
}

.stat-card.today {
  border-left: 4px solid #5cb85c;
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-content h3 {
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-number {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #333;
}

/* 快捷操作样式 */
.quick-actions {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
}

.quick-actions h2 {
  margin: 0 0 1.5rem 0;
  color: #333;
  font-size: 1.3rem;
  font-weight: 600;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.action-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.action-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.action-btn span {
  font-size: 1rem;
  font-weight: 500;
}

/* 最近事故样式 */
.recent-accidents {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.3rem;
  font-weight: 600;
}

.view-all {
  color: #667eea;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.3s ease;
}

.view-all:hover {
  color: #764ba2;
  text-decoration: underline;
}

.accident-list {
  display: grid;
  gap: 1rem;
}

.accident-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.accident-item:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.accident-preview {
  flex-shrink: 0;
  width: 100px;
  height: 100px;
  border-radius: 6px;
  overflow: hidden;
}

.accident-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.accident-info {
  flex: 1;
  min-width: 0;
  padding: 0.5rem;
  word-break: break-word;
}

.accident-info h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  display: -webkit-box;
  line-clamp: 2;
-webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.accident-time {
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
}

.accident-state {                                                                                           
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  background-color: #e9ecef;
  color: #495057;
}

.accident-state[class*="严重"] {
  background-color: #f8d7da;
  color: #721c24;
}

.accident-state[class*="已处理"] {
  background-color: #d4edda;
  color: #155724;
}

.no-data {
  text-align: center;
  padding: 3rem;
  color: #999;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .dashboard-content {
    padding: 1rem;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    grid-template-columns: 1fr;
  }
  
  .accident-item {
    flex-direction: column;
  }
  
  .accident-preview {
    width: 100%;
    height: 200px;
  }
}
</style>