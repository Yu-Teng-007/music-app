<template>
  <div :class="formItemClasses">
    <label v-if="label || required" :class="labelClasses" :style="labelStyle">
      <span v-if="required && !hideRequiredAsterisk" class="mobile-form-item__asterisk">*</span>
      {{ label }}
    </label>

    <div class="mobile-form-item__content">
      <slot></slot>

      <Transition name="error-fade">
        <div v-if="errorMessage" class="mobile-form-item__error">
          {{ errorMessage }}
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue'

interface Props {
  label?: string
  prop?: string
  required?: boolean
  rules?: any[]
  error?: string
  showMessage?: boolean
  inlineMessage?: boolean
  size?: 'large' | 'default' | 'small'
}

const props = withDefaults(defineProps<Props>(), {
  showMessage: true,
  inlineMessage: false,
})

const errorMessage = ref('')
const isValidating = ref(false)

// 注入表单上下文
interface FormContext {
  props: {
    size?: string
    labelWidth?: string
    labelPosition?: string
    hideRequiredAsterisk?: boolean
    rules?: Record<string, any>
  }
  validateField: (prop: string) => Promise<boolean>
  addField: (field: any) => void
  removeField: (prop: string) => void
  errors?: Map<string, string>
}

const formContext = inject<FormContext | null>('mobileForm', null)

const formItemClasses = computed(() => [
  'mobile-form-item',
  {
    'mobile-form-item--error': !!errorMessage.value,
    'mobile-form-item--validating': isValidating.value,
    'mobile-form-item--required': props.required,
    [`mobile-form-item--${formContext?.props.size || props.size || 'default'}`]: true,
  },
])

const labelClasses = computed(() => [
  'mobile-form-item__label',
  {
    'mobile-form-item__label--required': props.required && !hideRequiredAsterisk.value,
  },
])

const labelStyle = computed(() => {
  const labelWidth = formContext?.props.labelWidth
  if (labelWidth && formContext?.props.labelPosition !== 'top') {
    return { width: labelWidth }
  }
  return {}
})

const hideRequiredAsterisk = computed(() => {
  return formContext?.props.hideRequiredAsterisk || false
})

const required = computed(() => {
  if (props.required !== undefined) {
    return props.required
  }

  // 从规则中推断是否必填
  const rules = props.rules || formContext?.props.rules?.[props.prop!]
  if (rules) {
    const ruleArray = Array.isArray(rules) ? rules : [rules]
    return ruleArray.some(rule => rule.required)
  }

  return false
})

// 验证方法
const validate = async () => {
  if (!props.prop || !formContext) return true

  isValidating.value = true

  try {
    const isValid = await formContext.validateField(props.prop)
    errorMessage.value = isValid ? '' : formContext.errors?.get(props.prop) || ''
    return isValid
  } finally {
    isValidating.value = false
  }
}

// 重置方法
const reset = () => {
  errorMessage.value = ''
  isValidating.value = false
}

// 清除验证
const clearValidate = () => {
  errorMessage.value = ''
}

// 监听外部错误
watch(
  () => props.error,
  newError => {
    errorMessage.value = newError || ''
  }
)

// 注册到表单
onMounted(() => {
  if (props.prop && formContext) {
    formContext.addField({
      prop: props.prop,
      validate,
      reset,
      clearValidate,
    })
  }
})

// 从表单注销
onUnmounted(() => {
  if (props.prop && formContext) {
    formContext.removeField(props.prop)
  }
})

defineExpose({
  validate,
  reset,
  clearValidate,
})
</script>

<style scoped>
.mobile-form-item {
  margin-bottom: 24px;
}

.mobile-form-item--large {
  margin-bottom: 28px;
}

.mobile-form-item--small {
  margin-bottom: 20px;
}

.mobile-form-item__label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  line-height: 1.5;
  margin-bottom: 8px;
  position: relative;
}

.mobile-form-item--large .mobile-form-item__label {
  font-size: 16px;
  margin-bottom: 10px;
}

.mobile-form-item--small .mobile-form-item__label {
  font-size: 12px;
  margin-bottom: 6px;
}

.mobile-form-item__asterisk {
  color: #f56c6c;
  margin-right: 4px;
}

.mobile-form-item__content {
  position: relative;
}

.mobile-form-item__error {
  color: #f56c6c;
  font-size: 12px;
  line-height: 1.4;
  margin-top: 6px;
  padding-left: 2px;
}

.mobile-form-item--error :deep(.mobile-input__inner),
.mobile-form-item--error :deep(.mobile-select__inner) {
  border-color: #f56c6c;
}

.mobile-form-item--error :deep(.mobile-input--focus .mobile-input__inner),
.mobile-form-item--error :deep(.mobile-select--focus .mobile-select__inner) {
  box-shadow: 0 0 0 2px rgba(245, 108, 108, 0.2);
}

/* 水平布局 */
.mobile-form--label-left .mobile-form-item,
.mobile-form--label-right .mobile-form-item {
  display: flex;
  align-items: flex-start;
}

.mobile-form--label-left .mobile-form-item__label {
  margin-bottom: 0;
  margin-right: 12px;
  flex-shrink: 0;
  text-align: right;
  padding-top: 12px;
}

.mobile-form--label-right .mobile-form-item__label {
  margin-bottom: 0;
  margin-left: 12px;
  flex-shrink: 0;
  order: 2;
  padding-top: 12px;
}

.mobile-form--label-left .mobile-form-item__content,
.mobile-form--label-right .mobile-form-item__content {
  flex: 1;
}

/* 动画 */
.error-fade-enter-active,
.error-fade-leave-active {
  transition: all 0.2s ease;
}

.error-fade-enter-from,
.error-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .mobile-form--label-left .mobile-form-item,
  .mobile-form--label-right .mobile-form-item {
    flex-direction: column;
  }

  .mobile-form--label-left .mobile-form-item__label,
  .mobile-form--label-right .mobile-form-item__label {
    margin: 0 0 8px 0;
    text-align: left;
    padding-top: 0;
    order: 0;
  }
}
</style>
