<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import BottomNavigation from './components/BottomNavigation.vue'
import MiniPlayer from './components/MiniPlayer.vue'
import AudioPlayer from './components/AudioPlayer.vue'
import ErrorBoundary from './components/ErrorBoundary.vue'

const route = useRoute()
const authStore = useAuthStore()

// 判断是否显示底部导航栏
const showBottomNav = computed(() => {
  const hiddenRoutes = ['/player', '/auth']
  return !hiddenRoutes.includes(route.path) && !route.path.startsWith('/auth')
})

// 判断是否显示迷你播放器
const showMiniPlayer = computed(() => {
  const hiddenRoutes = ['/player', '/auth']
  return !hiddenRoutes.includes(route.path) && !route.path.startsWith('/auth')
})

// 应用启动时初始化认证状态
onMounted(() => {
  // 恢复认证状态（从localStorage）
  authStore.restoreAuth()
})
</script>

<template>
  <div id="app">
    <ErrorBoundary>
      <RouterView />
      <MiniPlayer v-if="showMiniPlayer" />
      <BottomNavigation v-if="showBottomNav" />
      <!-- 全局音频播放器 -->
      <AudioPlayer />
    </ErrorBoundary>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: #000;
  color: #fff;
  overflow-x: hidden;
  /* 禁止双击缩放 */
  touch-action: manipulation;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  user-select: none;
}

#app {
  min-height: 100vh;
  position: relative;
}

/* 全局滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* 响应式字体大小 */
@media (max-width: 768px) {
  html {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  html {
    font-size: 13px;
  }
}

/* 安全区域适配 */
@supports (padding: max(0px)) {
  body {
    padding-left: max(0px, env(safe-area-inset-left));
    padding-right: max(0px, env(safe-area-inset-right));
  }
}

/* 禁用文本选择（移动端优化） */
.no-select {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* 全局按钮样式重置 */
button {
  /* 重置浏览器默认样式 */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;

  /* 移除默认的点击高亮 */
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  /* 确保按钮状态正确重置 */
  outline: none;
  border: none;
  background: none;

  /* 防止点击状态保留 */
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}

/* 移除所有按钮的focus状态默认样式 */
button:focus {
  outline: none;
  box-shadow: none;
}

/* 确保按钮active状态不会保留 */
button:active {
  transform: none;
  outline: none;
}

/* 全局可点击元素样式重置 */
[role='button'],
.clickable,
*[onclick],
*[tabindex]:not([tabindex='-1']) {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  outline: none;
}

/* 触摸反馈 - 仅应用于特定类 */
.touch-feedback {
  -webkit-tap-highlight-color: rgba(255, 255, 255, 0.1);
}

/* 动画性能优化 */
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform;
}
</style>
