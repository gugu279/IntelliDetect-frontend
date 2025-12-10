<template>
  <header class="header">
    <div class="nav-container">
      <div class="logo">机场障碍物检测系统</div>
      <ul class="nav-links">
        <li><a href="#" class="nav-link" :class="{ active: activeTab === 'coordinates' }" @click.prevent="handleTabClick('coordinates')">检测面板</a></li>
        <li><a href="#" class="nav-link" :class="{ active: activeTab === 'detections' }" @click.prevent="handleTabClick('detections')">历史记录</a></li>
        <li><a href="#" class="nav-link" :class="{ active: activeTab === 'user' }" @click.prevent="handleTabClick('user')">用户信息</a></li>
      </ul>
      <div class="user-info">
        <div class="user-avatar">{{ userAvatar }}</div>
        <div class="user-name">{{ userName }}</div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
interface Props {
  activeTab: string
  userAvatar: string
  userName: string
}

interface Emits {
  (e: 'tab-change', tab: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleTabClick = (tab: string) => {
  emit('tab-change', tab)
}
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
  padding: 0 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.logo {
  font-size: 24px;
  font-weight: bold;
}

.nav-links {
  display: flex;
  list-style: none;
}

.nav-links li {
  margin-left: 30px;
}

.nav-links a {
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background-color 0.3s;
  cursor: pointer;
}

.nav-links a:hover,
.nav-links a.active {
  background-color: rgba(255,255,255,0.1);
}

.user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #4CAF50;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  color: white;
  font-weight: bold;
}
</style>