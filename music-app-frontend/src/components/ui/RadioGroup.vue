<template>
  <div class="mobile-radio-group">
    <div
      v-for="option in options"
      :key="option.value"
      :class="[
        'mobile-radio-button',
        {
          'mobile-radio-button--active': option.value === modelValue,
          'mobile-radio-button--disabled': option.disabled,
        },
      ]"
      @click="handleClick(option)"
    >
      {{ option.label }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface RadioOption {
  label: string
  value: string | number
  disabled?: boolean
}

interface Props {
  modelValue?: string | number
  options: RadioOption[]
  disabled?: boolean
  size?: 'large' | 'default' | 'small'
}

interface Emits {
  (e: 'update:modelValue', value: string | number): void
  (e: 'change', value: string | number): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  size: 'default',
})

const emit = defineEmits<Emits>()

const handleClick = (option: RadioOption) => {
  if (props.disabled || option.disabled) return

  emit('update:modelValue', option.value)
  emit('change', option.value)
}
</script>

<style scoped>
.mobile-radio-group {
  display: inline-flex;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.mobile-radio-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  background-color: transparent;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  min-height: 44px; /* 移动端最小触摸目标 */
  -webkit-tap-highlight-color: transparent;
}

.mobile-radio-button:last-child {
  border-right: none;
}

.mobile-radio-button:hover:not(.mobile-radio-button--disabled) {
  background-color: rgba(255, 255, 255, 0.15);
}

.mobile-radio-button--active {
  background-color: #64b5f6;
  color: #ffffff;
  border-color: #64b5f6;
}

.mobile-radio-button--active + .mobile-radio-button {
  border-left-color: #64b5f6;
}

.mobile-radio-button--disabled {
  color: rgba(255, 255, 255, 0.3);
  cursor: not-allowed;
  background-color: rgba(255, 255, 255, 0.05);
}

.mobile-radio-button:active:not(.mobile-radio-button--disabled) {
  transform: scale(0.98);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .mobile-radio-button {
    padding: 10px 12px;
    font-size: 14px;
    min-height: 48px;
  }

  .mobile-radio-group {
    width: 100%;
  }

  .mobile-radio-button {
    flex: 1;
    text-align: center;
  }
}

/* 小屏幕时垂直排列 */
@media (max-width: 480px) {
  .mobile-radio-group {
    flex-direction: column;
  }

  .mobile-radio-button {
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }

  .mobile-radio-button:last-child {
    border-bottom: none;
  }

  .mobile-radio-button--active + .mobile-radio-button {
    border-left-color: rgba(255, 255, 255, 0.2);
    border-top-color: #64b5f6;
  }
}
</style>
