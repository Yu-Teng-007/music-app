<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-container">
      <div class="error-icon">
        <AlertTriangle :size="64" />
      </div>

      <div class="error-content">
        <h2>出现了一些问题</h2>
        <p class="error-message">应用遇到了意外错误，我们正在努力修复这个问题。</p>

        <div class="error-details" v-if="showDetails">
          <h3>错误详情：</h3>
          <pre class="error-stack">{{ errorInfo }}</pre>
        </div>
      </div>

      <div class="error-actions">
        <button @click="retry" class="primary-btn">
          <RefreshCw :size="20" />
          重试
        </button>
        <button @click="goHome" class="secondary-btn">
          <Home :size="20" />
          回到首页
        </button>
        <button @click="toggleDetails" class="secondary-btn">
          <Info :size="20" />
          {{ showDetails ? '隐藏' : '显示' }}详情
        </button>
      </div>

      <div class="error-report">
        <button @click="reportError" class="report-btn">
          <Send :size="16" />
          报告错误
        </button>
      </div>
    </div>
  </div>

  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'
import { AlertTriangle, RefreshCw, Home, Info, Send } from 'lucide-vue-next'

const router = useRouter()

const hasError = ref(false)
const errorInfo = ref('')
const showDetails = ref(false)

// 捕获子组件错误
onErrorCaptured((error: Error, instance, info) => {
  console.error('Error captured by ErrorBoundary:', error)
  console.error('Component instance:', instance)
  console.error('Error info:', info)

  hasError.value = true
  errorInfo.value = `${error.message}\n\n${error.stack || ''}\n\nComponent: ${info}`

  // 阻止错误继续传播
  return false
})

// 监听全局未捕获的错误
window.addEventListener('error', event => {
  console.error('Global error:', event.error)
  hasError.value = true
  errorInfo.value = `${event.error?.message || event.message}\n\n${event.error?.stack || ''}`
})

// 监听Promise rejection
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection:', event.reason)
  hasError.value = true
  errorInfo.value = `Promise rejection: ${event.reason}`
})

const retry = () => {
  hasError.value = false
  errorInfo.value = ''
  showDetails.value = false

  // 重新加载当前路由
  router.go(0)
}

const goHome = () => {
  hasError.value = false
  errorInfo.value = ''
  showDetails.value = false
  router.push('/')
}

const toggleDetails = () => {
  showDetails.value = !showDetails.value
}

const reportError = () => {
  // TODO: 实现错误报告功能
  const errorReport = {
    error: errorInfo.value,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  }

  console.log('Error report:', errorReport)

  // 这里可以发送错误报告到服务器
  alert('错误报告已发送，感谢您的反馈！')
}
</script>

<style scoped>
.error-boundary {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: var(--bg-primary);
}

.error-container {
  max-width: 600px;
  text-align: center;
  background: var(--bg-secondary);
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.error-icon {
  color: var(--danger, #ff4757);
  margin-bottom: 24px;
}

.error-content {
  margin-bottom: 32px;
}

.error-content h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.error-message {
  font-size: 16px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 24px;
}

.error-details {
  text-align: left;
  margin-top: 24px;
  padding: 16px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  border-left: 4px solid var(--danger, #ff4757);
}

.error-details h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.error-stack {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: var(--text-secondary);
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
  margin: 0;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.primary-btn,
.secondary-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  text-decoration: none;
}

.primary-btn {
  background: var(--primary);
  color: white;
}

.primary-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.secondary-btn {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.secondary-btn:hover {
  background: var(--bg-hover);
}

.error-report {
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

.report-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.report-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .error-container {
    padding: 24px;
    margin: 16px;
  }

  .error-actions {
    flex-direction: column;
    align-items: center;
  }

  .primary-btn,
  .secondary-btn {
    width: 100%;
    max-width: 200px;
    justify-content: center;
  }
}
</style>
