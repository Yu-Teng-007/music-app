import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import { realtimeService } from './services'
import { imgFallbackDirective } from './utils/imageHandlers'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 注册全局指令
app.directive('img-fallback', imgFallbackDirective)

app.mount('#app')

// 初始化WebSocket连接
const initializeWebSocket = () => {
  const authStore = useAuthStore()
  if (authStore.isAuthenticated && authStore.token) {
    realtimeService.connect(authStore.token, import.meta.env.VITE_API_URL || '/api')
  }
}

// 当用户登录或刷新令牌时初始化WebSocket
document.addEventListener('auth:login', initializeWebSocket)
document.addEventListener('auth:refresh', initializeWebSocket)

// 当用户注销时断开WebSocket连接
document.addEventListener('auth:logout', () => {
  realtimeService.disconnect()
})

// 如果用户已经登录，初始化WebSocket连接
if (useAuthStore().isAuthenticated) {
  initializeWebSocket()
}
