import axios from 'axios'
import type { ApiResponse, Accident, AccidentStats, PageResponse } from '../types/api'

// 创建axios实例
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  //baseURL: 'http://120.46.139.74:8080/IntelliDetect/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response
      if (status === 401) {
        // 未授权，清除本地存储并跳转到登录页
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
      return Promise.reject(data.message || '服务器错误')
    } else if (error.request) {
      // 请求已发出但没有收到响应
      return Promise.reject('网络错误，请检查网络连接')
    } else {
      // 请求配置出错
      return Promise.reject('请求配置错误')
    }
  }
)

// 用户相关API
export const userApi = {
  // 用户登录
  login: (data: { uname: string; passwor: string }) => {
    return apiClient.post('/users/login', data)
  },
  
  // 用户注册
  register: (data: {
    uname: string;
    passwor: string;
    phone_number: string;
    email: string;
  }) => {
    return apiClient.post('/users/register', data)
  },
  
  // 根据ID获取用户信息
  getUserById: (id: number) => {
    return apiClient.get(`/users/${id}`)
  },
  
  // 根据用户名获取用户信息
  getUserByUsername: (username: string) => {
    return apiClient.get(`/users/info/${username}`)
  }
}

// 事故信息相关API
export const accidentApi = {
  // 创建事故信息
  createAccident: (data: {
    videoUrl: string;
    imageUrl: string;
    accidentDescription: string;
    accidentDescriptionText: string;
    accidentDescriptionTime: string;
    accidentDescriptionState: string;
  }): Promise<ApiResponse<Accident>> => {
    return apiClient.post('/accidents', data)
  },
  
  // 更新展示信息
  updateDisplayInfo: (id: number, displayInfo: string): Promise<ApiResponse<Accident>> => {
    return apiClient.put(`/accidents/${id}/display`, { displayInfo })
  },
  
  // 获取事故列表（分页）
  getAccidents: (page: number = 1, size: number = 10): Promise<ApiResponse<PageResponse<Accident>>> => {
    return apiClient.get('/accidents', {
      params: { page, size }
    })
  },
  
  // 获取事故详情
  getAccidentById: (id: number): Promise<ApiResponse<Accident>> => {
    return apiClient.get(`/accidents/${id}`)
  },
  
  // 获取事故统计数据
  getAccidentStats: (): Promise<ApiResponse<AccidentStats>> => {
    return apiClient.get('/accidents/stats')
  }
}

export default apiClient