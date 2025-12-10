import axios from 'axios'
import type { ApiResponse, Obstacle, ObstacleStats, PageResponse } from '../types/api'

// 创建axios实例
const apiClient = axios.create({
  baseURL: 'http://localhost:8081/api/v1',
  //baseURL: 'http://120.46.139.74:8080/airport-obstacle/api/v1',
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
// 在 userApi 对象中添加以下方法
export const userApi = {
  // 现有的登录注册方法...
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
  },

  // 新增：更新用户信息
  updateUserInfo: (data: {
    uname?: string;
    email?: string;
    phone_number?: string;
  }) => {
    return apiClient.put('/users/update', data)
  },

  // 新增：修改密码
  updatePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    return apiClient.put('/users/updatePassword', data)
  },

  // 新增：注销账户
  deleteAccount: () => {
    return apiClient.delete('/users/delete')
  }
}

// 障碍物检测相关API
export const obstacleApi = {
  // 创建障碍物检测记录
  createObstacle: (data: {
    imageUrl: string;
    location: string;
    type: string;
    height: number;
    distance: number;
    riskLevel: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  }): Promise<ApiResponse<Obstacle>> => {
    return apiClient.post('/obstacles', data)
  },
  
  // 更新障碍物状态
  updateObstacleStatus: (id: number, status: string): Promise<ApiResponse<Obstacle>> => {
    return apiClient.put(`/obstacles/${id}/status`, { status })
  },
  
  // 获取障碍物列表（分页）
  getObstacles: (page: number = 1, size: number = 10): Promise<ApiResponse<PageResponse<Obstacle>>> => {
    return apiClient.get('/obstacles', {
      params: { page, size }
    })
  },
  
  // 获取障碍物详情
  getObstacleById: (id: number): Promise<ApiResponse<Obstacle>> => {
    return apiClient.get(`/obstacles/${id}`)
  },
  
  // 获取障碍物统计数据
  getObstacleStats: (): Promise<ApiResponse<ObstacleStats>> => {
    return apiClient.get('/obstacles/stats')
  },
  
  // 获取高风险障碍物
  getHighRiskObstacles: (): Promise<ApiResponse<Obstacle[]>> => {
    return apiClient.get('/obstacles/high-risk')
  }
}

export default apiClient