<template>
  <label :class="checkboxClasses">
    <input
      type="checkbox"
      :checked="checked"
      :disabled="disabled"
      :value="value"
      @change="handleChange"
      class="mobile-checkbox__input"
    />
    <span class="mobile-checkbox__indicator">
      <svg
        v-if="checked"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
      >
        <polyline points="20,6 9,17 4,12"></polyline>
      </svg>
    </span>
    <span v-if="$slots.default || label" class="mobile-checkbox__label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue?: boolean | string[] | number[]
  value?: string | number
  label?: string
  disabled?: boolean
  size?: 'large' | 'default' | 'small'
}

interface Emits {
  (e: 'update:modelValue', value: boolean | string[] | number[]): void
  (e: 'change', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  size: 'default',
})

const emit = defineEmits<Emits>()

const checked = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return (
      props.value !== undefined && (props.modelValue as (string | number)[]).includes(props.value)
    )
  }
  return Boolean(props.modelValue)
})

const checkboxClasses = computed(() => [
  'mobile-checkbox',
  `mobile-checkbox--${props.size}`,
  {
    'mobile-checkbox--checked': checked.value,
    'mobile-checkbox--disabled': props.disabled,
  },
])

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const isChecked = target.checked

  if (Array.isArray(props.modelValue)) {
    const newValue = [...(props.modelValue as (string | number)[])]
    if (props.value !== undefined) {
      if (isChecked) {
        if (!newValue.includes(props.value)) {
          newValue.push(props.value)
        }
      } else {
        const index = newValue.indexOf(props.value)
        if (index > -1) {
          newValue.splice(index, 1)
        }
      }
    }
    emit('update:modelValue', newValue as string[] | number[])
  } else {
    emit('update:modelValue', isChecked)
  }

  emit('change', isChecked)
}
</script>

<style scoped>
.mobile-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  min-height: 44px; /* 移动端最小触摸目标 */
  padding: 8px 0;
}

.mobile-checkbox--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mobile-checkbox__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.mobile-checkbox__indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: 2px solid #dcdfe6;
  border-radius: 4px;
  background-color: #ffffff;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.mobile-checkbox--large .mobile-checkbox__indicator {
  width: 24px;
  height: 24px;
}

.mobile-checkbox--small .mobile-checkbox__indicator {
  width: 16px;
  height: 16px;
}

.mobile-checkbox--checked .mobile-checkbox__indicator {
  background-color: #409eff;
  border-color: #409eff;
  color: #ffffff;
}

.mobile-checkbox:hover:not(.mobile-checkbox--disabled) .mobile-checkbox__indicator {
  border-color: #409eff;
}

.mobile-checkbox:active:not(.mobile-checkbox--disabled) {
  transform: scale(0.98);
}

.mobile-checkbox__label {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.mobile-checkbox--large .mobile-checkbox__label {
  font-size: 16px;
}

.mobile-checkbox--small .mobile-checkbox__label {
  font-size: 12px;
}

.mobile-checkbox--checked .mobile-checkbox__label {
  color: #409eff;
}

.mobile-checkbox--disabled .mobile-checkbox__label {
  color: #c0c4cc;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .mobile-checkbox {
    min-height: 48px;
    padding: 12px 0;
  }

  .mobile-checkbox__indicator {
    width: 22px;
    height: 22px;
  }

  .mobile-checkbox__label {
    font-size: 16px; /* 防止iOS缩放 */
  }
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .mobile-checkbox__indicator {
    border-color: #4c4d4f;
    background-color: #2a2a2a;
  }

  .mobile-checkbox--checked .mobile-checkbox__indicator {
    background-color: #409eff;
    border-color: #409eff;
  }

  .mobile-checkbox__label {
    color: #ffffff;
  }

  .mobile-checkbox--disabled .mobile-checkbox__label {
    color: #666666;
  }
}
</style>
