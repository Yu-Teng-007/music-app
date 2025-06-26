<template>
  <div :class="switchClasses" @click="handleClick">
    <input
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      class="mobile-switch__input"
      @change="handleChange"
    />
    <div class="mobile-switch__core">
      <div class="mobile-switch__button"></div>
    </div>
    <div v-if="activeText || inactiveText" class="mobile-switch__label">
      <span v-if="modelValue && activeText" class="mobile-switch__text">{{ activeText }}</span>
      <span v-if="!modelValue && inactiveText" class="mobile-switch__text">{{ inactiveText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue?: boolean
  disabled?: boolean
  activeText?: string
  inactiveText?: string
  activeColor?: string
  inactiveColor?: string
  size?: 'large' | 'default' | 'small'
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'change', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false,
  activeColor: '#409eff',
  inactiveColor: '#dcdfe6',
  size: 'default'
})

const emit = defineEmits<Emits>()

const switchClasses = computed(() => [
  'mobile-switch',
  `mobile-switch--${props.size}`,
  {
    'mobile-switch--checked': props.modelValue,
    'mobile-switch--disabled': props.disabled
  }
])

const handleClick = () => {
  if (props.disabled) return
  const newValue = !props.modelValue
  emit('update:modelValue', newValue)
  emit('change', newValue)
}

const handleChange = (event: Event) => {
  event.stopPropagation()
}
</script>

<style scoped>
.mobile-switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  min-height: 44px; /* 移动端最小触摸目标 */
}

.mobile-switch--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mobile-switch__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.mobile-switch__core {
  position: relative;
  width: 44px;
  height: 24px;
  background-color: v-bind(inactiveColor);
  border-radius: 12px;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.mobile-switch--large .mobile-switch__core {
  width: 52px;
  height: 28px;
  border-radius: 14px;
}

.mobile-switch--small .mobile-switch__core {
  width: 36px;
  height: 20px;
  border-radius: 10px;
}

.mobile-switch--checked .mobile-switch__core {
  background-color: v-bind(activeColor);
}

.mobile-switch__button {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background-color: #ffffff;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.mobile-switch--large .mobile-switch__button {
  width: 24px;
  height: 24px;
}

.mobile-switch--small .mobile-switch__button {
  width: 16px;
  height: 16px;
}

.mobile-switch--checked .mobile-switch__button {
  transform: translateX(20px);
}

.mobile-switch--large.mobile-switch--checked .mobile-switch__button {
  transform: translateX(24px);
}

.mobile-switch--small.mobile-switch--checked .mobile-switch__button {
  transform: translateX(16px);
}

.mobile-switch:active:not(.mobile-switch--disabled) .mobile-switch__button {
  width: 24px;
}

.mobile-switch--large:active:not(.mobile-switch--disabled) .mobile-switch__button {
  width: 28px;
}

.mobile-switch--small:active:not(.mobile-switch--disabled) .mobile-switch__button {
  width: 20px;
}

.mobile-switch--checked:active:not(.mobile-switch--disabled) .mobile-switch__button {
  transform: translateX(16px);
}

.mobile-switch--large.mobile-switch--checked:active:not(.mobile-switch--disabled) .mobile-switch__button {
  transform: translateX(20px);
}

.mobile-switch--small.mobile-switch--checked:active:not(.mobile-switch--disabled) .mobile-switch__button {
  transform: translateX(12px);
}

.mobile-switch__label {
  display: flex;
  align-items: center;
}

.mobile-switch__text {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.mobile-switch--large .mobile-switch__text {
  font-size: 16px;
}

.mobile-switch--small .mobile-switch__text {
  font-size: 12px;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .mobile-switch {
    min-height: 48px;
  }
  
  .mobile-switch__core {
    width: 48px;
    height: 28px;
    border-radius: 14px;
  }
  
  .mobile-switch__button {
    width: 24px;
    height: 24px;
  }
  
  .mobile-switch--checked .mobile-switch__button {
    transform: translateX(20px);
  }
  
  .mobile-switch__text {
    font-size: 16px; /* 防止iOS缩放 */
  }
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .mobile-switch__core {
    background-color: #4c4d4f;
  }
  
  .mobile-switch--checked .mobile-switch__core {
    background-color: #409eff;
  }
  
  .mobile-switch__button {
    background-color: #ffffff;
  }
  
  .mobile-switch__text {
    color: #ffffff;
  }
}
</style>
