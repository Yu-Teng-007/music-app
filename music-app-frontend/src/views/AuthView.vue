<template>
  <div class="auth-view">
    <div class="auth-container">
      <!-- 头部Logo和标题 -->
      <div class="auth-header">
        <div class="logo">
          <div class="logo-icon">🎵</div>
          <h1 class="logo-text">气泡音乐</h1>
        </div>
      </div>

      <!-- 表单容器 -->
      <div class="form-container">
        <!-- 错误提示 -->
        <div v-if="authStore.error" class="error-message">
          <span class="error-icon">⚠️</span>
          {{ authStore.error }}
        </div>

        <!-- 成功提示 -->
        <div v-if="successMessage" class="success-message">
          <span class="success-icon">✅</span>
          {{ successMessage }}
        </div>

        <!-- 登录表单 -->
        <form v-if="isLogin" @submit.prevent="handleLogin" class="auth-form">
          <!-- 手机号登录（默认） -->
          <template v-if="loginType === 'phone'">
            <div class="form-group">
              <label for="login-phone" class="form-label">手机号</label>
              <div class="input-wrapper">
                <input
                  id="login-phone"
                  v-model="loginForm.phone"
                  type="tel"
                  class="form-input"
                  :class="{ error: loginErrors.phone }"
                  placeholder="请输入您的手机号"
                  autocomplete="tel"
                  required
                />
                <button
                  v-if="loginForm.phone"
                  type="button"
                  class="clear-button"
                  @click="loginForm.phone = ''"
                >
                  ✕
                </button>
              </div>
              <span v-if="loginErrors.phone" class="field-error">{{ loginErrors.phone }}</span>
              <div class="form-hint">
                <span class="hint-text">如果手机号未注册，登录时将自动为您注册账号</span>
              </div>
            </div>

            <div class="form-group">
              <label for="login-sms-code" class="form-label">验证码</label>
              <div class="sms-input-wrapper">
                <div class="input-wrapper">
                  <input
                    id="login-sms-code"
                    v-model="loginForm.smsCode"
                    type="text"
                    class="form-input"
                    :class="{ error: loginErrors.smsCode }"
                    placeholder="请输入验证码"
                    maxlength="6"
                    required
                  />
                  <button
                    v-if="loginForm.smsCode"
                    type="button"
                    class="clear-button"
                    @click="loginForm.smsCode = ''"
                  >
                    ✕
                  </button>
                </div>
                <button
                  type="button"
                  class="sms-button"
                  :disabled="smsCountdown > 0 || authStore.isLoading"
                  @click="sendSmsCode('login')"
                >
                  {{ smsCountdown > 0 ? `${smsCountdown}s` : '获取验证码' }}
                </button>
              </div>
              <span v-if="loginErrors.smsCode" class="field-error">{{ loginErrors.smsCode }}</span>
            </div>
          </template>

          <!-- 用户名登录 -->
          <template v-else>
            <div class="form-group">
              <label for="login-username" class="form-label">用户名</label>
              <div class="input-wrapper">
                <input
                  id="login-username"
                  v-model="loginForm.username"
                  type="text"
                  class="form-input"
                  :class="{ error: loginErrors.username }"
                  placeholder="请输入您的用户名"
                  autocomplete="username"
                  required
                />
                <button
                  v-if="loginForm.username"
                  type="button"
                  class="clear-button"
                  @click="loginForm.username = ''"
                >
                  ✕
                </button>
              </div>
              <span v-if="loginErrors.username" class="field-error">{{
                loginErrors.username
              }}</span>
            </div>

            <div class="form-group">
              <label for="login-password" class="form-label">密码</label>
              <div class="input-wrapper">
                <input
                  id="login-password"
                  v-model="loginForm.password"
                  :type="showLoginPassword ? 'text' : 'password'"
                  class="form-input"
                  :class="{ error: loginErrors.password }"
                  placeholder="请输入您的密码"
                  autocomplete="current-password"
                  required
                />
                <button
                  v-if="loginForm.password"
                  type="button"
                  class="clear-button"
                  @click="loginForm.password = ''"
                >
                  ✕
                </button>
                <button
                  type="button"
                  class="password-toggle"
                  @click="showLoginPassword = !showLoginPassword"
                >
                  {{ showLoginPassword ? '👁️' : '👁️‍🗨️' }}
                </button>
              </div>
              <span v-if="loginErrors.password" class="field-error">{{
                loginErrors.password
              }}</span>
            </div>
          </template>

          <div class="form-options">
            <!-- 登录方式切换入口 -->
            <div class="login-type-switch">
              <button
                v-if="loginType === 'username'"
                type="button"
                class="link-button"
                @click="switchLoginType('phone')"
              >
                手机号登录
              </button>
              <button v-else type="button" class="link-button" @click="switchLoginType('username')">
                用户名登录
              </button>
            </div>
          </div>

          <button type="submit" class="submit-button" :disabled="authStore.isLoading">
            <span v-if="authStore.isLoading" class="loading-spinner">⏳</span>
            {{ authStore.isLoading ? '登录中...' : '登录' }}
          </button>

          <!-- 注册入口 -->
          <div class="register-link">
            <span class="register-text">还没有账号？</span>
            <button type="button" class="link-button" @click="switchToRegister">立即注册</button>
          </div>

          <!-- 开发工具入口（仅开发环境） -->
          <div v-if="isDevelopment" class="dev-tools-link">
            <router-link to="/dev-tools" class="link-button">🛠️ 开发工具</router-link>
          </div>
        </form>

        <!-- 注册表单 -->
        <form v-else @submit.prevent="handleRegister" class="auth-form">
          <!-- 用户名注册 -->
          <div class="form-group">
            <label for="register-username" class="form-label">用户名</label>
            <div class="input-wrapper">
              <input
                id="register-username"
                v-model="registerForm.username"
                type="text"
                class="form-input"
                :class="{ error: registerErrors.username }"
                placeholder="请输入您的用户名"
                autocomplete="username"
                required
              />
              <button
                v-if="registerForm.username"
                type="button"
                class="clear-button"
                @click="registerForm.username = ''"
              >
                ✕
              </button>
            </div>
            <span v-if="registerErrors.username" class="field-error">{{
              registerErrors.username
            }}</span>
          </div>

          <div class="form-group">
            <label for="register-password" class="form-label">密码</label>
            <div class="input-wrapper">
              <input
                id="register-password"
                v-model="registerForm.password"
                :type="showRegisterPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ error: registerErrors.password }"
                placeholder="请输入密码（至少6位）"
                autocomplete="new-password"
                required
              />
              <button
                v-if="registerForm.password"
                type="button"
                class="clear-button"
                @click="registerForm.password = ''"
              >
                ✕
              </button>
              <button
                type="button"
                class="password-toggle"
                @click="showRegisterPassword = !showRegisterPassword"
              >
                {{ showRegisterPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
            <span v-if="registerErrors.password" class="field-error">{{
              registerErrors.password
            }}</span>
          </div>

          <div class="form-group">
            <label for="register-confirm-password" class="form-label">确认密码</label>
            <div class="input-wrapper">
              <input
                id="register-confirm-password"
                v-model="registerForm.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ error: registerErrors.confirmPassword }"
                placeholder="请再次输入密码"
                autocomplete="new-password"
                required
              />
              <button
                v-if="registerForm.confirmPassword"
                type="button"
                class="clear-button"
                @click="registerForm.confirmPassword = ''"
              >
                ✕
              </button>
              <button
                type="button"
                class="password-toggle"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                {{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
            <span v-if="registerErrors.confirmPassword" class="field-error">{{
              registerErrors.confirmPassword
            }}</span>
          </div>

          <div class="form-options">
            <label class="checkbox-label">
              <input v-model="agreeToTerms" type="checkbox" class="checkbox" required />
              <span class="checkbox-text">
                我同意 <a href="#" class="terms-link">用户协议</a> 和
                <a href="#" class="terms-link">隐私政策</a>
              </span>
            </label>
          </div>

          <button
            type="submit"
            class="submit-button"
            :disabled="authStore.isLoading || !agreeToTerms"
          >
            <span v-if="authStore.isLoading" class="loading-spinner">⏳</span>
            {{ authStore.isLoading ? '注册中...' : '注册' }}
          </button>

          <!-- 返回登录入口 -->
          <div class="login-link">
            <span class="login-text">已有账号？</span>
            <button type="button" class="link-button" @click="switchToLogin">立即登录</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  validatePassword,
  validateUsername,
  validateConfirmPassword,
  validatePhone,
  validateSmsCode,
} from '@/utils/validators'
import type { LoginCredentials, RegisterCredentials } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 页面状态
const isLogin = ref(true)
const successMessage = ref('')
const isDevelopment = ref(import.meta.env.DEV)

// 登录/注册方式
const loginType = ref<'phone' | 'username'>('phone')
const registerType = ref<'phone' | 'username'>('username')

// 密码显示状态
const showLoginPassword = ref(false)
const showRegisterPassword = ref(false)
const showConfirmPassword = ref(false)

// 短信验证码相关
const smsCountdown = ref(0)
const smsTimer = ref<NodeJS.Timeout | null>(null)

// 表单数据
const loginForm = reactive<LoginCredentials>({
  loginType: 'phone',
  phone: '',
  smsCode: '',
  username: '',
  password: '',
})

const registerForm = reactive<RegisterCredentials>({
  registerType: 'username',
  phone: '',
  smsCode: '',
  username: '',
  password: '',
  confirmPassword: '',
})

// 其他表单状态
const agreeToTerms = ref(false)

// 表单验证错误
const loginErrors = reactive({
  phone: '',
  smsCode: '',
  username: '',
  password: '',
})

const registerErrors = reactive({
  phone: '',
  smsCode: '',
  username: '',
  password: '',
  confirmPassword: '',
})

// 切换登录/注册
const switchToLogin = () => {
  isLogin.value = true
  clearErrors()
  authStore.clearError()
}

const switchToRegister = () => {
  isLogin.value = false
  clearErrors()
  authStore.clearError()
}

// 切换登录方式
const switchLoginType = (type: 'phone' | 'username') => {
  loginType.value = type
  loginForm.loginType = type

  // 清空不相关的字段
  if (type === 'phone') {
    loginForm.username = ''
    loginForm.password = ''
  } else {
    loginForm.phone = ''
    loginForm.smsCode = ''
  }

  clearErrors()
  authStore.clearError()
}

// 切换注册方式（现在只有用户名注册，保留函数以防需要）
const switchRegisterType = (type: 'phone' | 'username') => {
  registerType.value = type
  registerForm.registerType = type
  clearErrors()
  authStore.clearError()
}

// 清除错误信息
const clearErrors = () => {
  Object.keys(loginErrors).forEach(key => {
    loginErrors[key as keyof typeof loginErrors] = ''
  })
  Object.keys(registerErrors).forEach(key => {
    registerErrors[key as keyof typeof registerErrors] = ''
  })
}

// 验证登录表单
const validateLoginForm = (): boolean => {
  clearErrors()
  let isValid = true

  if (loginForm.loginType === 'phone') {
    // 手机号登录：只验证手机号和验证码，不需要用户名密码
    const phoneError = validatePhone(loginForm.phone || '')
    if (phoneError) {
      loginErrors.phone = phoneError
      isValid = false
    }

    const smsCodeError = validateSmsCode(loginForm.smsCode || '')
    if (smsCodeError) {
      loginErrors.smsCode = smsCodeError
      isValid = false
    }
  } else {
    // 用户名登录：验证用户名和密码
    const usernameError = validateUsername(loginForm.username || '')
    if (usernameError) {
      loginErrors.username = usernameError
      isValid = false
    }

    const passwordError = validatePassword(loginForm.password || '')
    if (passwordError) {
      loginErrors.password = passwordError
      isValid = false
    }
  }

  return isValid
}

// 验证注册表单
const validateRegisterForm = (): boolean => {
  clearErrors()
  let isValid = true

  // 现在只有用户名注册
  const usernameError = validateUsername(registerForm.username || '')
  if (usernameError) {
    registerErrors.username = usernameError
    isValid = false
  }

  const passwordError = validatePassword(registerForm.password || '')
  if (passwordError) {
    registerErrors.password = passwordError
    isValid = false
  }

  const confirmPasswordError = validateConfirmPassword(
    registerForm.password || '',
    registerForm.confirmPassword || ''
  )
  if (confirmPasswordError) {
    registerErrors.confirmPassword = confirmPasswordError
    isValid = false
  }

  return isValid
}

// 发送短信验证码
const sendSmsCode = async (type: 'register' | 'login') => {
  const phone = type === 'register' ? registerForm.phone : loginForm.phone

  if (!phone) {
    authStore.setError('请先输入手机号')
    return
  }

  const phoneError = validatePhone(phone)
  if (phoneError) {
    authStore.setError(phoneError)
    return
  }

  try {
    await authStore.sendSmsCode(phone, type)

    // 开始倒计时
    smsCountdown.value = 60
    smsTimer.value = setInterval(() => {
      smsCountdown.value--
      if (smsCountdown.value <= 0) {
        clearInterval(smsTimer.value!)
        smsTimer.value = null
      }
    }, 1000)

    successMessage.value = '验证码发送成功，请查收短信'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('Send SMS failed:', error)
  }
}

// 处理登录
const handleLogin = async () => {
  if (!validateLoginForm()) return

  try {
    await authStore.login(loginForm)
    successMessage.value = '登录成功！正在跳转...'

    setTimeout(() => {
      const redirectTo = (route.query.redirect as string) || '/'
      router.push(redirectTo)
    }, 1000)
  } catch (error) {
    console.error('Login failed:', error)
  }
}

// 处理注册
const handleRegister = async () => {
  if (!validateRegisterForm()) return

  try {
    await authStore.register(registerForm)
    successMessage.value = '注册成功！正在跳转...'

    setTimeout(() => {
      const redirectTo = (route.query.redirect as string) || '/'
      router.push(redirectTo)
    }, 1000)
  } catch (error) {
    console.error('Register failed:', error)
  }
}

// 组件挂载时检查认证状态
onMounted(() => {
  // 如果已经登录，直接跳转
  if (authStore.isAuthenticated) {
    const redirectTo = (route.query.redirect as string) || '/'
    router.push(redirectTo)
  }

  // 根据路由参数设置初始状态
  if (route.path.includes('register')) {
    isLogin.value = false
  }
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (smsTimer.value) {
    clearInterval(smsTimer.value)
  }
})
</script>

<style scoped>
/* 禁止双击缩放 */
.auth-view {
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

.auth-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #007aff 0%, #1a1a2e 50%, #16213e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  color: white;
}

.auth-container {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(25px);
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.25);
}

/* 头部样式 */
.auth-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.logo-icon {
  font-size: 2rem;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.auth-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin: 0;
}

/* 注册/登录链接 */
.register-link,
.login-link {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.register-text,
.login-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin-right: 0.5rem;
}

/* 开发工具链接 */
.dev-tools-link {
  text-align: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.dev-tools-link .link-button {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
}

.link-button {
  background: none;
  border: none;
  color: #4fc3f7;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s ease;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  outline: none;
}

.link-button:hover {
  color: #29b6f6;
  transform: translateY(-1px);
}

.link-button:focus {
  outline: none;
  background: none;
  box-shadow: none;
}

.link-button:active {
  background: none;
  transform: translateY(0);
}

/* 移动端优化 */
@media (hover: none) {
  .link-button:active {
    opacity: 0.7;
    background: none;
    transform: none;
  }

  .link-button:focus {
    background: none;
    outline: none;
  }
}

/* 认证方式选择标签 */
.auth-type-tabs {
  display: flex;
  margin-bottom: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 4px;
}

.type-tab {
  flex: 1;
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 6px;
}

.type-tab.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.type-tab:hover {
  color: white;
}

/* 短信验证码输入框 */
.sms-input-wrapper {
  display: flex;
  gap: 0.5rem;
}

.sms-input-wrapper .input-wrapper {
  flex: 1;
}

.sms-input-wrapper .form-input {
  flex: 1;
}

.sms-button {
  padding: 0.75rem 1rem;
  background: rgba(0, 122, 255, 0.8);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: 100px;
}

.sms-button:hover:not(:disabled) {
  background: rgba(0, 122, 255, 1);
}

.sms-button:active:not(:disabled) {
  background: rgba(0, 122, 255, 1);
  transform: scale(0.98);
}

.sms-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.3);
}

.sms-button:disabled {
  background: rgba(255, 255, 255, 0.3);
  cursor: not-allowed;
  color: rgba(255, 255, 255, 0.6);
}

/* 移动端SMS按钮优化 */
@media (hover: none) {
  .sms-button:active:not(:disabled) {
    transform: scale(0.95);
    transition: transform 0.1s ease;
  }

  .sms-button:focus {
    outline: none;
    box-shadow: none;
  }
}

/* 表单容器 */
.form-container {
  margin-bottom: 0;
}

/* 消息提示 */
.error-message,
.success-message {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.error-message {
  background: rgba(255, 59, 48, 0.2);
  border: 1px solid rgba(255, 59, 48, 0.3);
  color: #ff6b6b;
}

.success-message {
  background: rgba(52, 199, 89, 0.2);
  border: 1px solid rgba(52, 199, 89, 0.3);
  color: #51cf66;
}

/* 表单样式 */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.form-input {
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

.form-input.error {
  border-color: #ff6b6b;
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.2);
}

/* 输入框包装器 */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper .form-input {
  flex: 1;
  padding-right: 2.5rem;
}

/* 当有密码切换按钮时，为清除按钮留出空间 */
.input-wrapper .form-input:has(+ .clear-button + .password-toggle) {
  padding-right: 5rem;
}

/* 清除按钮 */
.clear-button {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  font-size: 0.9rem;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  z-index: 2;
}

.clear-button:hover {
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.1);
}

.clear-button:active {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(0.9);
}

.clear-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

/* 移动端清除按钮优化 */
@media (hover: none) {
  .clear-button:active {
    background: rgba(255, 255, 255, 0.15);
    transform: scale(0.85);
    transition: all 0.1s ease;
  }

  .clear-button:focus {
    outline: none;
    box-shadow: none;
  }
}

/* 密码切换按钮 */
.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 0.25rem;
  font-size: 1rem;
  transition: color 0.3s ease;
  z-index: 2;
}

