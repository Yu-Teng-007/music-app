<template>
  <ul class="menu">
    <li v-for="item in visibleMenuItems" :key="item.key" class="menu-item">
      <!-- 有子菜单的项目 -->
      <template v-if="item.children && item.children.length > 0">
        <div
          class="menu-title"
          :class="{ active: isParentActive(item) }"
          @click="toggleSubmenu(item.key)"
        >
          <div class="menu-title-content">
            <component :is="getIcon(item.icon)" class="menu-icon" />
            <span v-if="!appStore.sidebarCollapsed" class="menu-text">{{ item.title }}</span>
          </div>
          <ChevronDown
            v-if="!appStore.sidebarCollapsed"
            class="submenu-arrow"
            :class="{ expanded: expandedMenus.includes(item.key) }"
          />
        </div>

        <ul
          v-if="!appStore.sidebarCollapsed"
          class="submenu"
          :class="{ expanded: expandedMenus.includes(item.key) }"
        >
          <li v-for="child in getVisibleChildren(item)" :key="child.key" class="submenu-item">
            <router-link
              :to="child.path || '#'"
              class="submenu-link"
              :class="{ active: $route.path === child.path }"
              @click="handleMenuClick(child)"
            >
              <span class="submenu-text">{{ child.title }}</span>
            </router-link>
          </li>
        </ul>
      </template>

      <!-- 普通菜单项 -->
      <template v-else>
        <router-link
          :to="item.path || '#'"
          class="menu-link"
          :class="{ active: $route.path === item.path }"
          @click="handleMenuClick(item)"
        >
          <component :is="getIcon(item.icon)" class="menu-icon" />
          <span v-if="!appStore.sidebarCollapsed" class="menu-text">{{ item.title }}</span>
        </router-link>
      </template>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { BarChart3, Users, Music, TrendingUp, Settings, ChevronDown } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import type { MenuItem } from '@/types'

const route = useRoute()
const appStore = useAppStore()
const authStore = useAuthStore()

// 展开的子菜单
const expandedMenus = ref<string[]>([])

// 图标映射
const iconMap = {
  BarChart3,
  Users,
  Music,
  TrendingUp,
  Settings,
}

// 获取图标组件
function getIcon(iconName?: string) {
  return (iconName && iconMap[iconName as keyof typeof iconMap]) || BarChart3
}

// 过滤有权限的菜单项
const visibleMenuItems = computed(() => {
  return appStore.menuItems.filter((item) => {
    if (!item.permission) return true
    return authStore.hasPermission(item.permission)
  })
})

// 获取有权限的子菜单
function getVisibleChildren(item: MenuItem) {
  if (!item.children) return []
  return item.children.filter((child) => {
    if (!child.permission) return true
    return authStore.hasPermission(child.permission)
  })
}

// 检查父菜单是否激活
function isParentActive(item: MenuItem): boolean {
  if (!item.children) return false
  return item.children.some((child) => child.path === route.path)
}

// 切换子菜单展开状态
function toggleSubmenu(key: string) {
  if (appStore.sidebarCollapsed) return

  const index = expandedMenus.value.indexOf(key)
  if (index > -1) {
    expandedMenus.value.splice(index, 1)
  } else {
    expandedMenus.value.push(key)
  }
}

// 处理菜单点击
function handleMenuClick(item: MenuItem) {
  appStore.setSelectedMenuKey(item.key)
}

// 监听路由变化，自动展开对应的父菜单
watch(
  () => route.path,
  (newPath) => {
    appStore.menuItems.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some((child) => child.path === newPath)
        if (hasActiveChild && !expandedMenus.value.includes(item.key)) {
          expandedMenus.value.push(item.key)
        }
      }
    })
  },
  { immediate: true },
)

// 监听侧边栏折叠状态，折叠时关闭所有子菜单
watch(
  () => appStore.sidebarCollapsed,
  (collapsed) => {
    if (collapsed) {
      expandedMenus.value = []
    }
  },
)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  margin-bottom: $spacing-xs;
}

.menu-link,
.menu-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px $spacing-md;
  color: $sidebar-text;
  text-decoration: none;
  transition: all $transition-fast;
  cursor: pointer;
  border-radius: 0;

  &:hover {
    color: $sidebar-text-hover;
    background-color: rgba(255, 255, 255, 0.1);
  }

  &.active {
    color: $sidebar-text-active;
    background-color: rgba($primary-color, 0.1);
  }
}

.menu-title-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.menu-text {
  font-size: $font-size-sm;
  white-space: nowrap;
  overflow: hidden;
}

.submenu-arrow {
  width: 16px;
  height: 16px;
  transition: transform $transition-fast;

  &.expanded {
    transform: rotate(180deg);
  }
}

.submenu {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 0;
  overflow: hidden;
  transition: max-height $transition-normal ease;
  background-color: $sidebar-submenu-bg;

  &.expanded {
    max-height: 300px;
  }
}

.submenu-item {
  margin: 0;
}

.submenu-link {
  display: block;
  padding: 10px $spacing-md 10px 48px;
  color: $sidebar-text;
  text-decoration: none;
  transition: all $transition-fast;
  font-size: $font-size-sm;

  &:hover {
    color: $sidebar-text-hover;
    background-color: rgba(255, 255, 255, 0.1);
  }

  &.active {
    color: $sidebar-text-active;
    background-color: rgba($primary-color, 0.1);
  }
}

.submenu-text {
  white-space: nowrap;
  overflow: hidden;
}
</style>
