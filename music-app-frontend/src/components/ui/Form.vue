<template>
  <form :class="formClasses" @submit.prevent="handleSubmit">
    <slot></slot>
  </form>
</template>

<script setup lang="ts">
import { computed, provide, reactive } from 'vue'

interface Props {
  model?: Record<string, any>
  rules?: Record<string, any>
  labelWidth?: string
  labelPosition?: 'left' | 'right' | 'top'
  size?: 'large' | 'default' | 'small'
  disabled?: boolean
  validateOnRuleChange?: boolean
  hideRequiredAsterisk?: boolean
}

interface Emits {
  (e: 'submit', event: Event): void
  (e: 'validate', isValid: boolean, invalidFields?: any): void
}

const props = withDefaults(defineProps<Props>(), {
  labelPosition: 'top',
  size: 'default',
  disabled: false,
  validateOnRuleChange: true,
  hideRequiredAsterisk: false
})

const emit = defineEmits<Emits>()

const formClasses = computed(() => [
  'mobile-form',
  `mobile-form--label-${props.labelPosition}`,
  `mobile-form--${props.size}`,
  {
    'mobile-form--disabled': props.disabled
  }
])

// 表单验证状态
const formState = reactive({
  fields: new Map(),
  errors: new Map()
})

// 提供给子组件的上下文
provide('mobileForm', {
  props,
  addField: (field: any) => {
    formState.fields.set(field.prop, field)
  },
  removeField: (prop: string) => {
    formState.fields.delete(prop)
    formState.errors.delete(prop)
  },
  validateField: async (prop: string) => {
    const field = formState.fields.get(prop)
    if (!field) return true

    const rules = props.rules?.[prop]
    if (!rules) return true

    const value = props.model?.[prop]
    
    try {
      // 简单的验证逻辑
      for (const rule of Array.isArray(rules) ? rules : [rules]) {
        if (rule.required && (!value || value === '')) {
          throw new Error(rule.message || `${prop} is required`)
        }
        
        if (rule.min && value && value.length < rule.min) {
          throw new Error(rule.message || `${prop} must be at least ${rule.min} characters`)
        }
        
        if (rule.max && value && value.length > rule.max) {
          throw new Error(rule.message || `${prop} must be at most ${rule.max} characters`)
        }
        
        if (rule.pattern && value && !rule.pattern.test(value)) {
          throw new Error(rule.message || `${prop} format is invalid`)
        }
        
        if (rule.validator && typeof rule.validator === 'function') {
          await rule.validator(rule, value, (error?: Error) => {
            if (error) throw error
          })
        }
      }
      
      formState.errors.delete(prop)
      return true
    } catch (error) {
      formState.errors.set(prop, error.message)
      return false
    }
  }
})

const handleSubmit = (event: Event) => {
  emit('submit', event)
}

// 暴露验证方法
const validate = async (): Promise<boolean> => {
  const results = await Promise.all(
    Array.from(formState.fields.keys()).map(prop => 
      formState.fields.get(prop)?.validate?.()
    )
  )
  
  const isValid = results.every(result => result === true)
  const invalidFields = isValid ? undefined : Object.fromEntries(formState.errors)
  
  emit('validate', isValid, invalidFields)
  return isValid
}

const validateField = (prop: string) => {
  return formState.fields.get(prop)?.validate?.()
}

const resetFields = () => {
  formState.fields.forEach(field => {
    field.reset?.()
  })
  formState.errors.clear()
}

const clearValidate = (props?: string | string[]) => {
  if (!props) {
    formState.errors.clear()
    return
  }
  
  const propsArray = Array.isArray(props) ? props : [props]
  propsArray.forEach(prop => {
    formState.errors.delete(prop)
  })
}

defineExpose({
  validate,
  validateField,
  resetFields,
  clearValidate
})
</script>

<style scoped>
.mobile-form {
  width: 100%;
}

.mobile-form--label-left {
  --label-position: left;
}

.mobile-form--label-right {
  --label-position: right;
}

.mobile-form--label-top {
  --label-position: top;
}

.mobile-form--large {
  --form-size: large;
}

.mobile-form--default {
  --form-size: default;
}

.mobile-form--small {
  --form-size: small;
}

.mobile-form--disabled {
  opacity: 0.6;
  pointer-events: none;
}
</style>
