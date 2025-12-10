<template>
  <div class="user-info-container">
    <div class="user-header">
      <h1>个人信息管理</h1>
      <router-link to="/dashboard" class="back-btn">返回仪表盘</router-link>
    </div>

    <div class="user-content">
      <!-- 基本信息卡片 -->
      <div class="info-card">
        <h2>基本信息</h2>
        <form @submit.prevent="updateUserInfo" class="user-form">
          <div class="form-group">
            <label for="username">用户名</label>
            <input
              id="username"
              v-model="userForm.username"
              type="text"
              class="form-control"
              placeholder="请输入用户名"
            />
          </div>
          
          <div class="form-group">
            <label for="email">邮箱地址</label>
            <input
              id="email"
              v-model="userForm.email"
              type="email"
              class="form-control"
              placeholder="请输入邮箱地址"
            />
          </div>
          
          <div class="form-group">
            <label for="phone">手机号码</label>
            <input
              id="phone"
              v-model="userForm.phone"
              type="tel"
              class="form-control"
              placeholder="请输入手机号码"
            />
          </div>
          
          <button type="submit" class="btn btn-primary" :disabled="updating">
            {{ updating ? '更新中...' : '更新信息' }}
          </button>
        </form>
      </div>

      <!-- 修改密码卡片 -->
      <div class="info-card">
        <h2>修改密码</h2>
        <form @submit.prevent="updatePassword" class="user-form">
          <div class="form-group">
            <label for="currentPassword">当前密码</label>
            <input
              id="currentPassword"
              v-model="passwordForm.currentPassword"
              type="password"
              class="form-control"
              placeholder="请输入当前密码"
            />
          </div>
          
          <div class="form-group">
            <label for="newPassword">新密码</label>
            <input
              id="newPassword"
              v-model="passwordForm.newPassword"
              type="password"
              class="form-control"
              placeholder="请输入新密码"
            />
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">确认新密码</label>
            <input
              id="confirmPassword"
              v-model="passwordForm.confirmPassword"
              type="password"
              class="form-control"
              placeholder="请再次输入新密码"
            />
          </div>
          
          <button type="submit" class="btn btn-primary" :disabled="changingPassword">
            {{ changingPassword ? '修改中...' : '修改密码' }}
          </button>
        </form>
      </div>

      <!-- 操作统计卡片 -->
      <div class="info-card">
        <h2>操作统计</h2>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-icon">📊</div>
            <div class="stat-info">
              <span class="stat-label">总检测次数</span>
              <span class="stat-value">{{ userStats.totalDetections }}</span>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">✅</div>
            <div class="stat-info">
              <span class="stat-label">已处理障碍物</span>
              <span class="stat-value">{{ userStats.resolvedObstacles }}</span>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">⚠️</div>
            <div class="stat-info">
              <span class="stat-label">高风险处理</span>
              <span class="stat-value">{{ userStats.highRiskHandled }}</span>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">📅</div>
            <div class="stat-info">
              <span class="stat-label">本月活跃</span>
              <span class="stat-value">{{ userStats.monthlyActive }} 天</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 账户操作卡片 -->
      <div class="info-card">
        <h2>账户操作</h2>
        <div class="action-buttons">
          <button class="btn btn-secondary" @click="exportUserData">
            导出个人数据
          </button>
          <button class="btn btn-secondary" @click="showDeleteConfirm = true">
            注销账户
          </button>
          <button class="btn btn-danger" @click="handleLogout">
            退出登录
          </button>
        </div>
      </div>
    </div>

    <!-- 注销确认对话框 -->
    <div v-if="showDeleteConfirm" class="modal-overlay">
      <div class="modal-content">
        <h3>确认注销账户</h3>
        <p>此操作将永久删除您的账户和所有相关数据，且无法恢复。请谨慎操作！</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showDeleteConfirm = false">
            取消
          </button>
          <button class="btn btn-danger" @click="deleteAccount">
            确认注销
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { userApi } from '../services/api'

