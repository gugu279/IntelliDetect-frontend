<template>
  <div class="coordinates-tab">
    <h3>实时坐标信息</h3>
    <div class="coordinate-card">
      <div class="coord-item">
        <span class="coord-label">经度:</span>
        <span class="coord-value">{{ currentCoordinate.longitude }}</span>
      </div>
      <div class="coord-item">
        <span class="coord-label">纬度:</span>
        <span class="coord-value">{{ currentCoordinate.latitude }}</span>
      </div>
      <div class="coord-item">
        <span class="coord-label">区域:</span>
        <span class="coord-value">{{ currentCoordinate.area }}</span>
      </div>
      <div class="coord-item">
        <span class="coord-label">检测时间:</span>
        <span class="coord-value">{{ currentCoordinate.detectionTime }}</span>
      </div>
    </div>

    <h4>图片预览</h4>
    <div class="image-preview">
      <img :src="currentCoordinate.image" :alt="currentCoordinate.area" v-if="currentCoordinate.image">
      <div v-else class="image-placeholder">暂无图片</div>
    </div>

    <div class="form-group">
      <label for="obstacleType">障碍物类型</label>
      <select class="form-control" id="obstacleType" v-model="selectedObstacleType">
        <option value="building">建筑</option>
        <option value="crane">起重机</option>
        <option value="tree">树木</option>
        <option value="equipment">设备</option>
        <option value="other">其他</option>
      </select>
    </div>

    <button class="btn btn-primary" style="width: 100%;" @click="emit('confirm-mark')">确认标注</button>
    
    <!-- 添加模拟事件按钮 - 需要从父组件传递方法 -->
    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;" v-if="showMockButton">
      <h4>开发测试功能</h4>
      <button 
        class="btn btn-simulate" 
        style="width: 100%; margin-top: 10px;"
        @click="emit('generate-mock')"
      >
        模拟接收数据
      </button>
      <div class="simulation-info" style="font-size: 12px; color: #666; margin-top: 10px;">
        点击后将在三个跑道区域内随机生成一个标记点
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  
  interface Props {
    currentCoordinate: {
      longitude: string
      latitude: string
      area: string
      detectionTime: string
      image: string
    }
    selectedObstacleType: string
    showMockButton?: boolean  // 添加新属性控制是否显示模拟按钮
  }

  interface Emits {
    (e: 'update:selectedObstacleType', value: string): void
    (e: 'confirm-mark'): void
    (e: 'generate-mock'): void  // 添加新事件
  }

  const props = withDefaults(defineProps<Props>(), {
    showMockButton: true  // 默认显示模拟按钮
  })
  
  const emit = defineEmits<Emits>()

  const selectedObstacleType = computed({
    get: () => props.selectedObstacleType,
    set: (value) => emit('update:selectedObstacleType', value)
  })
</script>

<!-- 样式部分保持不变 -->
<style scoped>
/* 样式代码保持不变 */
.coordinate-card {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.coord-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 5px 0;
  border-bottom: 1px solid #eee;
}

.coord-label {
  font-weight: bold;
  color: #666;
}

.coord-value {
  color: #333;
}

.image-preview {
  width: 100%;
  height: 200px;
  background: #f0f0f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  border: 2px dashed #ddd;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.image-placeholder {
  color: #999;
  font-size: 14px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-primary {
  background: #2a5298;
  color: white;
}

.btn-primary:hover {
  background: #1e3c72;
}

.btn-simulate {
  background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s, transform 0.2s;
  font-weight: bold;
}

.btn-simulate:hover {
  background: linear-gradient(135deg, #66BB6A 0%, #388E3C 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-simulate:active {
  transform: translateY(0);
}
</style>