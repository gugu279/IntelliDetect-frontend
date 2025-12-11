// API响应类型定义
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 障碍物统计数据类型
export interface ObstacleStats {
  totalObstacles: number;
  resolvedObstacles: number;
  pendingObstacles: number;
  highRiskObstacles: number;
  detectionRate: number;
  todayObstacles?: number; // 添加可选属性
}

<<<<<<< HEAD
// 障碍物记录类型 - 修改为只有 stone 和 trash，关键属性改为可选
export interface Obstacle {
  id: number;
  imageUrl?: string;  // 改为可选
  location?: string;  // 改为可选
  type?: 'stone' | 'trash';  // 改为可选
  height?: number;  // 改为可选
  distance?: number;  // 改为可选
  riskLevel?: 'low' | 'medium' | 'high';  // 改为可选
  status?: 'pending' | 'confirmed' | 'resolved';  // 改为可选
  detectionTime?: string;  // 改为可选
  coordinates?: {  // 改为可选
    latitude: number;
    longitude: number;
  };
  description?: string;
  createTime?: string;
  updateTime?: string;
  // 添加地图位置属性
  mapPosition?: {
    top: number;
    left: number;
  };
}

// 创建一个安全的 Obstacle 类型，所有属性都是必填的
export interface SafeObstacle {
  id: number;
  imageUrl: string;
  location: string;
  type: 'stone' | 'trash';
=======
// 障碍物记录类型
export interface Obstacle {
  id: number;
  imageUrl: string;
  location: string;
  type: 'building' | 'crane' | 'tree' | 'equipment' | 'other';
>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
  height: number;
  distance: number;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'pending' | 'confirmed' | 'resolved';
  detectionTime: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
<<<<<<< HEAD
  description: string;
  createTime?: string;
  updateTime?: string;
  mapPosition: {
=======
  description?: string;
  createTime?: string;
  updateTime?: string;
  // 添加地图位置属性
  mapPosition?: {
>>>>>>> fda37771de5b2d8aa1c0c5ff15a1f3f8e96c5f65
    top: number;
    left: number;
  };
}

// 分页响应类型
export interface PageResponse<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
  totalPages?: number;
}

// 用户信息类型
export interface User {
  id: number;
  uname: string;
  email: string;
  phone_number: string;
  createTime?: string;
  updateTime?: string;
}

// 更新用户信息请求类型
export interface UpdateUserRequest {
  uname?: string;
  email?: string;
  phone_number?: string;
}

// 修改密码请求类型
export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// 用户统计类型
export interface UserStats {
  totalDetections: number;
  resolvedObstacles: number;
  highRiskHandled: number;
  monthlyActive: number;
}