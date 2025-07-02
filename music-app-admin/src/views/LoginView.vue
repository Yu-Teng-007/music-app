<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1 class="login-title">音乐应用管理后台</h1>
        <p class="login-subtitle">请使用管理员账户登录</p>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username" class="form-label">用户名</label>
          <div class="input-wrapper">
            <User class="input-icon" />
            <input
              id="username"
              v-model="loginForm.username"
              type="text"
              class="form-input"
              placeholder="请输入用户名"
              required
              :disabled="loading"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">密码</label>
          <div class="input-wrapper">
            <Lock class="input-icon" />
            <input
              id="password"
              v-model="loginForm.password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              placeholder="请输入密码"
              required
              :disabled="loading"
            />
            <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
              :disabled="loading"
            >
              <Eye v-if="showPassword" />
              <EyeOff v-else />
            </button>
          </div>
        </div>

        <div v-if="errorMessage" class="error-message">
          <AlertCircle class="error-icon" />
          <span>{{ errorMessage }}</span>
        </div>

        <button
          type="submit"
          class="login-button"
          :disabled="loading || !loginForm.username || !loginForm.password"
        >
          <Loader2 v-if="loading" class="loading-icon" />
          <span>{{ loading ? '登录中...' : '登录' }}</span>
        </button>
      </form>

      <div class="login-footer">
        <div class="demo-accounts">
          <h3>演示账户</h3>
          <div class="demo-account-list">
            <div class="demo-account" @click="fillDemoAccount('admin', 'admin123')">
              <strong>超级管理员:</strong> admin / admin123
            </div>
            <div class="demo-account" @click="fillDemoAccount('content_admin', 'content123')">
              <strong>内容管理员:</strong> content_admin / content123
            </div>
            <div class="demo-account" @click="fillDemoAccount('analyst', 'analyst123')">
              <strong>数据分析师:</strong> analyst / analyst123
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { User, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import type { LoginForm } from '@/types'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loading = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')

const loginForm = reactive<LoginForm>({
  username: '',
  password: '',
})

// 处理登录
async function handleLogin() {
  if (loading.value) return

  errorMessage.value = ''
  loading.value = true

  try {
    await authStore.login(loginForm)

    // 登录成功，跳转到目标页面或仪表盘
    const redirect = route.query.redirect as string
    router.push(redirect || '/dashboard')
  } catch (error: any) {
    errorMessage.value = error.message || '登录失败，请检查用户名和密码'
  } finally {
    loading.value = false
  }
}

// 填充演示账户
function fillDemoAccount(username: string, password: string) {
  loginForm.username = username
  loginForm.password = password
  errorMessage.value = ''
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-box {
  background: $background-white;
  border-radius: $border-radius-xl;
  box-shadow: $shadow-lg;
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: $spacing-xl;

  .login-title {
    font-size: $font-size-xl;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin-bottom: $spacing-sm;
  }

  .login-subtitle {
    color: $text-secondary;
    font-size: $font-size-sm;
  }
}

.login-form {
  margin-bottom: $spacing-lg;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: $spacing-sm;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $text-primary;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;

  .input-icon {
    position: absolute;
    left: 12px;
    width: 18px;
    height: 18px;
    color: $text-secondary;
    z-index: 1;
  }

  .form-input {
    width: 100%;
    padding: 12px 12px 12px 40px;
    border: 1px solid $border-color;
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
    transition: border-color $transition-fast;

    &:focus {
      outline: none;
      border-color: $primary-color;
      box-shadow: 0 0 0 2px rgba($primary-color, 0.2);
    }

    &:disabled {
      background-color: $background-color;
      cursor: not-allowed;
    }
  }

  .password-toggle {
    position: absolute;
    right: 12px;
    background: none;
    border: none;
    cursor: pointer;
    padding: $spacing-xs;
    color: $text-secondary;
    transition: color $transition-fast;

    &:hover {
      color: $primary-color;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }
}

.error-message {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  color: $error-color;
  font-size: $font-size-sm;
  margin-bottom: $spacing-md;
  padding: $spacing-sm 12px;
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: $border-radius-md;

  .error-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
}

.login-button {
  width: 100%;
  padding: 12px;
  background-color: $primary-color;
  color: white;
  border: none;
  border-radius: $border-radius-md;
  font-size: $font-size-md;
  font-weight: $font-weight-medium;
  cursor: pointer;
  transition: background-color $transition-fast;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;

  &:hover:not(:disabled) {
    background-color: $primary-hover;
  }

  &:disabled {
    background-color: #d9d9d9;
    cursor: not-allowed;
  }

  .loading-icon {
    width: 16px;
    height: 16px;
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.login-footer {
  border-top: 1px solid $border-color;
  padding-top: $spacing-lg;

  .demo-accounts {
    h3 {
      font-size: $font-size-md;
      color: $text-primary;
      margin-bottom: 12px;
      text-align: center;
    }

    .demo-account-list {
      display: flex;
      flex-direction: column;
      gap: $spacing-sm;

      .demo-account {
        padding: $spacing-sm 12px;
        background-color: $background-color;
        border-radius: $border-radius-sm;
        cursor: pointer;
        transition: background-color $transition-fast;
        font-size: $font-size-xs;

        &:hover {
          background-color: #e6f7ff;
        }

        strong {
          color: $primary-color;
        }
      }
    }
  }
}
</style>
