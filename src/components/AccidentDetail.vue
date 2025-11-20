<template>
  <div class="accident-detail-container">
    <div class="header">
      <div class="nav-controls">
        <button @click="handleBack" class="back-btn">返回</button>
        <h1>事故详情</h1>
      </div>
      <div class="user-info">
        <router-link v-if="currentUser" :to="{ name: 'UserInfo', params: { id: currentUser.id } }" class="user-link">
          <span>欢迎，{{ currentUser?.uname }}！</span>
        </router-link>
        <router-link v-if="currentUser" :to="{ name: 'UserInfo', params: { id: currentUser.id } }" class="user-info-btn">
          <span>个人信息</span>
        </router-link>
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
        <button @click="fetchAccidentDetail" class="retry-btn">重试</button>
      </div>
      
      <!-- 事故详情 -->
      <div v-else-if="accident" class="accident-detail">
        <!-- 基本信息卡片 -->
        <div class="info-card">
          <div class="card-header">
            <h2>{{ accident.accidentDescriptionText || '未命名事故' }}</h2>
            <span :class="['accident-state', accident.accidentDescriptionState]">
              {{ accident.accidentDescriptionState }}
            </span>
          </div>
          
          <div class="accident-media">
            <div class="media-content">
              <div class="image-container">
                <img :src="accident.imageUrl" :alt="accident.accidentDescription" class="accident-image" />
              </div>
            </div>
          </div>
          
          <div class="detail-info">
            <div class="info-row">
              <span class="info-label">事故ID:</span>
              <span class="info-value">{{ accident.id }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">发生时间:</span>
              <span class="info-value">{{ formatDate(accident.accidentDescriptionTime) }}</span>
            </div>
            <div class="info-row" v-if="accident.videoUrl">
              <span class="info-label">视频文件:</span>
              <button @click="downloadVideo" class="download-btn">下载视频</button>
            </div>
          </div>
        </div>
        
        <!-- 详细描述卡片 -->
        <div class="description-card">
          <h3>详细描述</h3>
          <div class="description-content">
            {{ accident.accidentDescription || '暂无详细描述' }}
          </div>
        </div>
        

      </div>
      
      <!-- 未找到 -->
      <div v-else class="not-found">
        <div class="not-found-icon">🔍</div>
        <h3>事故不存在</h3>
        <p>找不到指定的事故信息</p>
        <button @click="handleBack" class="back-to-list-btn">返回列表</button>
      </div>
    </div>
    

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { accidentApi } from '../services/api'

// 路由和响应式数据
const route = useRoute()
const router = useRouter()
const isLoading = ref(true)
const error = ref('')
const accident = ref<any>(null)

// 获取事故ID
const accidentId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? parseInt(id, 10) : id
})

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
    minute: '2-digit',
    second: '2-digit'
  })
}

// 返回上一页
const handleBack = () => {
  router.push('/accidents')
}

// 退出登录
const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

// 获取事故详情
const fetchAccidentDetail = async () => {
  if (!accidentId.value) {
    error.value = '无效的事故ID'
    isLoading.value = false
    return
  }
  
  isLoading.value = true
  error.value = ''
  
  try {
    // 确保accidentId是数字类型
    const numericAccidentId = Number(accidentId.value)
    if (isNaN(numericAccidentId)) {
      error.value = '无效的事故ID'
      isLoading.value = false
      return
    }
    const result = await accidentApi.getAccidentById(numericAccidentId)
    if (result && result.code === 200) {
      accident.value = result.data
    } else {
      error.value = result?.message || '获取事故详情失败'
    }
  } catch (err: any) {
    console.error('获取事故详情失败:', err)
    error.value = err?.message || '网络错误，请稍后重试'
  } finally {
    isLoading.value = false
  }
}



// 下载视频
const downloadVideo = () => {
  if (!accident.value?.videoUrl) return
  
  const link = document.createElement('a')
  link.href = accident.value.videoUrl
  link.download = `accident-${accident.value.id}.mp4`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}



// 组件挂载时获取数据
onMounted(() => {
  fetchAccidentDetail()
})
</script>

<style scoped>
.accident-detail-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.user-link {
  color: #1976d2;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.user-link:hover {
  color: #1565c0;
  text-decoration: underline;
  cursor: pointer;
}

.user-info-btn {
  padding: 8px 16px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  text-decoration: none;
  font-size: 14px;
  margin: 0 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.user-info-btn:hover {
  background-color: #1565c0;
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
  border-top: 4px solid #667eea;
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
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.retry-btn:hover,
.back-to-list-btn:hover {
  background-color: #764ba2;
}

/* 事故详情卡片样式 */
.accident-detail {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-card,
.description-card,
.display-info-card {
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

.card-header h2,
.card-header h3 {
  margin: 0;
  color: #333;
}

.card-header h2 {
  font-size: 1.6rem;
  font-weight: 700;
  flex: 1;
  margin-right: 1rem;
}

.card-header h3 {
  font-size: 1.3rem;
  font-weight: 600;
}

.accident-state {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 600;
  background-color: #e9ecef;
  color: #495057;
  white-space: nowrap;
}

.accident-state[class*="严重"] {
  background-color: #f8d7da;
  color: #721c24;
}

.accident-state[class*="已处理"] {
  background-color: #d4edda;
  color: #155724;
}

/* 媒体展示区域 */
.accident-media {
  margin-bottom: 1.5rem;
}

/* 媒体展示区域 */
.accident-media {
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

.accident-image {
  max-width: 100%;
  max-height: 500px;
  object-fit: contain;
}

/* 详细信息 */
.detail-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

.download-btn {
  padding: 0.4rem 1rem;
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
}

.download-btn:hover {
  background-color: #764ba2;
}

/* 描述内容 */
.description-content {
  line-height: 1.8;
  color: #444;
  white-space: pre-wrap;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  max-width: 100%;
  word-break: break-word;
  box-sizing: border-box;
}

/* 事故详情卡片样式增强 */
.info-card {
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  word-break: break-word;
}

.description-card {
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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