<template>
  <nav class="bottom-navigation">
    <router-link
      v-for="item in navigationItems"
      :key="item.name"
      :to="item.path"
      class="nav-item"
      :class="{ active: isActive(item.path) }"
    >
      <component :is="item.icon" :size="24" />
      <span class="nav-label">{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { Home, Compass, Music, User } from 'lucide-vue-next'

interface NavigationItem {
  name: string
  label: string
  path: string
  icon: any
}

const route = useRoute()

const navigationItems: NavigationItem[] = [
  {
    name: 'home',
    label: '首页',
    path: '/',
    icon: Home,
  },
  {
    name: 'discover',
    label: '广场',
    path: '/discover',
    icon: Compass,
  },
  {
    name: 'playlist',
    label: '歌单',
    path: '/playlist',
    icon: Music,
  },
  {
    name: 'profile',
    label: '我的',
    path: '/profile',
    icon: User,
  },
]

const isActive = (path: string) => {
  return route.path === path
}
</script>

<style scoped lang="scss">
/* 导入设计系统变量 */
@use '@/styles/variables.scss' as *;

.bottom-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba($bg-primary, 0.95);
  backdrop-filter: blur(20px);
  border-top: $border-width-thin solid $border-color-light;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: $spacing-3 0 calc(#{$spacing-3} + env(safe-area-inset-bottom));
  z-index: $z-index-fixed;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-1;
  padding: $spacing-2 $spacing-4;
  border-radius: $border-radius-md;
  text-decoration: none;
  color: $text-tertiary;
  transition: $transition-fast;
  min-width: 60px;
  /* 移除点击高亮效果 */
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  outline: none;
}

.nav-item:hover {
  color: $text-secondary;
  background-color: $bg-surface;
}

.nav-item:active {
  background-color: $bg-surface-hover;
  transform: scale(0.98);
}

.nav-item:focus {
  outline: none;
  box-shadow: 0 0 0 2px $primary-alpha-30;
}

.nav-item.active {
  color: $primary;
  background-color: $primary-alpha-10;
}

.nav-item.active:hover {
  background-color: $primary-alpha-20;
}

.nav-item.active:focus {
  box-shadow: 0 0 0 2px $primary-alpha-30;
}

/* 移动端导航优化 */
@media (hover: none) {
  .nav-item:active {
    background-color: rgba(255, 255, 255, 0.15);
    transform: scale(0.95);
    transition: all 0.1s ease;
  }

  .nav-item.active:active {
    background-color: rgba(0, 122, 255, 0.2);
    transform: scale(0.95);
  }

  .nav-item:focus {
    outline: none;
    box-shadow: none;
  }

  .nav-item.active:focus {
    box-shadow: none;
  }
}

.nav-label {
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .bottom-navigation {
    padding: 0.5rem 0 calc(0.5rem + env(safe-area-inset-bottom));
  }

  .nav-item {
    padding: 0.375rem 0.5rem;
    min-width: 50px;
  }

  .nav-label {
    font-size: 0.6875rem;
  }
}

/* 适配深色模式 */
@media (prefers-color-scheme: dark) {
  .bottom-navigation {
    background: rgba(0, 0, 0, 0.95);
    border-top-color: rgba(255, 255, 255, 0.1);
  }
}
</style>
