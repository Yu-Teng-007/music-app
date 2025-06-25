<template>
  <div class="account-view">
    <!-- 头部 -->
    <div class="header">
      <button class="back-button" @click="goBack">
        <ChevronLeft :size="24" />
      </button>
      <h1>账户管理</h1>
      <div class="header-actions">
        <button class="save-button" @click="saveChanges" :disabled="!hasChanges">
          <Save :size="20" />
        </button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content">
      <!-- 个人信息 -->
      <div class="section">
        <h2 class="section-title">
          <User :size="20" />
          个人信息
        </h2>
        <div class="info-card">
          <!-- 头像 -->
          <div class="avatar-section">
            <div class="avatar-container">
              <img :src="userForm.avatar" :alt="userForm.name" @error="handleImageError" />
              <button class="avatar-edit-button" @click="showAvatarModal = true">
                <Camera :size="16" />
              </button>
            </div>
            <div class="avatar-info">
              <h3>{{ userForm.name }}</h3>
              <p>{{ userForm.email || userForm.phone }}</p>
            </div>
          </div>

          <!-- 基本信息表单 -->
          <div class="form-section">
            <div class="form-group">
              <label for="name">昵称</label>
              <input
                id="name"
                v-model="userForm.name"
                type="text"
                placeholder="请输入昵称"
                maxlength="20"
              />
            </div>

            <div class="form-group">
              <label for="bio">个人简介</label>
              <textarea
                id="bio"
                v-model="userForm.bio"
                placeholder="介绍一下自己吧..."
                maxlength="100"
                rows="3"
              ></textarea>
              <span class="char-count">{{ userForm.bio?.length || 0 }}/100</span>
            </div>

            <div class="form-group">
              <label for="birthday">生日</label>
              <input id="birthday" v-model="userForm.birthday" type="date" />
            </div>

            <div class="form-group">
              <label for="gender">性别</label>
              <select id="gender" v-model="userForm.gender">
                <option value="">请选择</option>
                <option value="male">男</option>
                <option value="female">女</option>
                <option value="other">其他</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- 联系方式 -->
      <div class="section">
        <h2 class="section-title">
          <Phone :size="20" />
          联系方式
        </h2>
        <div class="contact-card">
          <div class="contact-item">
            <div class="contact-info">
              <div class="contact-label">手机号码</div>
              <div class="contact-value">{{ userForm.phone || '未绑定' }}</div>
            </div>
            <button class="contact-action" @click="showPhoneModal = true">
              {{ userForm.phone ? '更换' : '绑定' }}
            </button>
          </div>

          <div class="contact-item">
            <div class="contact-info">
              <div class="contact-label">邮箱地址</div>
              <div class="contact-value">{{ userForm.email || '未绑定' }}</div>
            </div>
            <button class="contact-action" @click="showEmailModal = true">
              {{ userForm.email ? '更换' : '绑定' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 安全设置 -->
      <div class="section">
        <h2 class="section-title">
          <Shield :size="20" />
          安全设置
        </h2>
        <div class="security-card">
          <div class="security-item" @click="showPasswordModal = true">
            <div class="security-info">
              <div class="security-label">登录密码</div>
              <div class="security-desc">定期更换密码，保护账户安全</div>
            </div>
            <ChevronRight :size="20" />
          </div>

          <div class="security-item">
            <div class="security-info">
              <div class="security-label">双重验证</div>
              <div class="security-desc">开启后登录需要验证码确认</div>
            </div>
            <div class="security-toggle">
              <input
                id="two-factor"
                v-model="userForm.twoFactorEnabled"
                type="checkbox"
                class="toggle-input"
              />
              <label for="two-factor" class="toggle-label"></label>
            </div>
          </div>

          <div class="security-item">
            <div class="security-info">
              <div class="security-label">登录通知</div>
              <div class="security-desc">新设备登录时发送通知</div>
            </div>
            <div class="security-toggle">
              <input
                id="login-notify"
                v-model="userForm.loginNotifyEnabled"
                type="checkbox"
                class="toggle-input"
              />
              <label for="login-notify" class="toggle-label"></label>
            </div>
          </div>
        </div>
      </div>

      <!-- 隐私设置 -->
      <div class="section">
        <h2 class="section-title">
          <Lock :size="20" />
          隐私设置
        </h2>
        <div class="privacy-card">
          <div class="privacy-item">
            <div class="privacy-info">
              <div class="privacy-label">个人资料可见性</div>
              <div class="privacy-desc">控制其他用户查看你的个人信息</div>
            </div>
            <select v-model="userForm.profileVisibility" class="privacy-select">
              <option value="public">公开</option>
              <option value="friends">仅好友</option>
              <option value="private">私密</option>
            </select>
          </div>

          <div class="privacy-item">
            <div class="privacy-info">
              <div class="privacy-label">播放历史可见性</div>
              <div class="privacy-desc">控制其他用户查看你的播放记录</div>
            </div>
            <select v-model="userForm.historyVisibility" class="privacy-select">
              <option value="public">公开</option>
              <option value="friends">仅好友</option>
              <option value="private">私密</option>
            </select>
          </div>

          <div class="privacy-item">
            <div class="privacy-info">
              <div class="privacy-label">在线状态</div>
              <div class="privacy-desc">显示你的在线状态给其他用户</div>
            </div>
            <div class="privacy-toggle">
              <input
                id="online-status"
                v-model="userForm.showOnlineStatus"
                type="checkbox"
                class="toggle-input"
              />
              <label for="online-status" class="toggle-label"></label>
            </div>
          </div>
        </div>
      </div>

      <!-- 危险操作 -->
      <div class="section">
        <h2 class="section-title danger">
          <AlertTriangle :size="20" />
          危险操作
        </h2>
        <div class="danger-card">
          <div class="danger-item" @click="showDeleteModal = true">
            <div class="danger-info">
              <div class="danger-label">删除账户</div>
              <div class="danger-desc">永久删除账户和所有数据，此操作不可恢复</div>
            </div>
            <ChevronRight :size="20" />
          </div>
        </div>
      </div>
    </div>

    <!-- 头像选择模态框 -->
    <div v-if="showAvatarModal" class="modal-overlay" @click="showAvatarModal = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">更换头像</h3>
        <div class="avatar-options">
          <div
            v-for="avatar in avatarOptions"
            :key="avatar"
            class="avatar-option"
            :class="{ active: userForm.avatar === avatar }"
            @click="selectAvatar(avatar)"
          >
            <img :src="avatar" alt="" />
          </div>
        </div>
        <div class="modal-actions">
          <button class="cancel-button" @click="showAvatarModal = false">取消</button>
          <button class="confirm-button" @click="confirmAvatar">确定</button>
        </div>
      </div>
    </div>

    <!-- 手机号码模态框 -->
    <div v-if="showPhoneModal" class="modal-overlay" @click="showPhoneModal = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">{{ userForm.phone ? '更换' : '绑定' }}手机号码</h3>
        <div class="form-group">
          <label>新手机号码</label>
          <input v-model="newPhone" type="tel" placeholder="请输入手机号码" />
        </div>
        <div class="form-group">
          <label>验证码</label>
          <div class="verification-input">
            <input v-model="phoneCode" type="text" placeholder="请输入验证码" />
            <button class="send-code-button" @click="sendPhoneCode" :disabled="codeSending">
              {{ codeSending ? '发送中...' : '发送验证码' }}
            </button>
          </div>
        </div>
        <div class="modal-actions">
          <button class="cancel-button" @click="showPhoneModal = false">取消</button>
          <button class="confirm-button" @click="confirmPhone">确定</button>
        </div>
      </div>
    </div>

    <!-- 邮箱模态框 -->
    <div v-if="showEmailModal" class="modal-overlay" @click="showEmailModal = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">{{ userForm.email ? '更换' : '绑定' }}邮箱地址</h3>
        <div class="form-group">
          <label>新邮箱地址</label>
          <input v-model="newEmail" type="email" placeholder="请输入邮箱地址" />
        </div>
        <div class="form-group">
          <label>验证码</label>
          <div class="verification-input">
            <input v-model="emailCode" type="text" placeholder="请输入验证码" />
            <button class="send-code-button" @click="sendEmailCode" :disabled="codeSending">
              {{ codeSending ? '发送中...' : '发送验证码' }}
            </button>
          </div>
        </div>
        <div class="modal-actions">
          <button class="cancel-button" @click="showEmailModal = false">取消</button>
          <button class="confirm-button" @click="confirmEmail">确定</button>
        </div>
      </div>
    </div>

    <!-- 密码修改模态框 -->
    <div v-if="showPasswordModal" class="modal-overlay" @click="showPasswordModal = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">修改密码</h3>
        <div class="form-group">
          <label>当前密码</label>
          <input v-model="passwordForm.current" type="password" placeholder="请输入当前密码" />
        </div>
        <div class="form-group">
          <label>新密码</label>
          <input v-model="passwordForm.new" type="password" placeholder="请输入新密码" />
        </div>
        <div class="form-group">
          <label>确认新密码</label>
          <input v-model="passwordForm.confirm" type="password" placeholder="请再次输入新密码" />
        </div>
        <div class="modal-actions">
          <button class="cancel-button" @click="showPasswordModal = false">取消</button>
          <button class="confirm-button" @click="confirmPassword">确定</button>
        </div>
      </div>
    </div>

    <!-- 删除账户确认模态框 -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content danger-modal" @click.stop>
        <h3 class="modal-title">删除账户</h3>
        <p class="modal-message">此操作将永久删除你的账户和所有数据，包括：</p>
        <ul class="delete-list">
          <li>个人资料和设置</li>
          <li>播放历史和收藏</li>
          <li>创建的歌单</li>
          <li>所有用户数据</li>
        </ul>
        <p class="modal-warning">
          <strong>此操作不可恢复，请谨慎操作！</strong>
        </p>
        <div class="form-group">
          <label>请输入 "删除我的账户" 确认</label>
          <input v-model="deleteConfirmText" type="text" placeholder="删除我的账户" />
        </div>
        <div class="modal-actions">
          <button class="cancel-button" @click="showDeleteModal = false">取消</button>
          <button
            class="danger-button"
            @click="confirmDelete"
            :disabled="deleteConfirmText !== '删除我的账户'"
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  ChevronLeft,
  Save,
  User,
  Camera,
  Phone,
  Shield,
  Lock,
  AlertTriangle,
  ChevronRight,
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

// 表单数据
const userForm = ref({
  name: '',
  email: '',
  phone: '',
  avatar: '',
  bio: '',
  birthday: '',
  gender: '',
  twoFactorEnabled: false,
  loginNotifyEnabled: true,
  profileVisibility: 'public',
  historyVisibility: 'friends',
  showOnlineStatus: true,
})

// 原始数据（用于检测变化）
const originalData = ref({})

// 模态框状态
const showAvatarModal = ref(false)
const showPhoneModal = ref(false)
const showEmailModal = ref(false)
const showPasswordModal = ref(false)
const showDeleteModal = ref(false)

// 表单状态
const newPhone = ref('')
const phoneCode = ref('')
const newEmail = ref('')
const emailCode = ref('')
const codeSending = ref(false)
const deleteConfirmText = ref('')

// 密码表单
const passwordForm = ref({
  current: '',
  new: '',
  confirm: '',
})

// 头像选项
const avatarOptions = ref([
  'https://picsum.photos/200/200?random=1',
  'https://picsum.photos/200/200?random=2',
  'https://picsum.photos/200/200?random=3',
  'https://picsum.photos/200/200?random=4',
  'https://picsum.photos/200/200?random=5',
  'https://picsum.photos/200/200?random=6',
  'https://picsum.photos/200/200?random=7',
  'https://picsum.photos/200/200?random=8',
])

// 计算属性
const hasChanges = computed(() => {
  return JSON.stringify(userForm.value) !== JSON.stringify(originalData.value)
})

// 方法
function loadUserData() {
  // 从认证存储加载用户数据
  const user: any = authStore.user
  if (user) {
    userForm.value = {
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      avatar: user.avatar || 'https://picsum.photos/200/200?random=1',
      bio: user.bio || '',
      birthday: user.birthday || '',
      gender: user.gender || '',
      twoFactorEnabled: user.twoFactorEnabled || false,
      loginNotifyEnabled: user.loginNotifyEnabled !== false,
      profileVisibility: user.profileVisibility || 'public',
      historyVisibility: user.historyVisibility || 'friends',
      showOnlineStatus: user.showOnlineStatus !== false,
    }

    // 保存原始数据
    originalData.value = JSON.parse(JSON.stringify(userForm.value))
  }
}

async function saveChanges() {
  try {
    // 这里应该调用API保存用户信息
    console.log('保存用户信息:', userForm.value)

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 更新认证存储中的用户信息
    authStore.updateUser(userForm.value)

    // 更新原始数据
    originalData.value = JSON.parse(JSON.stringify(userForm.value))

    // 显示成功消息
    alert('保存成功！')
  } catch (error) {
    console.error('保存失败:', error)
    alert('保存失败，请重试')
  }
}

function selectAvatar(avatar: string) {
  userForm.value.avatar = avatar
}

function confirmAvatar() {
  showAvatarModal.value = false
}

async function sendPhoneCode() {
  if (!newPhone.value) {
    alert('请输入手机号码')
    return
  }

  codeSending.value = true
  try {
    // 模拟发送验证码
    await new Promise(resolve => setTimeout(resolve, 2000))
    alert('验证码已发送')
  } catch (error) {
    alert('发送失败，请重试')
  } finally {
    codeSending.value = false
  }
}

async function confirmPhone() {
  if (!newPhone.value || !phoneCode.value) {
    alert('请填写完整信息')
    return
  }

  try {
    // 模拟验证
    await new Promise(resolve => setTimeout(resolve, 1000))
    userForm.value.phone = newPhone.value
    showPhoneModal.value = false
    newPhone.value = ''
    phoneCode.value = ''
    alert('手机号码更新成功')
  } catch (error) {
    alert('验证失败，请重试')
  }
}

async function sendEmailCode() {
  if (!newEmail.value) {
    alert('请输入邮箱地址')
    return
  }

  codeSending.value = true
  try {
    // 模拟发送验证码
    await new Promise(resolve => setTimeout(resolve, 2000))
    alert('验证码已发送')
  } catch (error) {
    alert('发送失败，请重试')
  } finally {
    codeSending.value = false
  }
}

async function confirmEmail() {
  if (!newEmail.value || !emailCode.value) {
    alert('请填写完整信息')
    return
  }

  try {
    // 模拟验证
    await new Promise(resolve => setTimeout(resolve, 1000))
    userForm.value.email = newEmail.value
    showEmailModal.value = false
    newEmail.value = ''
    emailCode.value = ''
    alert('邮箱地址更新成功')
  } catch (error) {
    alert('验证失败，请重试')
  }
}

async function confirmPassword() {
  if (!passwordForm.value.current || !passwordForm.value.new || !passwordForm.value.confirm) {
    alert('请填写完整信息')
    return
  }

  if (passwordForm.value.new !== passwordForm.value.confirm) {
    alert('两次输入的密码不一致')
    return
  }

  if (passwordForm.value.new.length < 6) {
    alert('密码长度至少6位')
    return
  }

  try {
    // 模拟密码修改
    await new Promise(resolve => setTimeout(resolve, 1000))
    showPasswordModal.value = false
    passwordForm.value = { current: '', new: '', confirm: '' }
    alert('密码修改成功')
  } catch (error) {
    alert('密码修改失败，请重试')
  }
}

async function confirmDelete() {
  if (deleteConfirmText.value !== '删除我的账户') {
    alert('请正确输入确认文本')
    return
  }

  try {
    // 模拟删除账户
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 清除本地数据
    authStore.logout()

    // 跳转到登录页
    router.push('/auth')

    alert('账户已删除')
  } catch (error) {
    alert('删除失败，请重试')
  }
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  img.src = 'https://picsum.photos/200/200?random=' + Math.floor(Math.random() * 1000)
}

function goBack() {
  if (hasChanges.value) {
    if (confirm('有未保存的更改，确定要离开吗？')) {
      router.go(-1)
    }
  } else {
    router.go(-1)
  }
}

onMounted(() => {
  loadUserData()
})
</script>

<style scoped>
.account-view {
  min-height: 100vh;
  background: linear-gradient(to bottom, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: white;
  padding-bottom: 100px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  position: sticky;
  top: 0;
  background: rgba(26, 26, 46, 0.9);
  backdrop-filter: blur(10px);
  z-index: 10;
}

.back-button,
.save-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s;
}

.back-button:hover,
.save-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
}

.save-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.content {
  padding: 0 1rem;
}

.section {
  margin-bottom: 2rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: white;
}

.section-title.danger {
  color: #ff4757;
}

.info-card,
.contact-card,
.security-card,
.privacy-card,
.danger-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.avatar-container {
  position: relative;
  width: 80px;
  height: 80px;
}

.avatar-container img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-edit-button {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #007aff, #0056cc);
  border: 2px solid white;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.avatar-edit-button:hover {
  transform: scale(1.1);
}

.avatar-info h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.avatar-info p {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.2);
  background: rgba(255, 255, 255, 0.15);
}

.char-count {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  text-align: right;
}

.contact-item,
.security-item,
.privacy-item,
.danger-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.contact-item:last-child,
.security-item:last-child,
.privacy-item:last-child,
.danger-item:last-child {
  border-bottom: none;
}

.contact-info,
.security-info,
.privacy-info,
.danger-info {
  flex: 1;
}

.contact-label,
.security-label,
.privacy-label,
.danger-label {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.danger-label {
  color: #ff4757;
}

.contact-value {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
}

.security-desc,
.privacy-desc,
.danger-desc {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
}

.contact-action {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #007aff, #0056cc);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.contact-action:hover {
  background: linear-gradient(135deg, #0056cc, #004499);
  transform: translateY(-1px);
}

.security-toggle,
.privacy-toggle {
  display: flex;
  align-items: center;
}

.toggle-input {
  display: none;
}

.toggle-label {
  position: relative;
  width: 50px;
  height: 28px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-label::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.toggle-input:checked + .toggle-label {
  background: linear-gradient(135deg, #007aff, #0056cc);
}

.toggle-input:checked + .toggle-label::after {
  transform: translateX(22px);
}

.privacy-select {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  font-size: 0.875rem;
  cursor: pointer;
}

.security-item:hover,
.danger-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin: 0 -1rem;
  padding: 1rem;
  cursor: pointer;
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
  max-height: 80vh;
  overflow-y: auto;
}

.modal-title {
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  text-align: center;
}

.modal-message {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0 0 1rem 0;
}

.modal-warning {
  color: #ff4757;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 1rem 0;
  text-align: center;
}

.delete-list {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.delete-list li {
  margin-bottom: 0.5rem;
}

.avatar-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.avatar-option {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.avatar-option:hover {
  transform: scale(1.05);
}

.avatar-option.active {
  border-color: #007aff;
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.3);
}

.avatar-option img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.verification-input {
  display: flex;
  gap: 0.5rem;
}

.verification-input input {
  flex: 1;
}

.send-code-button {
  padding: 0.875rem 1rem;
  background: linear-gradient(135deg, #007aff, #0056cc);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.send-code-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #0056cc, #004499);
}

.send-code-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-button,
.confirm-button,
.danger-button {
  flex: 1;
  padding: 0.875rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.cancel-button:hover {
  background: rgba(255, 255, 255, 0.15);
}

.confirm-button {
  background: linear-gradient(135deg, #007aff, #0056cc);
  border: none;
  color: white;
  font-weight: 600;
}

.confirm-button:hover {
  background: linear-gradient(135deg, #0056cc, #004499);
  transform: translateY(-1px);
}

.danger-button {
  background: linear-gradient(135deg, #ff4757, #ff3742);
  border: none;
  color: white;
  font-weight: 600;
}

.danger-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #ff3742, #ff2837);
  transform: translateY(-1px);
}

.danger-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.danger-modal {
  border-color: rgba(255, 71, 87, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .avatar-section {
    flex-direction: column;
    text-align: center;
  }

  .contact-item,
  .security-item,
  .privacy-item,
  .danger-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .contact-action,
  .privacy-select {
    align-self: stretch;
  }

  .avatar-options {
    grid-template-columns: repeat(3, 1fr);
  }

  .modal-actions {
    flex-direction: column;
  }

  .verification-input {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .modal-content {
    padding: 1.5rem;
  }

  .avatar-options {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-section {
    gap: 1rem;
  }
}
</style>
