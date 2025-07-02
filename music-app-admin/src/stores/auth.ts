import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { AdminUser, LoginForm } from '@/types'
import { authApi } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AdminUser | null>(null)
  const token = ref<string | null>(null)
  const permissions = ref<string[]>([])
  const isLoggedIn = computed(() => !!token.value && !!user.value)

  // 初始化状态
  function initAuth() {
    const savedToken = localStorage.getItem('admin_token')
    const savedUser = localStorage.getItem('admin_user')
    const savedPermissions = localStorage.getItem('admin_permissions')

    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = JSON.parse(savedUser)
      permissions.value = savedPermissions ? JSON.parse(savedPermissions) : []
    }
  }

  // 登录
  async function login(loginForm: LoginForm) {
    try {
      const response = await authApi.login(loginForm)

      user.value = response.user
      token.value = response.accessToken
      permissions.value = response.permissions

      // 保存到本地存储
      localStorage.setItem('admin_token', response.accessToken)
      localStorage.setItem('admin_user', JSON.stringify(response.user))
      localStorage.setItem('admin_permissions', JSON.stringify(response.permissions))
      localStorage.setItem('admin_refresh_token', response.refreshToken)

      return response
    } catch (error) {
      throw error
    }
  }

  // 登出
  async function logout() {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('登出失败:', error)
    } finally {
      // 清除状态和本地存储
      user.value = null
      token.value = null
      permissions.value = []

      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      localStorage.removeItem('admin_permissions')
      localStorage.removeItem('admin_refresh_token')
    }
  }

  // 获取用户信息
  async function fetchUserInfo() {
    try {
      const response = await authApi.getProfile()
      user.value = response.user
      permissions.value = response.permissions

      localStorage.setItem('admin_user', JSON.stringify(response.user))
      localStorage.setItem('admin_permissions', JSON.stringify(response.permissions))

      return response
    } catch (error) {
      throw error
    }
  }

  // 检查权限
  function hasPermission(permission: string): boolean {
    return permissions.value.includes(permission)
  }

  // 检查多个权限（需要全部拥有）
  function hasAllPermissions(requiredPermissions: string[]): boolean {
    return requiredPermissions.every(permission => hasPermission(permission))
  }

  // 检查多个权限（拥有其中一个即可）
  function hasAnyPermission(requiredPermissions: string[]): boolean {
    return requiredPermissions.some(permission => hasPermission(permission))
  }

  return {
    user,
    token,
    permissions,
    isLoggedIn,
    initAuth,
    login,
    logout,
    fetchUserInfo,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
  }
})
