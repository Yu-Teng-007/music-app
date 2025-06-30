<template>
  <button :class="buttonClasses" :disabled="disabled || loading" @click="handleClick">
    <div v-if="loading" class="loading-spinner">
      <div class="spinner"></div>
    </div>
    <template v-else>
      <slot></slot>
    </template>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'default' | 'primary' | 'warning' | 'danger'
  disabled?: boolean
  loading?: boolean
}

interface Emits {
  (e: 'click', event: MouseEvent): void
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  disabled: false,
  loading: false,
})

const emit = defineEmits<Emits>()

const buttonClasses = computed(() => [
  'nav-text-button',
  props.type,
  {
    loading: props.loading,
    disabled: props.disabled,
  },
])

const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) return
  emit('click', event)
}
</script>

<style scoped lang="scss">
/* 导入设计系统变量 */
@use '@/assets/styles/variables.scss' as *;

.nav-text-button {
  background: none;
  border: none;
  color: $text-secondary;
  cursor: pointer;
  padding: $spacing-3 $spacing-4;
  border-radius: $border-radius-base;
  transition: $transition-fast;
  display: flex;
  align-items: center;
  gap: $spacing-2;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  min-height: $component-height-sm;
  text-decoration: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  white-space: nowrap;
}

.nav-text-button:hover {
  background: $bg-surface-hover;
  color: $text-primary;
}

.nav-text-button:active {
  background: $bg-surface-active;
  transform: scale(0.98);
}

.nav-text-button.warning {
  color: $warning;

  &:hover {
    background: rgba($warning, 0.1);
    color: $warning-light;
  }
}

.nav-text-button.primary {
  color: $primary;

  &:hover {
    background: $primary-alpha-10;
    color: $primary-light;
  }
}

.nav-text-button.danger {
  color: $error;

  &:hover {
    background: rgba($error, 0.1);
    color: $error-light;
  }
}

.nav-text-button:disabled,
.nav-text-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.nav-text-button.loading {
  cursor: not-allowed;
  pointer-events: none;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 移动端优化 */
@media (max-width: 768px) {
  .nav-text-button {
    padding: 0.375rem 0.625rem;
    font-size: 0.8125rem;
    min-height: 32px;
  }
}

/* 超小屏幕优化 */
@media (max-width: 480px) {
  .nav-text-button {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    gap: 0.25rem;
  }

  .spinner {
    width: 14px;
    height: 14px;
  }
}
</style>
