<template>
  <div class="app-layout" :class="layoutClasses">
    <!-- 页面内容区域 -->
    <main class="app-layout__content" :class="contentClasses">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMusicStore } from '@/stores/music'

interface Props {
  /** 是否禁用底部安全区域（用于全屏页面如播放器） */
  disableBottomSafeArea?: boolean
  /** 自定义内容区域类名 */
  contentClass?: string
  /** 是否使用紧凑布局（减少内边距） */
  compact?: boolean
  /** 是否使用全宽布局（不限制最大宽度） */
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disableBottomSafeArea: false,
  contentClass: '',
  compact: false,
  fullWidth: false,
})

const route = useRoute()
const musicStore = useMusicStore()

// 判断是否显示底部导航栏和mini播放器
const showBottomElements = computed(() => {
  const hiddenRoutes = ['/player', '/auth', '/onboarding', '/dev-tools']
  return (
    !hiddenRoutes.includes(route.path) &&
    !route.path.startsWith('/auth') &&
    !route.meta.hideNavigation &&
    !props.disableBottomSafeArea
  )
})

// 判断是否显示mini播放器
const showMiniPlayer = computed(() => {
  return showBottomElements.value && !!musicStore.currentSong
})

// 特殊页面检测
const isPlayerPage = computed(() => route.path === '/player')
const isAuthPage = computed(() => route.path.startsWith('/auth') || route.path === '/auth')
const isOnboardingPage = computed(() => route.path === '/onboarding')

// 布局容器类名
const layoutClasses = computed(() => ({
  'app-layout--compact': props.compact,
  'app-layout--full-width': props.fullWidth,
  'app-layout--with-bottom-elements': showBottomElements.value,
  'app-layout--player': isPlayerPage.value,
  'app-layout--auth': isAuthPage.value,
  'app-layout--onboarding': isOnboardingPage.value,
}))

// 内容区域类名
const contentClasses = computed(() => [
  props.contentClass,
  {
    'app-layout__content--with-safe-area': showBottomElements.value,
    'app-layout__content--with-mini-player': showMiniPlayer.value,
  },
])
</script>

<style scoped lang="scss">
/* 导入设计系统变量 */
@use '@/styles/variables.scss' as *;
@use '@/styles/mixins.scss' as *;

.app-layout {
  min-height: 100vh;
  position: relative;

  // 默认布局样式
  &__content {
    width: 100%;
    // 为底部导航栏预留空间（没有mini播放器时）
    &--with-safe-area {
      padding-bottom: calc(65px + env(safe-area-inset-bottom));

      @include respond-to(md) {
        padding-bottom: calc(65px + env(safe-area-inset-bottom));
      }
    }

    // 为底部导航栏和mini播放器预留空间（有mini播放器时）
    &--with-mini-player {
      padding-bottom: calc(115px + env(safe-area-inset-bottom));

      @include respond-to(md) {
        padding-bottom: calc(115px + env(safe-area-inset-bottom));
      }
    }
  }

  // 紧凑布局 - 减少内边距
  &--compact {
    .app-layout__content {
      padding: 0;
      @include respond-to(md) {
        padding: $spacing-3 $spacing-2;
      }
    }
  }

  // 全宽布局 - 不限制最大宽度
  &--full-width {
    .app-layout__content {
      max-width: none;
      padding-left: 0;
      padding-right: 0;
    }
  }
}

// 特殊页面布局变体
.app-layout {
  // 音乐播放器页面 - 全屏布局
  &--player {
    .app-layout__content {
      padding: 0;
      max-width: none;
    }
  }

  // 认证页面 - 居中布局
  &--auth {
    display: flex;
    align-items: center;
    justify-content: center;

    .app-layout__content {
      padding: 0;
      max-width: 400px;
    }
  }

  // 引导页面 - 全屏布局
  &--onboarding {
    .app-layout__content {
      padding: 0;
      max-width: none;
      height: 100vh;
    }
  }
}
</style>
