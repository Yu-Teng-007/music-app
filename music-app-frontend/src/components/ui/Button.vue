<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    :type="nativeType"
    @click="handleClick"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <div v-if="loading" class="btn-loading">
      <div class="loading-spinner"></div>
    </div>
    <slot v-else></slot>
  </button>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text' | 'default'
  size?: 'large' | 'default' | 'small'
  disabled?: boolean
  loading?: boolean
  plain?: boolean
  round?: boolean
  circle?: boolean
  nativeType?: 'button' | 'submit' | 'reset'
}

interface Emits {
  (e: 'click', event: MouseEvent): void
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  size: 'default',
  disabled: false,
  loading: false,
  plain: false,
  round: false,
  circle: false,
  nativeType: 'button',
})

const emit = defineEmits<Emits>()

const isPressed = ref(false)

const buttonClasses = computed(() => [
  'mobile-btn',
  `mobile-btn--${props.type}`,
  `mobile-btn--${props.size}`,
  {
    'mobile-btn--disabled': props.disabled,
    'mobile-btn--loading': props.loading,
    'mobile-btn--plain': props.plain,
    'mobile-btn--round': props.round,
    'mobile-btn--circle': props.circle,
    'mobile-btn--pressed': isPressed.value,
  },
])

const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) return
  emit('click', event)
}

const handleTouchStart = () => {
  if (props.disabled || props.loading) return
  isPressed.value = true
}

const handleTouchEnd = () => {
  isPressed.value = false
}
</script>

<style scoped lang="scss">
/* 导入设计系统变量 */
@use '@/styles/variables.scss' as *;

.mobile-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-2;
  border: $border-width-thin solid transparent;
  border-radius: $border-radius-base;
  font-family: inherit;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  line-height: $line-height-tight;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  user-select: none;
  transition: $transition-fast;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  min-height: $component-height-base; /* 移动端最小触摸目标 */
  padding: $spacing-3 $spacing-4;
}

/* 尺寸变体 */
.mobile-btn--large {
  min-height: $component-height-lg;
  padding: $spacing-4 $spacing-6;
  font-size: $font-size-base;
}

.mobile-btn--small {
  min-height: $component-height-sm;
  padding: $spacing-2 $spacing-3;
  font-size: $font-size-xs;
}

/* 类型样式 - 使用设计系统颜色 */
.mobile-btn--default {
  background-color: $bg-surface;
  border-color: $border-color-light;
  color: $text-primary;

  &:hover {
    background-color: $bg-surface-hover;
    border-color: $border-color-base;
  }

  &:active {
    background-color: $bg-surface-active;
    transform: scale(0.98);
  }
}

.mobile-btn--primary {
  background-color: $primary;
  border-color: $primary;
  color: $text-primary;

  &:hover {
    background-color: $primary-light;
    border-color: $primary-light;
  }

  &:active {
    background-color: $primary-dark;
    transform: scale(0.98);
  }
}

.mobile-btn--success {
  background-color: $success;
  border-color: $success;
  color: $text-primary;

  &:hover {
    background-color: $success-light;
    border-color: $success-light;
  }

  &:active {
    background-color: $success-dark;
    transform: scale(0.98);
  }
}

.mobile-btn--warning {
  background-color: $warning;
  border-color: $warning;
  color: $text-primary;

  &:hover {
    background-color: $warning-light;
    border-color: $warning-light;
  }

  &:active {
    background-color: $warning-dark;
    transform: scale(0.98);
  }
}

.mobile-btn--danger {
  background-color: $error;
  border-color: $error;
  color: $text-primary;

  &:hover {
    background-color: $error-light;
    border-color: $error-light;
  }

  &:active {
    background-color: $error-dark;
    transform: scale(0.98);
  }
}

.mobile-btn--info {
  background-color: $info;
  border-color: $info;
  color: $text-primary;

  &:hover {
    background-color: $info-light;
    border-color: $info-light;
  }

  &:active {
    background-color: $info-dark;
    transform: scale(0.98);
  }
}

.mobile-btn--text {
  background-color: transparent;
  border-color: transparent;
  color: #409eff;
  padding: 8px 12px;
}

/* 朴素按钮 */
.mobile-btn--plain.mobile-btn--primary {
  background-color: #ecf5ff;
  border-color: #b3d8ff;
  color: #409eff;
}

.mobile-btn--plain.mobile-btn--success {
  background-color: #f0f9ff;
  border-color: #c2e7b0;
  color: #67c23a;
}

.mobile-btn--plain.mobile-btn--warning {
  background-color: #fdf6ec;
  border-color: #f5dab1;
  color: #e6a23c;
}

.mobile-btn--plain.mobile-btn--danger {
  background-color: #fef0f0;
  border-color: #fbc4c4;
  color: #f56c6c;
}

/* 圆角和圆形 */
.mobile-btn--round {
  border-radius: 20px;
}

.mobile-btn--circle {
  border-radius: 50%;
  width: 44px;
  height: 44px;
  padding: 0;
}

.mobile-btn--circle.mobile-btn--large {
  width: 48px;
  height: 48px;
}

.mobile-btn--circle.mobile-btn--small {
  width: 36px;
  height: 36px;
}

/* 按下状态 */
.mobile-btn--pressed:not(.mobile-btn--disabled):not(.mobile-btn--loading) {
  transform: scale(0.98);
  opacity: 0.8;
}

/* 禁用状态 */
.mobile-btn--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 加载状态 */
.mobile-btn--loading {
  cursor: not-allowed;
}

.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
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

/* 触摸反馈 */
@media (hover: hover) {
  .mobile-btn:not(.mobile-btn--disabled):not(.mobile-btn--loading):hover {
    opacity: 0.9;
  }
}

/* 焦点状态 */
.mobile-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.3);
}

/* 活跃状态 */
.mobile-btn:active:not(.mobile-btn--disabled):not(.mobile-btn--loading) {
  transform: scale(0.98);
}
</style>
