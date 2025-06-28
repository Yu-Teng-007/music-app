import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import { realtimeService, csrfService } from './services'
import { imgFallbackDirective } from './utils/imageHandlers'
import {
  initNetworkStatusMonitor,
  onNetworkStatusChange,
  showNetworkStatusNotification,
} from './utils/networkStatus'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 注册全局指令
app.directive('img-fallback', imgFallbackDirective)

app.mount('#app')

// 初始化CSRF token
const initializeCsrf = async () => {
  try {
    await csrfService.getToken()
    console.log('CSRF token初始化成功')
  } catch (error) {
    console.warn('CSRF token初始化失败:', error)
    // CSRF初始化失败不应该阻止应用启动
  }
}

// 初始化WebSocket连接
const initializeWebSocket = () => {
  const authStore = useAuthStore()
  if (authStore.isAuthenticated && authStore.token) {
    try {
      realtimeService.connect(
        authStore.token,
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
      )
    } catch (error) {
      console.warn('WebSocket连接失败:', error)
      // WebSocket连接失败不应该阻止应用启动
    }
  }
}

// 当用户登录或刷新令牌时初始化WebSocket
document.addEventListener('auth:login', initializeWebSocket)
document.addEventListener('auth:refresh', initializeWebSocket)

// 当用户注销时断开WebSocket连接
document.addEventListener('auth:logout', () => {
  realtimeService.disconnect()
})

// 启动应用时初始化CSRF token
initializeCsrf()

// 初始化网络状态监控
const cleanupNetworkMonitor = initNetworkStatusMonitor()

// 监听网络状态变化
const unsubscribeNetworkStatus = onNetworkStatusChange(status => {
  showNetworkStatusNotification(status)

  // 当后端服务恢复时，重新初始化WebSocket连接
  if (status.backendAvailable && useAuthStore().isAuthenticated) {
    initializeWebSocket()
  }
})

// 如果用户已经登录，初始化WebSocket连接
if (useAuthStore().isAuthenticated) {
  initializeWebSocket()
}

// 应用卸载时清理资源
window.addEventListener('beforeunload', () => {
  cleanupNetworkMonitor()
  unsubscribeNetworkStatus()
  realtimeService.disconnect()
})