/* 当有清除按钮时，密码切换按钮向左移动 */
.input-wrapper .clear-button + .password-toggle {
  right: 3rem;
}

.password-toggle:hover {
  color: rgba(255, 255, 255, 0.9);
}

.password-toggle:active {
  color: white;
  background: rgba(255, 255, 255, 0.1);
  transform: scale(0.9);
}

.password-toggle:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

/* 移动端密码切换按钮优化 */
@media (hover: none) {
  .password-toggle:active {
    background: rgba(255, 255, 255, 0.05);
    transform: scale(0.85);
    transition: all 0.1s ease;
  }

  .password-toggle:focus {
    outline: none;
    box-shadow: none;
  }
}

/* 保持旧的password-input-wrapper兼容性 */
.password-input-wrapper {
  position: relative;
}

.field-error {
  color: #ff6b6b;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

/* 表单提示信息 */
.form-hint {
  margin-top: 0.5rem;
}

.hint-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
  line-height: 1.4;
}

/* 表单选项 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
  gap: 1rem;
  min-height: 2rem;
}

/* 登录方式切换 */
.login-type-switch {
  margin-left: auto;
  flex-shrink: 0;
  white-space: nowrap;
  display: flex;
  align-items: center;
  height: 100%;
}

.forgot-password {
  background: none;
  border: none;
  color: #007aff;
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: #0056cc;
}

