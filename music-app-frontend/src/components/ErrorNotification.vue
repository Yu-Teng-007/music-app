<template>
  <Transition name="fade">
    <div v-if="errors.length > 0" class="error-notification-container">
      <div
        v-for="error in errors"
        :key="error.id"
        class="error-notification"
        :class="{ 'error-notification--dismissing': error.dismissing }"
      >
        <div class="error-notification__content">
          <div class="error-notification__icon">
            <AlertCircle :size="20" />
          </div>
          <div class="error-notification__message">
            <div class="error-notification__title">{{ getErrorTitle(error) }}</div>
            <div class="error-notification__text">{{ error.message }}</div>
          </div>
        </div>
        <button class="error-notification__close" @click="dismissError(error.id)">
          <X :size="16" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { AlertCircle, X } from 'lucide-vue-next'
import errorService, { type AppError } from '@/services/ErrorService'

// 本地错误列表，添加了dismissing状态用于动画
interface LocalError extends AppError {
  dismissing?: boolean
}

const errors = ref<LocalError[]>([])
let errorUnsubscribe: (() => void) | null = null

// 错误标题映射
const errorTitles: Record<string, string> = {
  HTTP_401: '认证失败',
  HTTP_403: '权限不足',
  HTTP_404: '资源不存在',
  HTTP_500: '服务器错误',
  NETWORK_ERROR: '网络错误',
  APP_ERROR: '应用错误',
  UNKNOWN_ERROR: '未知错误',
}

// 获取错误标题
const getErrorTitle = (error: AppError): string => {
  // 从映射中获取标题，如果没有则使用通用标题
  return errorTitles[error.code] || '操作失败'
}

// 关闭错误提示
const dismissError = (errorId: string) => {
  // 找到错误
  const error = errors.value.find(e => e.id === errorId)
  if (!error) return

  // 添加dismissing状态用于动画
  error.dismissing = true

  // 延迟移除，等待动画完成
  setTimeout(() => {
    // 从本地列表中移除
    errors.value = errors.value.filter(e => e.id !== errorId)
    // 在服务中标记为已处理
    errorService.dismissError(errorId)
  }, 300)
}

// 自动关闭错误提示
const autoCloseError = (errorId: string, delay: number = 5000) => {
  setTimeout(() => {
    dismissError(errorId)
  }, delay)
}

onMounted(() => {
  // 订阅错误服务
  errorUnsubscribe = errorService.onError(error => {
    // 添加到本地列表
    errors.value.push(error)

    // 自动关闭
    autoCloseError(error.id)
  })

  // 加载现有错误
  const existingErrors = errorService.getErrors()
  errors.value = [...existingErrors]

  // 为现有错误设置自动关闭
  existingErrors.forEach(error => {
    autoCloseError(error.id)
  })
})

onUnmounted(() => {
  // 取消订阅
  if (errorUnsubscribe) {
    errorUnsubscribe()
  }
})
</script>

<style scoped>
.error-notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 350px;
  width: 100%;
}

.error-notification {
  background-color: rgba(30, 30, 30, 0.9);
  color: white;
  border-left: 4px solid #f43f5e;
  border-radius: 4px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  backdrop-filter: blur(10px);
  transform: translateX(0);
  opacity: 1;
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.error-notification--dismissing {
  transform: translateX(100%);
  opacity: 0;
}

.error-notification__content {
  display: flex;
  gap: 12px;
  flex: 1;
}

.error-notification__icon {
  color: #f43f5e;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-notification__message {
  flex: 1;
}

.error-notification__title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.error-notification__text {
  font-size: 13px;
  opacity: 0.9;
}

.error-notification__close {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.error-notification__close:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
