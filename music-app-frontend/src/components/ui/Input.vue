<template>
  <div :class="wrapperClasses">
    <!-- 前置内容 -->
    <div v-if="$slots.prefix" class="mobile-input__prefix">
      <slot name="prefix"></slot>
    </div>

    <!-- 输入框 -->
    <input
      v-if="type !== 'textarea'"
      ref="inputRef"
      :class="inputClasses"
      :type="showPassword ? (passwordVisible ? 'text' : 'password') : type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxlength"
      :minlength="minlength"
      :autocomplete="autocomplete"
      @input="handleInput"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
    />

    <!-- 文本域 -->
    <textarea
      v-else
      ref="textareaRef"
      :class="inputClasses"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxlength"
      :minlength="minlength"
      :rows="rows"
      :style="textareaStyle"
      @input="handleInput"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
    ></textarea>

    <!-- 后置内容 -->
    <div v-if="$slots.suffix || showPassword || clearable" class="mobile-input__suffix">
      <!-- 清除按钮 -->
      <button
        v-if="clearable && modelValue && !disabled && !readonly"
        class="mobile-input__clear"
        @click="handleClear"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      </button>

      <!-- 密码显示切换 -->
      <button
        v-if="showPassword"
        class="mobile-input__password"
        @click="togglePasswordVisible"
      >
        <svg v-if="passwordVisible" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
      </button>

      <!-- 后置插槽 -->
      <slot name="suffix"></slot>
    </div>

    <!-- 字数统计 -->
    <div v-if="showWordLimit" class="mobile-input__count">
      {{ currentLength }}/{{ maxlength }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, watch } from 'vue'

interface Props {
  modelValue?: string | number
  type?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  clearable?: boolean
  showPassword?: boolean
  showWordLimit?: boolean
  maxlength?: number
  minlength?: number
  rows?: number
  autosize?: boolean | { minRows?: number; maxRows?: number }
  autocomplete?: string
  size?: 'large' | 'default' | 'small'
  resize?: 'none' | 'both' | 'horizontal' | 'vertical'
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'input', value: string): void
  (e: 'change', value: string): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  (e: 'clear'): void
  (e: 'keydown', event: KeyboardEvent): void
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  disabled: false,
  readonly: false,
  clearable: false,
  showPassword: false,
  showWordLimit: false,
  rows: 2,
  autosize: false,
  autocomplete: 'off',
  size: 'default',
  resize: 'vertical'
})

const emit = defineEmits<Emits>()

const inputRef = ref<HTMLInputElement>()
const textareaRef = ref<HTMLTextAreaElement>()
const passwordVisible = ref(false)
const focused = ref(false)

const currentLength = computed(() => {
  return String(props.modelValue || '').length
})

const wrapperClasses = computed(() => [
  'mobile-input',
  `mobile-input--${props.size}`,
  {
    'mobile-input--disabled': props.disabled,
    'mobile-input--focused': focused.value,
    'mobile-input--textarea': props.type === 'textarea'
  }
])

const inputClasses = computed(() => [
  'mobile-input__inner',
  {
    'mobile-input__inner--suffix': !!slots.suffix || props.clearable || props.showPassword
  }
])

const textareaStyle = computed(() => {
  const style: Record<string, any> = {
    resize: props.resize
  }
  
  if (props.autosize && props.type === 'textarea') {
    style.resize = 'none'
  }
  
  return style
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
  const value = target.value
  emit('update:modelValue', value)
  emit('input', value)
  
  if (props.autosize && props.type === 'textarea') {
    nextTick(() => {
      resizeTextarea()
    })
  }
}

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
  emit('change', target.value)
}

const handleFocus = (event: FocusEvent) => {
  focused.value = true
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  focused.value = false
  emit('blur', event)
}

const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
  focus()
}

const handleKeydown = (event: KeyboardEvent) => {
  emit('keydown', event)
}

const togglePasswordVisible = () => {
  passwordVisible.value = !passwordVisible.value
}

const focus = () => {
  nextTick(() => {
    if (props.type === 'textarea') {
      textareaRef.value?.focus()
    } else {
      inputRef.value?.focus()
    }
  })
}

const blur = () => {
  if (props.type === 'textarea') {
    textareaRef.value?.blur()
  } else {
    inputRef.value?.blur()
  }
}

const resizeTextarea = () => {
  if (!textareaRef.value || !props.autosize) return
  
  const textarea = textareaRef.value
  textarea.style.height = 'auto'
  
  let height = textarea.scrollHeight
  
  if (typeof props.autosize === 'object') {
    const { minRows = 1, maxRows } = props.autosize
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20
    
    if (minRows) {
      height = Math.max(height, minRows * lineHeight)
    }
    
    if (maxRows) {
      height = Math.min(height, maxRows * lineHeight)
    }
  }
  
  textarea.style.height = height + 'px'
}

// 监听autosize变化
watch(() => [props.autosize, props.modelValue], () => {
  if (props.autosize && props.type === 'textarea') {
    nextTick(() => {
      resizeTextarea()
    })
  }
}, { immediate: true })

// 暴露方法
defineExpose({
  focus,
  blur
})

const slots = defineSlots<{
  prefix(): any
  suffix(): any
}>()
</script>

<style scoped>
.mobile-input {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 100%;
  font-size: 14px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background-color: #ffffff;
  transition: border-color 0.2s ease;
}

.mobile-input--large {
  font-size: 16px;
}

.mobile-input--small {
  font-size: 12px;
}

.mobile-input--focused {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.mobile-input--disabled {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #c0c4cc;
  cursor: not-allowed;
}

.mobile-input--textarea {
  align-items: flex-start;
}

.mobile-input__inner {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: #606266;
  font-size: inherit;
  padding: 12px 16px;
  min-height: 44px; /* 移动端最小触摸目标 */
  -webkit-appearance: none;
}

.mobile-input--large .mobile-input__inner {
  padding: 16px 20px;
  min-height: 48px;
}

.mobile-input--small .mobile-input__inner {
  padding: 8px 12px;
  min-height: 36px;
}

.mobile-input__inner--suffix {
  padding-right: 8px;
}

.mobile-input__inner::placeholder {
  color: #c0c4cc;
}

.mobile-input__inner:disabled {
  cursor: not-allowed;
}

textarea.mobile-input__inner {
  resize: vertical;
  min-height: 80px;
  line-height: 1.5;
}

.mobile-input__prefix,
.mobile-input__suffix {
  display: flex;
  align-items: center;
  color: #909399;
  padding: 0 8px;
}

.mobile-input__prefix {
  padding-left: 16px;
}

.mobile-input__suffix {
  padding-right: 16px;
}

.mobile-input__clear,
.mobile-input__password {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  color: #c0c4cc;
  cursor: pointer;
  border-radius: 4px;
  transition: color 0.2s ease;
  -webkit-tap-highlight-color: transparent;
  margin-left: 4px;
}

.mobile-input__clear:hover,
.mobile-input__password:hover {
  color: #909399;
}

.mobile-input__clear:active,
.mobile-input__password:active {
  transform: scale(0.95);
}

.mobile-input__count {
  position: absolute;
  bottom: -20px;
  right: 0;
  font-size: 12px;
  color: #909399;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .mobile-input__inner {
    font-size: 16px; /* 防止iOS缩放 */
  }
  
  .mobile-input--small .mobile-input__inner {
    font-size: 14px;
  }
}
</style>
