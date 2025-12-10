<template>
  <section class="info-panel">
    <div class="panel-tabs">
      <div
        class="tab"
        :class="{ active: activeTab === 'coordinates' }"
        @click="handleTabClick('coordinates')"
      >坐标信息</div>
      <div
        class="tab"
        :class="{ active: activeTab === 'detections' }"
        @click="handleTabClick('detections')"
      >检测记录</div>
      <div
        class="tab"
        :class="{ active: activeTab === 'user' }"
        @click="handleTabClick('user')"
      >用户信息</div>
    </div>

    <div class="tab-content">
      <!-- 坐标信息标签页 -->
      <div class="tab-pane" :class="{ active: activeTab === 'coordinates' }">
        <slot name="coordinates-tab"></slot>
      </div>

      <!-- 检测记录标签页 -->
      <div class="tab-pane" :class="{ active: activeTab === 'detections' }">
        <slot name="detections-tab"></slot>
      </div>

      <!-- 用户信息标签页 -->
      <div class="tab-pane" :class="{ active: activeTab === 'user' }">
        <slot name="user-tab"></slot>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  activeTab: string
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
.info-panel {
  flex: 1;
  background: white;
  border-left: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  min-width: 350px;
  max-width: 400px;
}

.panel-tabs {
  display: flex;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.tab {
  padding: 15px 20px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
  flex: 1;
  text-align: center;
}

.tab.active {
  border-bottom-color: #2a5298;
  color: #2a5298;
  font-weight: bold;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.tab-pane {
  display: none;
}

.tab-pane.active {
  display: block;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .info-panel {
    max-width: none;
    min-width: auto;
  }
}
</style>