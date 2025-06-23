<template>
  <div class="auth-view">
    <div class="auth-container">
      <!-- 头部Logo和标题 -->
      <div class="auth-header">
        <div class="logo">
          <div class="logo-icon">🎵</div>
          <h1 class="logo-text">音乐应用</h1>
        </div>
        <p class="auth-subtitle">
          {{ isLogin ? '欢迎回来，开始您的音乐之旅' : '加入我们，发现更多精彩音乐' }}
        </p>
      </div>

      <!-- 切换标签 -->
      <div class="auth-tabs">
        <button :class="['tab-button', { active: isLogin }]" @click="switchToLogin">登录</button>
        <button :class="['tab-button', { active: !isLogin }]" @click="switchToRegister">
          注册
        </button>
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
          <div class="form-group">
            <label for="login-email" class="form-label">邮箱</label>
            <input
              id="login-email"
              v-model="loginForm.email"
              type="email"
              class="form-input"
              :class="{ error: loginErrors.email }"
              placeholder="请输入您的邮箱"
              autocomplete="email"
              required
            />
            <span v-if="loginErrors.email" class="field-error">{{ loginErrors.email }}</span>
          </div>

          <div class="form-group">
            <label for="login-password" class="form-label">密码</label>
            <div class="password-input-wrapper">
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
                type="button"
                class="password-toggle"
                @click="showLoginPassword = !showLoginPassword"
              >
                {{ showLoginPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
            <span v-if="loginErrors.password" class="field-error">{{ loginErrors.password }}</span>
          </div>

          <div class="form-options">
            <label class="checkbox-label">
              <input v-model="rememberMe" type="checkbox" class="checkbox" />
              <span class="checkbox-text">记住我</span>
            </label>
            <button type="button" class="forgot-password" @click="showForgotPassword = true">
              忘记密码？
            </button>
          </div>

          <button type="submit" class="submit-button" :disabled="authStore.isLoading">
            <span v-if="authStore.isLoading" class="loading-spinner">⏳</span>
            {{ authStore.isLoading ? '登录中...' : '登录' }}
          </button>
        </form>

        <!-- 注册表单 -->
        <form v-else @submit.prevent="handleRegister" class="auth-form">
          <div class="form-group">
            <label for="register-name" class="form-label">姓名</label>
            <input
              id="register-name"
              v-model="registerForm.name"
              type="text"
              class="form-input"
              :class="{ error: registerErrors.name }"
              placeholder="请输入您的姓名"
              autocomplete="name"
              required
            />
            <span v-if="registerErrors.name" class="field-error">{{ registerErrors.name }}</span>
          </div>

          <div class="form-group">
            <label for="register-email" class="form-label">邮箱</label>
            <input
              id="register-email"
              v-model="registerForm.email"
              type="email"
              class="form-input"
              :class="{ error: registerErrors.email }"
              placeholder="请输入您的邮箱"
              autocomplete="email"
              required
            />
            <span v-if="registerErrors.email" class="field-error">{{ registerErrors.email }}</span>
          </div>

          <div class="form-group">
            <label for="register-password" class="form-label">密码</label>
            <div class="password-input-wrapper">
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
            <div class="password-input-wrapper">
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
        </form>
      </div>

      <!-- 第三方登录 -->
      <div class="social-login">
        <div class="divider">
          <span class="divider-text">或者使用</span>
        </div>
        <div class="social-buttons">
          <button class="social-button wechat" @click="handleSocialLogin('wechat')">
            <span class="social-icon">💬</span>
            微信登录
          </button>
          <button class="social-button qq" @click="handleSocialLogin('qq')">
            <span class="social-icon">🐧</span>
            QQ登录
          </button>
        </div>
      </div>
    </div>

    <!-- 忘记密码模态框 -->
    <div v-if="showForgotPassword" class="modal-overlay" @click="showForgotPassword = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">重置密码</h3>
        <p class="modal-description">请输入您的邮箱地址，我们将发送重置密码的链接给您。</p>
        <form @submit.prevent="handleForgotPassword">
          <div class="form-group">
            <input
              v-model="forgotPasswordEmail"
              type="email"
              class="form-input"
              placeholder="请输入您的邮箱"
              required
            />
          </div>
          <div class="modal-actions">
            <button type="button" class="cancel-button" @click="showForgotPassword = false">
              取消
            </button>
            <button type="submit" class="submit-button" :disabled="authStore.isLoading">
              {{ authStore.isLoading ? '发送中...' : '发送重置链接' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  validateEmail,
  validatePassword,
  validateName,
  validateConfirmPassword,
} from '@/utils/validators'
import type { LoginCredentials, RegisterCredentials } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 页面状态
const isLogin = ref(true)
const successMessage = ref('')
const showForgotPassword = ref(false)

// 密码显示状态
const showLoginPassword = ref(false)
const showRegisterPassword = ref(false)
const showConfirmPassword = ref(false)

// 表单数据
const loginForm = reactive<LoginCredentials>({
  email: '',
  password: '',
})

const registerForm = reactive<RegisterCredentials>({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

// 其他表单状态
const rememberMe = ref(false)
const agreeToTerms = ref(false)
const forgotPasswordEmail = ref('')

// 表单验证错误
const loginErrors = reactive({
  email: '',
  password: '',
})

const registerErrors = reactive({
  name: '',
  email: '',
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

  const emailError = validateEmail(loginForm.email)
  if (emailError) {
    loginErrors.email = emailError
    isValid = false
  }

  const passwordError = validatePassword(loginForm.password)
  if (passwordError) {
    loginErrors.password = passwordError
    isValid = false
  }

  return isValid
}

// 验证注册表单
const validateRegisterForm = (): boolean => {
  clearErrors()
  let isValid = true

  const nameError = validateName(registerForm.name)
  if (nameError) {
    registerErrors.name = nameError
    isValid = false
  }

  const emailError = validateEmail(registerForm.email)
  if (emailError) {
    registerErrors.email = emailError
    isValid = false
  }

  const passwordError = validatePassword(registerForm.password)
  if (passwordError) {
    registerErrors.password = passwordError
    isValid = false
  }

  const confirmPasswordError = validateConfirmPassword(
    registerForm.password,
    registerForm.confirmPassword
  )
  if (confirmPasswordError) {
    registerErrors.confirmPassword = confirmPasswordError
    isValid = false
  }

  return isValid
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

// 处理忘记密码
const handleForgotPassword = async () => {
  if (!forgotPasswordEmail.value) return

  try {
    await authStore.forgotPassword(forgotPasswordEmail.value)
    successMessage.value = '重置密码邮件已发送，请查收邮箱'
    showForgotPassword.value = false
    forgotPasswordEmail.value = ''
  } catch (error) {
    console.error('Forgot password failed:', error)
  }
}

// 处理第三方登录
const handleSocialLogin = (provider: string) => {
  // TODO: 实现第三方登录逻辑
  console.log(`Social login with ${provider}`)
  authStore.setError('第三方登录功能暂未开放，敬请期待')
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
  max-width: 400px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 头部样式 */
.auth-header {
  text-align: center;
  margin-bottom: 2rem;
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

/* 标签切换 */
.auth-tabs {
  display: flex;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 2rem;
}

.tab-button {
  flex: 1;
  padding: 0.75rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-button.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.tab-button:hover:not(.active) {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.9);
}

/* 表单容器 */
.form-container {
  margin-bottom: 2rem;
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

.password-input-wrapper {
  position: relative;
}

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
}

.password-toggle:hover {
  color: rgba(255, 255, 255, 0.9);
}

.field-error {
  color: #ff6b6b;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

/* 表单选项 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
}

.checkbox {
  width: 1rem;
  height: 1rem;
  accent-color: #007aff;
}

.checkbox-text {
  color: rgba(255, 255, 255, 0.8);
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

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
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

/* 第三方登录 */
.social-login {
  margin-top: 2rem;
}

.divider {
  position: relative;
  text-align: center;
  margin: 1.5rem 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
}

.divider-text {
  background: rgba(255, 255, 255, 0.1);
  padding: 0 1rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  backdrop-filter: blur(20px);
}

.social-buttons {
  display: flex;
  gap: 1rem;
}

.social-button {
  flex: 1;
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.social-button:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.social-button.wechat:hover {
  border-color: #1aad19;
  box-shadow: 0 0 0 2px rgba(26, 173, 25, 0.2);
}

.social-button.qq:hover {
  border-color: #12b7f5;
  box-shadow: 0 0 0 2px rgba(18, 183, 245, 0.2);
}

.social-icon {
  font-size: 1.1rem;
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
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .social-buttons {
    flex-direction: column;
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
