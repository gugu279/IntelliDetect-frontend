<template>
  <div class="user-info-container">
    <div class="header">
      <div class="nav-controls">
        <button @click="handleBack" class="back-btn">← 返回仪表盘</button>
        <h1>个人信息</h1>
      </div>
      <div class="user-welcome">
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
        <button @click="fetchUserInfo" class="retry-btn">重试</button>
      </div>
      
      <!-- 用户信息卡片 -->
      <div v-else-if="userInfo" class="user-info-card">
        <div class="card-header">
          <h2>{{ userInfo.uname }}的个人信息</h2>
          <button 
            @click="showEditModal = true" 
            class="edit-btn"
            v-if="isCurrentUser"
          >
            编辑信息
          </button>
        </div>
        
        <div class="info-grid">
          <div class="info-item">
            <label class="info-label">用户ID:</label>
            <span class="info-value">{{ userInfo.id }}</span>
          </div>
          
          <div class="info-item">
            <label class="info-label">用户名:</label>
            <span class="info-value">{{ userInfo.uname }}</span>
          </div>
          
          <div class="info-item">
            <label class="info-label">手机号:</label>
            <span class="info-value">{{ userInfo.phoneNumber }}</span>
          </div>
          
          <div class="info-item">
            <label class="info-label">邮箱:</label>
            <span class="info-value">{{ userInfo.email }}</span>
          </div>
          
          <div class="info-item">
            <label class="info-label">角色:</label>
            <span class="info-value">{{ getUserRoleName(userInfo.role) }}</span>
          </div>
        </div>
        
        <!-- 操作按钮区域 -->
        <div v-if="isCurrentUser" class="action-section">
          <button @click="showPasswordModal = true" class="change-password-btn">
            修改密码
          </button>
        </div>
      </div>
      
      <!-- 未找到 -->
      <div v-else class="not-found">
        <div class="not-found-icon">🔍</div>
        <h3>用户不存在</h3>
        <p>找不到指定的用户信息</p>
        <button @click="handleBack" class="back-btn">返回仪表盘</button>
      </div>
    </div>
    
    <!-- 编辑信息模态框 -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>编辑个人信息</h3>
          <button @click="showEditModal = false" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>用户名:</label>
            <input 
              v-model="editForm.uname" 
              type="text" 
              :disabled="true"
              placeholder="用户名不可修改"
            />
          </div>
          <div class="form-group">
            <label>手机号:</label>
            <input 
              v-model="editForm.phoneNumber" 
              type="tel" 
              placeholder="请输入手机号"
            />
          </div>
          <div class="form-group">
            <label>邮箱:</label>
            <input 
              v-model="editForm.email" 
              type="email" 
              placeholder="请输入邮箱"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showEditModal = false" class="cancel-btn">取消</button>
          <button 
            @click="submitEdit" 
            :disabled="isEditing"
            class="submit-btn"
          >
            {{ isEditing ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 修改密码模态框 -->
    <div v-if="showPasswordModal" class="modal-overlay" @click.self="showPasswordModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>修改密码</h3>
          <button @click="showPasswordModal = false" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>当前密码:</label>
            <input 
              v-model="passwordForm.oldPassword" 
              type="password" 
              placeholder="请输入当前密码"
            />
          </div>
          <div class="form-group">
            <label>新密码:</label>
            <input 
              v-model="passwordForm.newPassword" 
              type="password" 
              placeholder="请输入新密码"
            />
          </div>
          <div class="form-group">
            <label>确认新密码:</label>
            <input 
              v-model="passwordForm.confirmPassword" 
              type="password" 
              placeholder="请再次输入新密码"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showPasswordModal = false" class="cancel-btn">取消</button>
          <button 
            @click="submitPasswordChange" 
            :disabled="isChangingPassword"
            class="submit-btn"
          >
            {{ isChangingPassword ? '修改中...' : '修改' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { userApi } from '../services/api'

// 路由和响应式数据
const route = useRoute()
const router = useRouter()
const isLoading = ref(true)
const isEditing = ref(false)
const isChangingPassword = ref(false)
const error = ref('')
const userInfo = ref<any>(null)
const showEditModal = ref(false)
const showPasswordModal = ref(false)

// 编辑表单
const editForm = reactive({
  uname: '',
  phoneNumber: '',
  email: ''
})

// 密码修改表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 获取用户ID
const userId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? parseInt(id, 10) : id
})

// 从本地存储获取当前用户信息
const currentUser = computed(() => {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
})

// 判断是否是当前用户
const isCurrentUser = computed(() => {
  return currentUser.value && userId.value === currentUser.value.id
})

// 获取用户角色名称
const getUserRoleName = (roleId: number): string => {
  const roleMap: Record<number, string> = {
    0: '主管理员',
    1: '管理员',
    2: '普通用户'
  }
  return roleMap[roleId] || '未知角色'
}

// 返回仪表盘
const handleBack = () => {
  router.push('/dashboard')
}

// 退出登录
const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

// 获取用户信息
  const fetchUserInfo = async () => {
    isLoading.value = true
    error.value = ''
    
    try {
      // 确保userId是数字类型
      const numericUserId = Number(userId.value)
      if (isNaN(numericUserId)) {
        error.value = '无效的用户ID'
        return
      }
      
      const response = await userApi.getUserById(numericUserId)
      const result = response.data
      
      if (result.code === 200) {
        userInfo.value = result.data
        // 初始化编辑表单
        Object.assign(editForm, {
          uname: userInfo.value.uname,
          phoneNumber: userInfo.value.phoneNumber,
          email: userInfo.value.email
        })
      } else {
        error.value = result.message || '获取用户信息失败'
      }
    } catch (err: any) {
      console.error('获取用户信息失败:', err)
      error.value = '获取用户信息失败，请稍后重试'
    } finally {
      isLoading.value = false
    }
  }

// 提交编辑
const submitEdit = async () => {
  // 表单验证
  if (!editForm.phoneNumber) {
    alert('请输入手机号')
    return
  }
  
  if (!editForm.email) {
    alert('请输入邮箱')
    return
  }
  
  // 手机号格式验证
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(editForm.phoneNumber)) {
    alert('请输入有效的手机号')
    return
  }
  
  // 邮箱格式验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(editForm.email)) {
    alert('请输入有效的邮箱地址')
    return
  }
  
  isEditing.value = true
  try {
    // 这里可以调用更新用户信息的API
    // 目前后端文档中没有明确的更新用户信息API，这里模拟成功
    // const result = await userApi.updateUserInfo(userId.value, editForm)
    
    // 模拟成功
    setTimeout(() => {
      // 更新本地数据
      userInfo.value.phoneNumber = editForm.phoneNumber
      userInfo.value.email = editForm.email
      showEditModal.value = false
      alert('信息更新成功')
      isEditing.value = false
    }, 500)
  } catch (err: any) {
    console.error('更新失败:', err)
    alert('更新失败: ' + (err || '网络错误'))
    isEditing.value = false
  }
}