const router = useRouter()
const currentUser = inject('currentUser') as any

// 响应式数据
const updating = ref(false)
const changingPassword = ref(false)
const showDeleteConfirm = ref(false)

const userForm = reactive({
  username: '',
  email: '',
  phone: ''
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const userStats = reactive({
  totalDetections: 156,
  resolvedObstacles: 89,
  highRiskHandled: 23,
  monthlyActive: 15
})

// 初始化用户数据
const initUserData = () => {
  if (currentUser.value) {
    userForm.username = currentUser.value.uname || currentUser.value.username || ''
    userForm.email = currentUser.value.email || ''
    userForm.phone = currentUser.value.phone || ''
  }
}

// 更新用户信息
const updateUserInfo = async () => {
  if (!userForm.username.trim()) {
    alert('请输入用户名')
    return
  }

  try {
    updating.value = true
    // 调用API更新用户信息
    const result = await userApi.updateUserInfo(userForm)
    if (result.code === 200) {
      alert('用户信息更新成功')
      // 更新全局用户状态
      if (currentUser.value) {
        currentUser.value.uname = userForm.username
        currentUser.value.email = userForm.email
        currentUser.value.phone = userForm.phone
        localStorage.setItem('user', JSON.stringify(currentUser.value))
      }
    } else {
      alert('更新失败: ' + result.message)
    }
  } catch (error) {
    alert('更新失败，请稍后重试')
    console.error('更新用户信息失败:', error)
  } finally {
    updating.value = false
  }
}

// 修改密码
const updatePassword = async () => {
  if (!passwordForm.currentPassword || !passwordForm.newPassword) {
    alert('请填写所有密码字段')
    return
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    alert('两次输入的新密码不一致')
    return
  }

  if (passwordForm.newPassword.length < 6) {
    alert('密码长度至少6位')
    return
  }

  try {
    changingPassword.value = true
    const result = await userApi.updatePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })
    if (result.code === 200) {
      alert('密码修改成功')
      // 清空密码表单
      passwordForm.currentPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
    } else {
      alert('密码修改失败: ' + result.message)
    }
  } catch (error) {
    alert('密码修改失败，请稍后重试')
    console.error('修改密码失败:', error)
  } finally {
    changingPassword.value = false
  }
}

// 导出个人数据
const exportUserData = () => {
  const data = {
    userInfo: userForm,
    statistics: userStats,
    exportTime: new Date().toISOString()
  }
  
  const dataStr = JSON.stringify(data, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  
  const link = document.createElement('a')
  link.href = URL.createObjectURL(dataBlob)
  link.download = `user_data_${new Date().getTime()}.json`
  link.click()
  
  alert('数据导出成功')
}

// 注销账户
const deleteAccount = async () => {
  try {
    const result = await userApi.deleteAccount()
    if (result.code === 200) {
      alert('账户注销成功')
      handleLogout()
    } else {
      alert('账户注销失败: ' + result.message)
    }
  } catch (error) {
    alert('账户注销失败，请稍后重试')
    console.error('注销账户失败:', error)
  } finally {
    showDeleteConfirm.value = false
  }
}

// 退出登录
const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

// 组件挂载时初始化数据
onMounted(() => {
  initUserData()
})
</script>

<style scoped>
.user-info-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e0e0e0;
}

.user-header h1 {
  color: #2a5298;
  margin: 0;
}

.back-btn {
  padding: 0.75rem 1.5rem;
  background: #6c757d;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.back-btn:hover {
  background: #545b62;
}

.user-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.info-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.info-card h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.3rem;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 0.5rem;
}

.user-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #555;
}

.form-control {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: #2a5298;
  box-shadow: 0 0 0 2px rgba(42, 82, 152, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2a5298;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
  text-align: center;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #2a5298;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1e3c72;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  text-align: center;
}

.modal-content h3 {
  margin-top: 0;
  color: #dc3545;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-content {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .user-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>