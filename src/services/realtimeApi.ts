export interface DetectionData {
  id: number
  timestamp: string
  coordinates: {
    longitude: number
    latitude: number
  }
  type: 'stone' | 'trash'
  size: number  // 尺寸，单位厘米
  confidence: number  // 识别置信度
  image_url: string
}

// 模拟后端API服务
export const realtimeApi = {
  // 获取实时检测数据
  async getRealtimeDetections(): Promise<DetectionData[]> {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 模拟返回数据
      const mockData: DetectionData[] = [
        {
          id: 1,
          timestamp: new Date().toISOString(),
          coordinates: { longitude: 116.3974, latitude: 39.9093 },
          type: 'stone',
          size: 15,
          confidence: 0.92,
          image_url: '/detection1.jpg'
        }
      ]
      
      return mockData
    } catch (error) {
      console.error('获取实时检测数据失败:', error)
      return []
    }
  },
  
  // 获取历史检测记录
  async getHistoryDetections(startTime: string, endTime: string): Promise<DetectionData[]> {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 模拟返回数据
      const mockData: DetectionData[] = [
        {
          id: 1,
          timestamp: startTime,
          coordinates: { longitude: 116.3974, latitude: 39.9093 },
          type: 'stone',
          size: 15,
          confidence: 0.92,
          image_url: '/detection1.jpg'
        },
        {
          id: 2,
          timestamp: endTime,
          coordinates: { longitude: 116.3981, latitude: 39.9087 },
          type: 'trash',
          size: 25,
          confidence: 0.85,
          image_url: '/detection2.jpg'
        }
      ]
      
      return mockData
    } catch (error) {
      console.error('获取历史检测数据失败:', error)
      return []
    }
  },
  
  // 上传手动标注
  async postManualDetection(detection: {
    coordinates: { longitude: number; latitude: number }
    type: 'stone' | 'trash'
    size: number
    notes?: string
  }): Promise<boolean> {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      console.log('上传手动标注:', detection)
      return true
    } catch (error) {
      console.error('上传手动标注失败:', error)
      return false
    }
  }
}