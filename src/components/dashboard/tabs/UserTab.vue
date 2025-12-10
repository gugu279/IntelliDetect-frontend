<template>
  <div class="user-tab">
    <div class="user-profile">
      <div class="profile-avatar">{{ userAvatar }}</div>
      <h3>{{ userName }}</h3>
      <p>{{ userEmail }}</p>
    </div>
    
    <div class="user-stats">
      <h4>用户统计</h4>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">总检测数</span>
          <span class="stat-value">{{ stats.totalObstacles }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">高风险</span>
          <span class="stat-value">{{ stats.highRiskObstacles }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">今日新增</span>
          <span class="stat-value">{{ stats.pendingObstacles }}</span>
        </div>
      </div>
    </div>

    <button class="btn btn-secondary" style="width: 100%; margin-top: 20px;" @click="emit('logout')">退出登录</button>
  </div>
</template>

<script setup lang="ts">
import type { ObstacleStats } from '../../../types/api'

interface Props {
  userAvatar: string
  userName: string
  userEmail: string
  stats: ObstacleStats
}

interface Emits {
  (e: 'logout'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<style scoped>
.user-profile {
  text-align: center;
  padding: 20px;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #2a5298;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin: 0 auto 15px;
}

.user-stats {
  margin-top: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 10px;
}

.stat-item {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 6px;
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}

.stat-value {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #2a5298;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}
</style>