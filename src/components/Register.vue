<template>
  <div class="register-container">
    <div class="register-form">
      <h2>用户注册</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="username">用户名:</label>
          <input
            id="username"
            v-model="registerForm.uname"
            type="text"
            placeholder="请输入用户名"
            required
          />
        </div>
        <div class="form-group">
          <label for="password">密码:</label>
          <input
            id="password"
            v-model="registerForm.passwor"
            type="password"
            placeholder="请输入密码"
            required
          />
        </div>
        <div class="form-group">
          <label for="phone">手机号:</label>
          <input
            id="phone"
            v-model="registerForm.phone_number"
            type="tel"
            placeholder="请输入手机号"
            required
          />
        </div>
        <div class="form-group">
          <label for="email">邮箱:</label>
          <input
            id="email"
            v-model="registerForm.email"
            type="email"
            placeholder="请输入邮箱"
            required
          />
        </div>
        <button type="submit" class="register-btn" :disabled="isLoading">
          {{ isLoading ? '注册中...' : '注册' }}
        </button>
      </form>
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
      <div class="login-link">
        <span>已有账号？</span>
        <router-link to="/login">去登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { userApi } from '../services/api'

// 定义注册响应类型
interface RegisterResponse {
  code: number
  message: string
  data?: any
}

// 定义注册表单数据类型
interface RegisterForm {
  uname: string
  passwor: string
  phone_number: string
  email: string
}

// 响应式数据
const registerForm = reactive<RegisterForm>({
  uname: '',
  passwor: '',
  phone_number: '',
  email: ''
})

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const router = useRouter()

// 注册处理函数
const handleRegister = async () => {
  // 表单验证
  if (!registerForm.uname || !registerForm.passwor || !registerForm.phone_number || !registerForm.email) {
    errorMessage.value = '请填写所有必填字段'
    return
  }

  // 手机号格式验证
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(registerForm.phone_number)) {
    errorMessage.value = '请输入有效的手机号'
    return
  }

  // 邮箱格式验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(registerForm.email)) {
    errorMessage.value = '请输入有效的邮箱地址'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
      const result = await userApi.register({
        uname: registerForm.uname,
        passwor: registerForm.passwor,
        phone_number: registerForm.phone_number,
        email: registerForm.email
      }) as unknown as RegisterResponse
      
      if (result.code === 200) {
        successMessage.value = '注册成功！请登录'
        // 重置表单
        Object.assign(registerForm, { uname: '', passwor: '', phone_number: '', email: '' })
        // 2秒后跳转到登录页面
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        errorMessage.value = result.message || '注册失败'
      }
    } catch (error: any) {
      console.error('注册请求失败:', error)
      errorMessage.value = error || '网络错误，请稍后重试'
    } finally {
      isLoading.value = false
    }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.register-form {
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

.register-form h2 {
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

.register-btn {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.3s ease;
  margin-top: 1rem;
}

.register-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.register-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  text-align: center;
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
}

.success-message {
  color: #28a745;
  text-align: center;
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 8px;
}

.login-link {
  text-align: center;
  margin-top: 1.5rem;
  color: #666;
}

.login-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.login-link a:hover {
  color: #764ba2;
  text-decoration: underline;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .register-container {
    padding: 0;
    align-items: flex-start;
    padding-top: 2rem;
  }
  
  .register-form {
    padding: 2rem;
    border-radius: 12px;
    max-width: 100%;
    min-height: auto;
    margin: 0 1rem;
  }
}

@media (max-width: 480px) {
  .register-form {
    padding: 1.5rem;
    border-radius: 10px;
    margin: 0 0.5rem;
  }
  
  .register-form h2 {
    font-size: 1.5rem;
  }
}
</style>