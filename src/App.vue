<script setup lang="ts">
import { onMounted, ref, computed, provide } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentUser = ref<any>(null)
const isLoggedIn = computed(() => !!localStorage.getItem('token') && !!currentUser.value)

// 提供全局用户状态给所有子组件
provide('currentUser', currentUser)
provide('isLoggedIn', isLoggedIn)

// 更新用户信息的函数
const updateCurrentUser = (userInfo: any) => {
  currentUser.value = userInfo
  if (userInfo) {
    localStorage.setItem('user', JSON.stringify(userInfo))
  }
}
provide('updateCurrentUser', updateCurrentUser)

// 组件挂载时检查登录状态
onMounted(() => {
  // 从本地存储获取登录状态
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  
  if (token && userStr && typeof userStr === 'string' && userStr.trim() !== '' && userStr.trim() !== 'undefined') {
    try {
      // 确保userStr是有效的JSON字符串
      const parsedUser = JSON.parse(userStr)
      // 验证解析后的数据结构
      if (parsedUser && typeof parsedUser === 'object') {
        currentUser.value = parsedUser
        // 如果用户对象没有uname字段但有username字段，进行转换
        if (!currentUser.value.uname && currentUser.value.username) {
          currentUser.value.uname = currentUser.value.username
          // 更新本地存储
          localStorage.setItem('user', JSON.stringify(currentUser.value))
        }
      }
    } catch (e) {
      console.error('解析用户信息失败:', e)
      // 清除无效的用户信息
      localStorage.removeItem('user')
      currentUser.value = null
    }
    router.push('/dashboard')
  } else {
    // 否则跳转到登录页
    router.push('/login')
  }
})

// 处理退出登录
const handleLogout = () => {
  // 清除本地存储中的登录信息
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  currentUser.value = null
  // 跳转到登录页
  router.push('/login')
}
</script>

<template>
  <div class="app-container">
    <!-- 全局导航栏 -->
    <header class="main-header" v-if="isLoggedIn">
      <div class="header-content">
        <div class="logo-section">
          <router-link to="/dashboard" class="logo-link">
            <h1>IntelliDetect</h1>
          </router-link>
        </div>
        <nav class="main-nav">
          <router-link to="/dashboard" class="nav-link">仪表盘</router-link>
        </nav>
        <div class="user-section">
          <router-link v-if="currentUser" :to="{ name: 'UserInfo', params: { id: currentUser.id } }" class="global-user-btn">
            <span>👤 {{ currentUser.uname || currentUser.username || '' }}</span>
          </router-link>
          <button @click="handleLogout" class="logout-btn">退出登录</button>
        </div>
      </div>
    </header>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f7fa;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 通用动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

/* 应用容器样式 */
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 全局导航栏样式 */
.main-header {
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  padding: 1rem 0;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-section .logo-link {
  color: #1976d2;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.5rem;
}

.main-nav {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: #333;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  padding: 0.5rem 0;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #1976d2;
  border-bottom-color: #1976d2;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.global-user-btn {
  padding: 0.75rem 1.5rem;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 6px;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.global-user-btn:hover {
  background-color: #1565c0;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

.logout-btn {
  padding: 0.75rem 1.5rem;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background-color: #d32f2f;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* 通用按钮样式 */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-success:hover {
  background-color: #218838;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* 通用卡片样式 */
.card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

/* 通用表单样式 */
.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 1.5rem;
}
</style>
