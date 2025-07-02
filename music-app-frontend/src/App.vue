<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import BottomNavigation from './components/BottomNavigation.vue'
import MiniPlayer from './components/MiniPlayer.vue'
import AudioPlayer from './components/AudioPlayer.vue'
import ErrorBoundary from './components/ErrorBoundary.vue'
import ErrorNotification from './components/ErrorNotification.vue'
import { AppLayout } from './components/layout'

const route = useRoute()
const authStore = useAuthStore()

// 判断是否显示底部导航栏
const showBottomNav = computed(() => {
  const hiddenRoutes = ['/player', '/auth', '/onboarding', '/dev-tools']
  return (
    !hiddenRoutes.includes(route.path) &&
    !route.path.startsWith('/auth') &&
    !route.meta.hideNavigation
  )
})

// 判断是否显示迷你播放器
const showMiniPlayer = computed(() => {
  const hiddenRoutes = ['/player', '/auth', '/onboarding', '/dev-tools']
  return (
    !hiddenRoutes.includes(route.path) &&
    !route.path.startsWith('/auth') &&
    !route.meta.hideNavigation
  )
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
      <!-- 使用布局组件包装所有页面内容 -->
      <AppLayout>
        <RouterView />
      </AppLayout>

      <!-- 固定位置的全局组件 -->
      <MiniPlayer v-if="showMiniPlayer" />
      <BottomNavigation v-if="showBottomNav" />

      <!-- 全局音频播放器 -->
      <AudioPlayer />

      <!-- 全局错误提示 -->
      <ErrorNotification />
    </ErrorBoundary>
  </div>
</template>
