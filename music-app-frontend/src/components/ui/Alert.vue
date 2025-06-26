<template>
  <Transition name="alert-fade">
    <div v-if="visible" :class="alertClasses">
      <div v-if="showIcon" class="mobile-alert__icon">
        <svg v-if="type === 'success'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20,6 9,17 4,12"></polyline>
        </svg>
        <svg v-else-if="type === 'warning'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <svg v-else-if="type === 'error'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </div>
      
      <div class="mobile-alert__content">
        <div v-if="title" class="mobile-alert__title">{{ title }}</div>
        <div v-if="description || $slots.default" class="mobile-alert__description">
          <slot>{{ description }}</slot>
        </div>
      </div>
      
      <button v-if="closable" class="mobile-alert__close" @click="handleClose">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  type?: 'success' | 'warning' | 'error' | 'info'
  title?: string
  description?: string
  closable?: boolean
  showIcon?: boolean
  center?: boolean
}

interface Emits {
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  closable: true,
  showIcon: true,
  center: false
})

const emit = defineEmits<Emits>()

const visible = ref(true)

const alertClasses = computed(() => [
  'mobile-alert',
  `mobile-alert--${props.type}`,
  {
    'mobile-alert--center': props.center
  }
])

const handleClose = () => {
  visible.value = false
  emit('close')
}
</script>

<style scoped>
.mobile-alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid;
  margin-bottom: 16px;
  position: relative;
}

.mobile-alert--center {
  justify-content: center;
  text-align: center;
}

.mobile-alert--success {
  background-color: #f0f9ff;
  border-color: #c2e7b0;
  color: #67c23a;
}

.mobile-alert--warning {
  background-color: #fdf6ec;
  border-color: #f5dab1;
  color: #e6a23c;
}

.mobile-alert--error {
  background-color: #fef0f0;
  border-color: #fbc4c4;
  color: #f56c6c;
}

.mobile-alert--info {
  background-color: #ecf5ff;
  border-color: #b3d8ff;
  color: #409eff;
}

.mobile-alert__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.mobile-alert__content {
  flex: 1;
  min-width: 0;
}

.mobile-alert__title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
  margin-bottom: 4px;
}

.mobile-alert__description {
  font-size: 13px;
  line-height: 1.5;
  opacity: 0.9;
}

.mobile-alert__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  color: currentColor;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
  flex-shrink: 0;
  opacity: 0.7;
}

.mobile-alert__close:hover {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.1);
}

.mobile-alert__close:active {
  transform: scale(0.95);
}

/* 动画 */
.alert-fade-enter-active,
.alert-fade-leave-active {
  transition: all 0.3s ease;
}

.alert-fade-enter-from,
.alert-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .mobile-alert {
    padding: 16px;
    gap: 16px;
  }
  
  .mobile-alert__title {
    font-size: 15px;
  }
  
  .mobile-alert__description {
    font-size: 14px;
  }
  
  .mobile-alert__close {
    width: 32px;
    height: 32px;
    min-height: 44px; /* 移动端最小触摸目标 */
  }
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .mobile-alert--success {
    background-color: rgba(103, 194, 58, 0.1);
    border-color: rgba(103, 194, 58, 0.3);
  }
  
  .mobile-alert--warning {
    background-color: rgba(230, 162, 60, 0.1);
    border-color: rgba(230, 162, 60, 0.3);
  }
  
  .mobile-alert--error {
    background-color: rgba(245, 108, 108, 0.1);
    border-color: rgba(245, 108, 108, 0.3);
  }
  
  .mobile-alert--info {
    background-color: rgba(64, 158, 255, 0.1);
    border-color: rgba(64, 158, 255, 0.3);
  }
}
</style>
