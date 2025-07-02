<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import AdminLayout from '@/components/layout/AdminLayout.vue'

const route = useRoute()
const authStore = useAuthStore()
const appStore = useAppStore()

onMounted(() => {
  // 初始化认证状态
  authStore.initAuth()

  // 如果已登录，获取最新用户信息
  if (authStore.isLoggedIn) {
    authStore.fetchUserInfo().catch(() => {
      // 如果获取用户信息失败，可能token已过期，清除登录状态
      authStore.logout()
    })
  }
})
</script>

<template>
  <div id="app">
    <!-- 登录页面不使用布局 -->
    <template v-if="route.name === 'login'">
      <RouterView />
    </template>

    <!-- 其他页面使用管理后台布局 -->
    <template v-else>
      <AdminLayout>
        <RouterView />
      </AdminLayout>
    </template>
  </div>
</template>

<style lang="scss">
@use '@/assets/styles/global.scss';
</style>