.terms-link {
  color: #007aff;
  text-decoration: none;
}

.terms-link:hover {
  text-decoration: underline;
}

/* 提交按钮 */
.submit-button {
  padding: 1rem;
  background: linear-gradient(135deg, #007aff, #0056cc);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #0056cc, #003d99);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
}

.submit-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.3);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 移动端提交按钮优化 */
@media (hover: none) {
  .submit-button:active:not(:disabled) {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }

  .submit-button:focus {
    outline: none;
    box-shadow: none;
  }
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
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
  margin: 0 0 0.5rem 0;
  text-align: center;
}

.modal-description {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin: 0 0 1.5rem 0;
  text-align: center;
  line-height: 1.5;
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

/* 响应式设计 */
@media (max-width: 480px) {
  .auth-container {
    padding: 1.5rem;
    margin: 0.5rem;
  }

  .form-options {
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .login-type-switch {
    margin-left: 0;
  }

  .modal-actions {
    flex-direction: column;
  }
}

@media (max-width: 360px) {
  .auth-container {
    padding: 1rem;
  }

  .logo-text {
    font-size: 1.25rem;
  }

  .form-input {
    padding: 0.75rem;
  }

  .submit-button {
    padding: 0.875rem;
  }
}

/* 修复重复的.auth-view样式 */
.auth-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #007aff 0%, #1a1a2e 50%, #16213e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  color: white;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}
</style>
