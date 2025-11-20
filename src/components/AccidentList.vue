<template>
  <div class="accident-list-container">
    <div class="header">
      <div class="header-left">
        <button @click="goBack" class="back-btn">
          <span>返回</span>
        </button>
        <h1>事故列表</h1>
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
      <!-- 搜索和筛选 -->
      <div class="search-filter">
        <div class="search-bar">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索事故描述..."
            class="search-input"
          />
          <button @click="handleSearch" class="search-btn">搜索</button>
        </div>
        <div class="filter-options">
          <!-- 已删除状态筛选和创建新事故功能 -->
        </div>
      </div>
      
      <!-- 事故列表 -->
      <div class="accident-grid">
        <div 
          v-for="accident in filteredAccidents" 
          :key="accident.id" 
          class="accident-card"
          @click="viewAccidentDetail(accident.id)"
        >
          <div class="accident-image">
            <img :src="accident.imageUrl" :alt="accident.accidentDescription" />
          </div>
          <div class="accident-details">
            <h3>{{ accident.accidentDescriptionText || '未命名事故' }}</h3>
            <p class="accident-time">{{ formatDate(accident.accidentDescriptionTime) }}</p>
            <div class="accident-meta">
              <span :class="['accident-state', accident.accidentDescriptionState]">
                {{ accident.accidentDescriptionState }}
              </span>

            </div>
            <p class="accident-preview-text">{{ truncateText(accident.accidentDescription, 100) }}</p>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="accidents.length === 0 && !isLoading" class="empty-state">
        <div class="empty-icon">📋</div>
        <h3>暂无事故记录</h3>
        <p>暂无可用的事故数据</p>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
      
      <!-- 分页控件 -->
      <div v-if="accidents.length > 0" class="pagination">
        <button 
          @click="changePage(page - 1)" 
          :disabled="page === 1"
          class="page-btn"
        >
          上一页
        </button>
        
        <div class="page-info">
          <span>第 {{ page }} 页 / 共 {{ totalPages }} 页</span>
          <span>共 {{ totalItems }} 条记录</span>
        </div>
        
        <button 
          @click="changePage(page + 1)" 
          :disabled="page === totalPages"
          class="page-btn"
        >
          下一页
        </button>
      </div>
    </div>
    

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { accidentApi } from '../services/api'

// 响应式数据
const isLoading = ref(false)
const accidents = ref<any[]>([])
const page = ref(1)
const size = ref(10)
const totalItems = ref(0)
const totalPages = ref(0)
const searchQuery = ref('')

const router = useRouter()

// 注入全局用户状态
const currentUser = inject<Ref<any>>('currentUser', ref(null))

// 过滤后的事故列表
const filteredAccidents = computed(() => {
  return accidents.value.filter(accident => {
    const matchesSearch = !searchQuery.value || 
      accident.accidentDescriptionText.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      accident.accidentDescription.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    return matchesSearch
  })
})

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

// 截断文本
const truncateText = (text: string, maxLength: number) => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 退出登录
const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

// 返回事故管理系统主页面
const goBack = () => {
  router.push('/dashboard')
}

// 查看事故详情
const viewAccidentDetail = (id: number) => {
  router.push({ name: 'AccidentDetail', params: { id } })
}



// 搜索
const handleSearch = () => {
  // 搜索逻辑可以在这里实现，现在只是简单的客户端过滤
  console.log('搜索:', searchQuery.value)
}

// 切换页面
const changePage = (newPage: number) => {
  if (newPage >= 1 && newPage <= totalPages.value) {
    page.value = newPage
    fetchAccidents()
  }
}

// 获取事故列表
const fetchAccidents = async () => {
  isLoading.value = true
  try {
    const result = await accidentApi.getAccidents(page.value, size.value)
    if (result.code === 200) {
      // 获取事故列表并按时间降序排序（最新的在上面）
      const fetchedAccidents = result.data.records || []
      accidents.value = fetchedAccidents.sort((a: any, b: any) => {
        const dateA = new Date(a.accidentDescriptionTime || 0).getTime()
        const dateB = new Date(b.accidentDescriptionTime || 0).getTime()
        return dateB - dateA // 降序排序
      })
      totalItems.value = result.data.total || 0
      totalPages.value = result.data.totalPages || result.data.pages || 0
    }
  } catch (error) {
    console.error('获取事故列表失败:', error)
    alert('获取事故列表失败，请稍后重试')
  } finally {
    isLoading.value = false
  }
}



// 组件挂载时获取数据
onMounted(() => {
  fetchAccidents()
})
</script>

<style scoped>
.accident-list-container {
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

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
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
  max-width: 1400px;
  margin: 0 auto;
}

/* 搜索和筛选样式 */
.search-filter {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-bar {
  display: flex;
  gap: 0.5rem;
  flex: 1;
  min-width: 300px;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-btn {
  padding: 0.75rem 1.5rem;
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.search-btn:hover {
  background-color: #764ba2;
}

.filter-options {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
  cursor: pointer;
}

.create-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: transform 0.3s ease;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* 事故列表样式 */
.accident-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.accident-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
}

.accident-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.accident-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.accident-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.accident-card:hover .accident-image img {
  transform: scale(1.05);
}

.accident-details {
  padding: 1.5rem;
}

.accident-details h3 {
  margin: 0 0 0.75rem 0;
  color: #333;
  font-size: 1.2rem;
  font-weight: 600;
}

.accident-time {
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 0.9rem;
}

.accident-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
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

.accident-preview-text {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
}

/* 空状态和加载状态 */
.empty-state,
.loading-state {
  text-align: center;
  padding: 4rem;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 分页样式 */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.page-btn {
  padding: 0.5rem 1rem;
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  background-color: #764ba2;
}

.page-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.page-info {
  display: flex;
  gap: 2rem;
  color: #666;
  font-size: 0.9rem;
}



/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .content {
    padding: 1rem;
  }
  
  .search-filter {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-bar {
    min-width: auto;
  }
  
  .filter-options {
    flex-direction: column;
    align-items: stretch;
  }
  
  .accident-grid {
    grid-template-columns: 1fr;
  }
  
  .pagination {
    flex-direction: column;
    gap: 1rem;
  }
  
  .page-info {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}
</style>