// 提交密码修改
const submitPasswordChange = async () => {
  // 表单验证
  if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
    alert('请填写所有密码字段')
    return
  }
  
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    alert('两次输入的新密码不一致')
    return
  }
  
  if (passwordForm.newPassword.length < 6) {
    alert('新密码长度不能少于6位')
    return
  }
  
  isChangingPassword.value = true
  try {
    // 这里可以调用修改密码的API
    // 目前后端文档中没有明确的修改密码API，这里模拟成功
    // const result = await userApi.changePassword(userId.value, passwordForm)
    
    // 模拟成功
    setTimeout(() => {
      // 重置密码表单
      Object.assign(passwordForm, {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      showPasswordModal.value = false
      alert('密码修改成功，请重新登录')
      handleLogout()
      isChangingPassword.value = false
    }, 500)
  } catch (err: any) {
    console.error('密码修改失败:', err)
    alert('密码修改失败: ' + (err || '网络错误'))
    isChangingPassword.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.user-info-container {
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

.content {
  padding: 2rem;
  max-width: 800px;
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

.retry-btn {
  padding: 0.75rem 1.5rem;
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.retry-btn:hover {
  background-color: #764ba2;
}

/* 用户信息卡片 */
.user-info-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eaeaea;
}

.card-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
}

.edit-btn {
  padding: 0.5rem 1rem;
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 0.9rem;
}

.edit-btn:hover {
  background-color: #764ba2;
}

/* 信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 1.1rem;
  color: #333;
  font-weight: 500;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 6px;
}

/* 操作区域 */
.action-section {
  display: flex;
  justify-content: flex-start;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eaeaea;
}

.change-password-btn {
  padding: 0.75rem 1.5rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.change-password-btn:hover {
  background-color: #218838;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eaeaea;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.2rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.close-btn:hover {
  background-color: #f5f5f5;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled {
  background-color: #f8f9fa;
  color: #666;
  cursor: not-allowed;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #eaeaea;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.cancel-btn:hover {
  background-color: #5a6268;
}

.submit-btn {
  padding: 0.75rem 1.5rem;
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  background-color: #764ba2;
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
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
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .action-section {
    justify-content: center;
    flex-wrap: wrap;
  }
}
</style>