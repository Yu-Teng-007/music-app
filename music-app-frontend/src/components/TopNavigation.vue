<template>
  <div class="top-navigation">
    <button class="back-button" @click="handleBack">
      <ArrowLeft :size="20" />
    </button>

    <h1 class="nav-title">
      <component v-if="icon" :is="icon" :size="24" />
      {{ title }}
    </h1>

    <div class="nav-actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

interface Props {
  title: string
  icon?: any
  showBack?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showBack: true,
})

const router = useRouter()

const handleBack = () => {
  router.back()
}
</script>

<style scoped>
.top-navigation {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: rgba(26, 26, 46, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  min-height: 40px;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.nav-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 导航栏按钮样式 */
.nav-actions :deep(.nav-text-button) {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  min-height: 36px;
  text-decoration: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.nav-actions :deep(.nav-text-button:hover) {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-actions :deep(.nav-text-button:active) {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(0.98);
}

.nav-actions :deep(.nav-text-button.warning) {
  color: #fbbf24;
}

.nav-actions :deep(.nav-text-button.warning:hover) {
  background: rgba(251, 191, 36, 0.1);
  color: #fcd34d;
}

.nav-actions :deep(.nav-text-button.primary) {
  color: #60a5fa;
}

.nav-actions :deep(.nav-text-button.primary:hover) {
  background: rgba(96, 165, 250, 0.1);
  color: #93c5fd;
}

.nav-actions :deep(.nav-text-button.danger) {
  color: #f87171;
}

.nav-actions :deep(.nav-text-button.danger:hover) {
  background: rgba(248, 113, 113, 0.1);
  color: #fca5a5;
}

.nav-actions :deep(.nav-text-button:disabled) {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .top-navigation {
    padding: 0.75rem 1rem;
    gap: 0.75rem;
  }

  .back-button {
    padding: 0.375rem;
    min-width: 36px;
    min-height: 36px;
  }

  .nav-title {
    font-size: 1.125rem;
  }

  .nav-actions :deep(.nav-text-button) {
    padding: 0.375rem 0.625rem;
    font-size: 0.8125rem;
    min-height: 32px;
  }
}

/* 超小屏幕优化 */
@media (max-width: 480px) {
  .top-navigation {
    padding: 0.5rem 0.75rem;
  }

  .nav-title {
    font-size: 1rem;
  }

  .nav-actions :deep(.nav-text-button) {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    gap: 0.25rem;
  }
}
</style>
