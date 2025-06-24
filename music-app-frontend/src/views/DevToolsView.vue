<template>
  <div class="dev-tools-container">
    <div class="dev-tools-card">
      <h1 class="dev-tools-title">开发工具</h1>
      <p class="dev-tools-subtitle">仅在开发环境下可用</p>

      <div class="tools-section">
        <h2 class="section-title">短信验证码</h2>

        <div class="action-buttons">
          <button @click="refreshSmsCodes" class="refresh-button" :disabled="isLoading">
            {{ isLoading ? '刷新中...' : '刷新验证码列表' }}
          </button>
        </div>

        <div v-if="smsCodes.length === 0" class="empty-state">
          <p>暂无验证码</p>
        </div>

        <div v-else class="codes-list">
          <div v-for="code in smsCodes" :key="`${code.phone}_${code.type}`" class="code-item">
            <div class="code-info">
              <div class="phone-type">
                <span class="phone">{{ code.phone }}</span>
                <span class="type-badge" :class="code.type">{{
                  code.type === 'login' ? '登录' : '注册'
                }}</span>
              </div>
              <div class="code-value">{{ code.code }}</div>
              <div class="expires-at">过期时间: {{ formatDate(code.expiresAt) }}</div>
            </div>
            <button @click="copyCode(code.code)" class="copy-button" title="复制验证码">📋</button>
          </div>
        </div>
      </div>

      <!-- 引导页面测试工具 -->
      <div class="tools-section">
        <h2 class="section-title">引导页面测试</h2>

        <div class="onboarding-status">
          <div class="status-item">
            <span class="status-label">首次启动状态:</span>
            <span class="status-value" :class="{ 'is-first': isFirstTime }">
              {{ isFirstTime ? '是' : '否' }}
            </span>
          </div>
          <div class="status-item">
            <span class="status-label">引导完成状态:</span>
            <span class="status-value" :class="{ 'is-completed': isCompleted }">
              {{ isCompleted ? '已完成' : '未完成' }}
            </span>
          </div>
          <div class="status-item">
            <span class="status-label">首次启动时间:</span>
            <span class="status-value">{{ firstLaunchTime || '未记录' }}</span>
          </div>
        </div>

        <div class="action-buttons">
          <button @click="clearOnboarding" class="danger-button">清除引导标记</button>
          <button @click="goToOnboarding" class="primary-button">前往引导页面</button>
          <button @click="refreshOnboardingStatus" class="refresh-button">刷新状态</button>
        </div>
      </div>

      <div class="back-link">
        <router-link to="/auth" class="link-button">返回登录页面</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  isFirstLaunch,
  isOnboardingCompleted,
  getFirstLaunchTime,
  clearFirstLaunchFlag,
} from '@/utils'

const router = useRouter()
const authStore = useAuthStore()

// 状态
const isLoading = ref(false)
const smsCodes = ref<Array<{ phone: string; code: string; type: string; expiresAt: string }>>([])

// 引导页面相关状态
const isFirstTime = ref(false)
const isCompleted = ref(false)
const firstLaunchTime = ref<string | null>(null)

// 刷新验证码列表
const refreshSmsCodes = async () => {
  isLoading.value = true
  try {
    smsCodes.value = await authStore.getAllSmsCodes()
  } catch (error) {
    console.error('Failed to get SMS codes:', error)
  } finally {
    isLoading.value = false
  }
}

// 复制验证码
const copyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code)
    alert('验证码已复制到剪贴板')
  } catch (error) {
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = code
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    alert('验证码已复制到剪贴板')
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 引导页面相关方法
const refreshOnboardingStatus = () => {
  isFirstTime.value = isFirstLaunch()
  isCompleted.value = isOnboardingCompleted()
  firstLaunchTime.value = getFirstLaunchTime()
}

const clearOnboarding = () => {
  clearFirstLaunchFlag()
  refreshOnboardingStatus()
  alert('引导标记已清除！现在访问首页将显示引导页面。')
}

const goToOnboarding = () => {
  router.push('/onboarding')
}

// 组件挂载时获取验证码列表和引导状态
onMounted(() => {
  refreshSmsCodes()
  refreshOnboardingStatus()
})
</script>

<style scoped>
.dev-tools-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.dev-tools-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.dev-tools-title {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  text-align: center;
  margin-bottom: 0.5rem;
}

.dev-tools-subtitle {
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  margin-bottom: 2rem;
}

.tools-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin-bottom: 1rem;
}

.action-buttons {
  margin-bottom: 1rem;
}

.refresh-button {
  background: rgba(0, 122, 255, 0.8);
  border: none;
  border-radius: 8px;
  color: white;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-button:hover:not(:disabled) {
  background: rgba(0, 122, 255, 1);
}

.refresh-button:disabled {
  background: rgba(255, 255, 255, 0.3);
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  padding: 2rem;
}

.codes-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.code-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.code-info {
  flex: 1;
}

.phone-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.phone {
  color: white;
  font-weight: 600;
}

.type-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.type-badge.login {
  background: rgba(52, 199, 89, 0.8);
  color: white;
}

.type-badge.register {
  background: rgba(255, 149, 0, 0.8);
  color: white;
}

.code-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffd700;
  margin-bottom: 0.25rem;
  font-family: 'Courier New', monospace;
}

.expires-at {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
}

.copy-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  padding: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.copy-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.back-link {
  text-align: center;
  margin-top: 2rem;
}

.link-button {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.link-button:hover {
  color: white;
}

/* 引导页面测试相关样式 */
.onboarding-status {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.status-item:last-child {
  margin-bottom: 0;
}

.status-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.status-value {
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
}

.status-value.is-first {
  color: #ffd700;
}

.status-value.is-completed {
  color: #4ade80;
}

.primary-button {
  background: rgba(74, 222, 128, 0.8);
  border: none;
  border-radius: 8px;
  color: white;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 0.5rem;
}

.primary-button:hover {
  background: rgba(74, 222, 128, 1);
}

.danger-button {
  background: rgba(239, 68, 68, 0.8);
  border: none;
  border-radius: 8px;
  color: white;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 0.5rem;
}

.danger-button:hover {
  background: rgba(239, 68, 68, 1);
}

@media (max-width: 768px) {
  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .primary-button,
  .danger-button,
  .refresh-button {
    margin-right: 0;
    width: 100%;
  }

  .status-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
