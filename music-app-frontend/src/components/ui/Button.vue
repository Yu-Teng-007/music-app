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
  nativeType: 'button'
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
    'mobile-btn--pressed': isPressed.value
  }
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

<style scoped>
.mobile-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  min-height: 44px; /* 移动端最小触摸目标 */
  padding: 8px 16px;
}

/* 尺寸 */
.mobile-btn--large {
  min-height: 48px;
  padding: 12px 24px;
  font-size: 16px;
}

.mobile-btn--small {
  min-height: 36px;
  padding: 6px 12px;
  font-size: 12px;
}

/* 类型样式 */
.mobile-btn--default {
  background-color: #ffffff;
  border-color: #dcdfe6;
  color: #606266;
}

.mobile-btn--primary {
  background-color: #409eff;
  border-color: #409eff;
  color: #ffffff;
}

.mobile-btn--success {
  background-color: #67c23a;
  border-color: #67c23a;
  color: #ffffff;
}

.mobile-btn--warning {
  background-color: #e6a23c;
  border-color: #e6a23c;
  color: #ffffff;
}

.mobile-btn--danger {
  background-color: #f56c6c;
  border-color: #f56c6c;
  color: #ffffff;
}

.mobile-btn--info {
  background-color: #909399;
  border-color: #909399;
  color: #ffffff;
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
