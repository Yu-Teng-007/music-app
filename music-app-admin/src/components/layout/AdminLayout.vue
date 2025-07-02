<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ collapsed: appStore.sidebarCollapsed }">
      <div class="sidebar-header">
        <div class="logo">
          <h2 v-if="!appStore.sidebarCollapsed">音乐管理后台</h2>
          <h2 v-else>音乐</h2>
        </div>
      </div>

      <nav class="sidebar-nav">
        <SidebarMenu />
      </nav>
    </aside>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 顶部导航栏 -->
      <header class="header">
        <div class="header-left">
          <button class="sidebar-toggle" @click="appStore.toggleSidebar">
            <Menu v-if="!appStore.sidebarCollapsed" />
            <X v-else />
          </button>

          <Breadcrumb />
        </div>

        <div class="header-right">
          <UserDropdown />
        </div>
      </header>

      <!-- 页面内容 -->
      <main class="content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Menu, X } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import SidebarMenu from './SidebarMenu.vue'
import Breadcrumb from './Breadcrumb.vue'
import UserDropdown from './UserDropdown.vue'

const appStore = useAppStore()
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.admin-layout {
  display: flex;
  height: 100vh;
  background-color: $background-color;
}

.sidebar {
  width: $sidebar-width;
  background-color: $sidebar-bg;
  color: white;
  transition: width $transition-normal ease;
  overflow: hidden;
  box-shadow: $shadow-sm;

  &.collapsed {
    width: $sidebar-collapsed-width;
  }
}

.sidebar-header {
  height: $header-height;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #002140;
  padding: 0 $spacing-md;

  .logo h2 {
    color: white;
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    white-space: nowrap;
  }
}

.sidebar-nav {
  padding: $spacing-md 0;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  height: $header-height;
  background-color: $background-white;
  border-bottom: 1px solid $border-color;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 $spacing-lg;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.sidebar-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: $spacing-sm;
  border-radius: $border-radius-sm;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-secondary;
  transition: all $transition-fast;

  &:hover {
    background-color: $background-color;
    color: $primary-color;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.content {
  flex: 1;
  padding: $spacing-lg;
  overflow-y: auto;
  background-color: $background-color;
}

@media (max-width: $breakpoint-md) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    z-index: $z-index-dropdown;
    height: 100vh;

    &.collapsed {
      left: -$sidebar-width;
    }
  }

  .main-content {
    margin-left: 0;
  }

  .content {
    padding: $spacing-md;
  }
}
</style>
