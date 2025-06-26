<template>
  <div
    :class="itemClasses"
    @click="handleClick"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'

interface Props {
  command?: string
  disabled?: boolean
  divided?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  divided: false
})

const dropdownContext = inject('mobileDropdown', null)

const itemClasses = computed(() => [
  'mobile-dropdown-item',
  {
    'mobile-dropdown-item--disabled': props.disabled,
    'mobile-dropdown-item--divided': props.divided
  }
])

const handleClick = () => {
  if (props.disabled) return
  
  if (props.command && dropdownContext) {
    dropdownContext.handleCommand(props.command)
  }
}
</script>

<style scoped>
.mobile-dropdown-item {
  display: block;
  padding: 12px 16px;
  cursor: pointer;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
  transition: background-color 0.2s ease;
  min-height: 44px;
  display: flex;
  align-items: center;
}

.mobile-dropdown-item:hover {
  background-color: #f5f7fa;
}

.mobile-dropdown-item--disabled {
  color: #c0c4cc;
  cursor: not-allowed;
  background-color: transparent;
}

.mobile-dropdown-item--disabled:hover {
  background-color: transparent;
}

.mobile-dropdown-item--divided {
  border-top: 1px solid #ebeef5;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .mobile-dropdown-item {
    padding: 16px 20px;
    min-height: 48px;
    font-size: 16px;
  }
}
</style>
