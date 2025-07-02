<template>
  <div class="user-dropdown" ref="dropdownRef">
    <div class="user-info" @click="toggleDropdown">
      <img
        v-if="authStore.user?.avatar"
        :src="authStore.user.avatar"
        :alt="authStore.user.realName"
        class="user-avatar"
      />
      <div v-else class="user-avatar-placeholder">
        {{ getInitials(authStore.user?.realName || '') }}
      </div>

      <div class="user-details">
        <div class="user-name">{{ authStore.user?.realName }}</div>
        <div class="user-role">管理员</div>
      </div>

      <ChevronDown class="dropdown-arrow" :class="{ expanded: isDropdownOpen }" />
    </div>

    <div v-if="isDropdownOpen" class="dropdown-menu">
      <div class="dropdown-item" @click="viewProfile">
        <User class="dropdown-icon" />
        <span>个人资料</span>
      </div>

      <div class="dropdown-item" @click="changePassword">
        <Key class="dropdown-icon" />
        <span>修改密码</span>
      </div>

      <div class="dropdown-divider"></div>

      <div class="dropdown-item logout" @click="handleLogout">
        <LogOut class="dropdown-icon" />
        <span>退出登录</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronDown, User, Key, LogOut } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const dropdownRef = ref<HTMLElement>()
const isDropdownOpen = ref(false)

// 获取用户名首字母
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// 切换下拉菜单
function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value
}

// 关闭下拉菜单
function closeDropdown() {
  isDropdownOpen.value = false
}

// 查看个人资料
function viewProfile() {
  closeDropdown()
  // TODO: 实现个人资料页面
  console.log('查看个人资料')
}

// 修改密码
function changePassword() {
  closeDropdown()
  // TODO: 实现修改密码功能
  console.log('修改密码')
}

// 退出登录
async function handleLogout() {
  closeDropdown()

  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error)
    // 即使退出失败，也清除本地状态并跳转到登录页
    router.push('/login')
  }
}

// 点击外部关闭下拉菜单
function handleClickOutside(event: Event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.user-dropdown {
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: $spacing-sm 12px;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: background-color $transition-fast;

  &:hover {
    background-color: $background-color;
  }
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.user-avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: $primary-color;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $text-primary;
}

.user-role {
  font-size: $font-size-xs;
  color: $text-secondary;
}

.dropdown-arrow {
  width: 16px;
  height: 16px;
  color: $text-secondary;
  transition: transform $transition-fast;

  &.expanded {
    transform: rotate(180deg);
  }
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: $spacing-sm;
  background: $background-white;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-md;
  border: 1px solid $border-color;
  min-width: 160px;
  z-index: $z-index-dropdown;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px $spacing-md;
  cursor: pointer;
  transition: background-color $transition-fast;
  font-size: $font-size-sm;
  color: $text-primary;

  &:hover {
    background-color: $background-color;
  }

  &.logout {
    color: $error-color;

    &:hover {
      background-color: #fff2f0;
    }
  }
}

.dropdown-icon {
  width: 16px;
  height: 16px;
}

.dropdown-divider {
  height: 1px;
  background-color: $border-color;
  margin: $spacing-xs 0;
}
</style>
