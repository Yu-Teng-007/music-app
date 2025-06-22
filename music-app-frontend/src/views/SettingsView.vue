<template>
  <div class="settings-view">
    <!-- 头部 -->
    <div class="header">
      <button class="back-button" @click="goBack">
        <ChevronLeft :size="24" />
      </button>
      <h1>设置</h1>
    </div>

    <!-- 播放设置 -->
    <div class="settings-section">
      <h2>播放</h2>

      <div class="setting-item">
        <div class="setting-info">
          <h3>离线模式</h3>
          <p>离线状态下也能播放已下载的本地歌曲</p>
        </div>
        <div
          class="toggle-switch"
          :class="{ active: settings.offlineMode }"
          @click="toggleOfflineMode"
        >
          <div class="toggle-thumb"></div>
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-info">
          <h3>自动混音</h3>
          <p>允许播放列表中的歌曲自动混音播放</p>
        </div>
        <div class="toggle-switch" :class="{ active: settings.autoMix }" @click="toggleAutoMix">
          <div class="toggle-thumb"></div>
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-info">
          <h3>显示无法播放的歌曲</h3>
          <p>显示不能播放的歌曲</p>
        </div>
        <div
          class="toggle-switch"
          :class="{ active: settings.showUnavailable }"
          @click="toggleShowUnavailable"
        >
          <div class="toggle-thumb"></div>
        </div>
      </div>
    </div>

    <!-- 存储空间 -->
    <div class="settings-section">
      <h2>存储空间</h2>

      <div class="storage-info">
        <div class="storage-item">
          <div class="storage-dot other-apps"></div>
          <span>其他APP</span>
          <span class="storage-size">64.5GB</span>
        </div>
        <div class="storage-item">
          <div class="storage-dot cache"></div>
          <span>缓存</span>
          <span class="storage-size">1.2GB</span>
        </div>
        <div class="storage-item">
          <div class="storage-dot available"></div>
          <span>可用空间</span>
          <span class="storage-size">40.8GB</span>
        </div>
      </div>

      <div class="storage-bar">
        <div class="storage-used" :style="{ width: usedStoragePercentage + '%' }"></div>
      </div>

      <button class="clear-cache-btn" @click="clearCache">清除缓存</button>
    </div>

    <!-- 账户设置 -->
    <div v-if="authStore.isAuthenticated" class="settings-section">
      <h2>账户</h2>

      <div class="setting-item" @click="showProfileEdit = true">
        <div class="setting-info">
          <h3>个人资料</h3>
          <p>编辑姓名、头像等信息</p>
        </div>
        <ChevronRight :size="16" />
      </div>

      <div class="setting-item" @click="showPasswordChange = true">
        <div class="setting-info">
          <h3>修改密码</h3>
          <p>更改登录密码</p>
        </div>
        <ChevronRight :size="16" />
      </div>

      <div class="setting-item" @click="handleLogout">
        <div class="setting-info">
          <h3>退出登录</h3>
          <p>退出当前账户</p>
        </div>
        <LogOut :size="16" />
      </div>
    </div>

    <!-- 其他 -->
    <div class="settings-section">
      <h2>其他</h2>

      <div class="setting-item">
        <div class="setting-info">
          <h3>版本</h3>
        </div>
        <span class="version-text">1.0.0</span>
      </div>
    </div>

    <!-- 个人资料编辑模态框 -->
    <div v-if="showProfileEdit" class="modal-overlay" @click="showProfileEdit = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">编辑个人资料</h3>
        <form @submit.prevent="handleProfileUpdate">
          <div class="form-group">
            <label class="form-label">姓名</label>
            <input
              v-model="profileForm.name"
              type="text"
              class="form-input"
              placeholder="请输入姓名"
              required
            />
          </div>
          <div class="modal-actions">
            <button type="button" class="cancel-button" @click="showProfileEdit = false">
              取消
            </button>
            <button type="submit" class="submit-button" :disabled="authStore.isLoading">
              {{ authStore.isLoading ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 修改密码模态框 -->
    <div v-if="showPasswordChange" class="modal-overlay" @click="showPasswordChange = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">修改密码</h3>
        <form @submit.prevent="handlePasswordChange">
          <div class="form-group">
            <label class="form-label">当前密码</label>
            <input
              v-model="passwordForm.currentPassword"
              type="password"
              class="form-input"
              placeholder="请输入当前密码"
              required
            />
          </div>
          <div class="form-group">
            <label class="form-label">新密码</label>
            <input
              v-model="passwordForm.newPassword"
              type="password"
              class="form-input"
              placeholder="请输入新密码"
              required
            />
          </div>
          <div class="modal-actions">
            <button type="button" class="cancel-button" @click="showPasswordChange = false">
              取消
            </button>
            <button type="submit" class="submit-button" :disabled="authStore.isLoading">
              {{ authStore.isLoading ? '修改中...' : '修改密码' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/auth'
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

// 页面状态
const showProfileEdit = ref(false)
const showPasswordChange = ref(false)

// 设置状态
const settings = reactive({
  offlineMode: true,
  autoMix: true,
  showUnavailable: false,
})

const storage = reactive({
  otherApps: 64.5,
  cache: 1.2,
  available: 40.8,
  total: 106.5,
})

// 表单数据
const profileForm = reactive({
  name: '',
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
})

// 计算属性
const usedStoragePercentage = computed(() => {
  const used = storage.otherApps + storage.cache
  return (used / storage.total) * 100
})

// 方法
const goBack = () => {
  router.go(-1)
}

const toggleOfflineMode = () => {
  settings.offlineMode = !settings.offlineMode
}

const toggleAutoMix = () => {
  settings.autoMix = !settings.autoMix
}

const toggleShowUnavailable = () => {
  settings.showUnavailable = !settings.showUnavailable
}

const clearCache = () => {
  // 清除缓存逻辑
  console.log('缓存清除成功')
}

// 处理个人资料更新
const handleProfileUpdate = async () => {
  try {
    await authService.updateProfile(profileForm)
    showProfileEdit.value = false
    console.log('个人资料更新成功')
  } catch (error) {
    console.error('Profile update failed:', error)
  }
}

// 处理密码修改
const handlePasswordChange = async () => {
  try {
    await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword)
    showPasswordChange.value = false
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    console.log('密码修改成功')
  } catch (error) {
    console.error('Password change failed:', error)
  }
}

// 处理登出
const handleLogout = async () => {
  try {
    await authService.logout()
    router.push('/auth')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

// 组件挂载时初始化数据
onMounted(() => {
  if (authStore.user) {
    profileForm.name = authStore.user.name
  }
})
</script>

<style scoped>
.settings-view {
  min-height: 100vh;
  background: linear-gradient(to bottom, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: white;
  padding-bottom: 100px;
}

.header {
  display: flex;
  align-items: center;
  padding: 1rem;
  gap: 1rem;
  position: sticky;
  top: 0;
  background: rgba(26, 26, 46, 0.9);
  backdrop-filter: blur(10px);
  z-index: 10;
}

.back-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.settings-section {
  margin: 1.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.settings-section h2 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: white;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info h3 {
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 0.25rem 0;
  color: white;
}

.setting-info p {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.toggle-switch {
  width: 50px;
  height: 28px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 14px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.3s;
}

.toggle-switch.active {
  background: #007aff;
}

.toggle-thumb {
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.3s;
}

.toggle-switch.active .toggle-thumb {
  transform: translateX(22px);
}

.storage-info {
  margin-bottom: 1rem;
}

.storage-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.storage-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.storage-dot.other-apps {
  background: #007aff;
}

.storage-dot.cache {
  background: #34c759;
}

.storage-dot.available {
  background: #ff9500;
}

.storage-size {
  margin-left: auto;
  font-weight: 500;
}

.storage-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.storage-used {
  height: 100%;
  background: linear-gradient(to right, #007aff 0%, #34c759 60%, #ff9500 100%);
  transition: width 0.3s;
}

.clear-cache-btn {
  width: 100%;
  padding: 0.875rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.75rem;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-cache-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.version-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.modal-title {
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  text-align: center;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.form-input:focus {
  outline: none;
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.2);
  background: rgba(255, 255, 255, 0.15);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.cancel-button {
  flex: 1;
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-button:hover {
  background: rgba(255, 255, 255, 0.15);
}

.submit-button {
  flex: 1;
  padding: 0.875rem 1rem;
  background: linear-gradient(135deg, #007aff, #0056cc);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #0056cc, #003d99);
  transform: translateY(-1px);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .modal-actions {
    flex-direction: column;
  }
}
</style>
