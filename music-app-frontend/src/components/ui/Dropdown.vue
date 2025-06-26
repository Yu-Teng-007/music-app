<template>
  <div class="mobile-dropdown" @click="toggleDropdown">
    <div class="mobile-dropdown__trigger">
      <slot></slot>
    </div>

    <Transition name="dropdown-fade">
      <div v-if="visible" class="mobile-dropdown__menu" @click.stop>
        <slot name="dropdown"></slot>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, provide } from 'vue'

interface Props {
  trigger?: 'hover' | 'click'
  placement?: 'bottom' | 'bottom-start' | 'bottom-end' | 'top' | 'top-start' | 'top-end'
  disabled?: boolean
}

interface Emits {
  (e: 'command', command: string): void
  (e: 'visible-change', visible: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  trigger: 'hover',
  placement: 'bottom-start',
  disabled: false
})

const emit = defineEmits<Emits>()

const visible = ref(false)

const toggleDropdown = () => {
  if (props.disabled) return
  
  if (props.trigger === 'click') {
    visible.value = !visible.value
    emit('visible-change', visible.value)
  }
}

const showDropdown = () => {
  if (props.disabled) return
  
  if (props.trigger === 'hover') {
    visible.value = true
    emit('visible-change', true)
  }
}

const hideDropdown = () => {
  if (props.trigger === 'hover') {
    visible.value = false
    emit('visible-change', false)
  }
}

const handleCommand = (command: string) => {
  emit('command', command)
  visible.value = false
  emit('visible-change', false)
}

const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (!target.closest('.mobile-dropdown')) {
    visible.value = false
    emit('visible-change', false)
  }
}

// 提供给子组件的上下文
provide('mobileDropdown', {
  handleCommand
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.mobile-dropdown {
  position: relative;
  display: inline-block;
}

.mobile-dropdown__trigger {
  cursor: pointer;
}

.mobile-dropdown__menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-top: 4px;
  min-width: 120px;
  overflow: hidden;
}

/* 动画 */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all 0.2s ease;
  transform-origin: top;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: scaleY(0.8);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .mobile-dropdown__menu {
    position: fixed;
    top: auto !important;
    bottom: 0;
    left: 0;
    right: 0;
    border-radius: 12px 12px 0 0;
    margin-top: 0;
    min-width: auto;
  }
  
  .dropdown-fade-enter-from,
  .dropdown-fade-leave-to {
    transform: translateY(100%);
  }
}
</style>
