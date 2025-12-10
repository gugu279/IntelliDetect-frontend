<template>
  <div class="login-container">
    <div class="login-form">
      <h2>用户登录</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">用户名:</label>
          <input
            id="username"
            v-model="loginForm.username"
            type="text"
            placeholder="请输入用户名"
            required
          />
        </div>
        <div class="form-group">
          <label for="password">密码:</label>
          <input
            id="password"
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            required
          />
        </div>
        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
      <div class="demo-info">
        <p>请使用真实账号登录</p>
        <p>如需测试，请联系管理员获取账号</p>
      </div>
      <div class="register-link">
        <p>还没有账号？<a href="/register" @click.prevent="goToRegister">立即注册</a></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { userApi } from '../services/api'

// 定义登录响应类型
interface LoginResponse {
  code: number
  message: string
  data?: {
    token: string
    user: any
  }
}

const router = useRouter()

// 响应式数据
const loginForm = reactive({
  username: '',
  password: ''
})

const errorMessage = ref('')
const successMessage = ref('')
const loading = ref(false)

// 登录处理函数
const goToRegister = () => {
  router.push('/register')
}

const handleLogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    errorMessage.value = '请输入用户名和密码'
    return
  }

  try {
    loading.value = true
      const result = await userApi.login({
        uname: loginForm.username,
        passwor: loginForm.password
      }) as unknown as LoginResponse
      
      if (result.code === 200 && result.data) {
        // 登录成功，保存token和用户信息
        localStorage.setItem('token', result.data.token)
        localStorage.setItem('user', JSON.stringify(result.data.user))
        
        // 显示成功消息
        errorMessage.value = ''
        successMessage.value = '登录成功！正在跳转...'
        
        // 延迟后跳转
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      } else if (result.code === 200) {
        // 虽然code是200但没有data的情况
        errorMessage.value = '登录成功但缺少用户信息'
        successMessage.value = ''
    } else {
      // 登录失败
      errorMessage.value = result.message || '登录失败，请检查用户名和密码'
      successMessage.value = ''
    }
  } catch (error) {
    errorMessage.value = '登录失败，请稍后重试'
    successMessage.value = ''
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-form {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 3rem;
  border-radius: 15px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 800px;
  min-width: 320px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .login-container {
    padding: 0;
    align-items: flex-start;
    padding-top: 2rem;
  }
  
  .login-form {
    padding: 2rem;
    border-radius: 12px;
    max-width: 100%;
    min-height: auto;
    margin: 0 1rem;
    backdrop-filter: blur(8px);
  }
}

/* 小屏幕移动端 */
@media (max-width: 480px) {
  .login-container {
    padding: 0;
    padding-top: 1rem;
  }
  
  .login-form {
    padding: 1.5rem;
    border-radius: 10px;
    margin: 0 0.5rem;
    backdrop-filter: blur(6px);
  }
}

/* 中等屏幕桌面端 */
@media (min-width: 769px) and (max-width: 1199px) {
  .login-form {
    max-width: 700px;
    padding: 3rem;
    backdrop-filter: blur(12px);
  }
}

/* 大屏幕桌面端 */
@media (min-width: 1200px) {
  .login-form {
    max-width: 900px;
    padding: 4rem;
    backdrop-filter: blur(15px);
  }
}

.login-form h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.8rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 1.1rem;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.login-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: opacity 0.3s ease;
  margin-top: 1rem;
}

.login-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  text-align: center;
  margin-top: 1rem;
  padding: 0.5rem;
  background: #ffeaea;
  border-radius: 5px;
  border: 1px solid #e74c3c;
}

.demo-info {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 5px;
  text-align: center;
  font-size: 0.9rem;
  color: #666;
}

.demo-info p {
  margin: 0.25rem 0;
}

.register-link {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
}

.register-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>