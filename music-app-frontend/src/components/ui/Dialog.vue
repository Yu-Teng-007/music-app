<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div
        v-if="modelValue"
        class="mobile-dialog-overlay"
        @click="handleOverlayClick"
        @touchmove.prevent
      >
        <Transition name="dialog-slide">
          <div
            v-if="modelValue"
            :class="dialogClasses"
            :style="dialogStyles"
            @click.stop
          >
            <!-- 头部 -->
            <div v-if="showHeader" class="mobile-dialog__header">
              <div class="mobile-dialog__title">
                <slot name="title">{{ title }}</slot>
              </div>
              <button
                v-if="showClose"
                class="mobile-dialog__close"
                @click="handleClose"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <!-- 内容 -->
            <div class="mobile-dialog__body">
              <slot></slot>
            </div>

            <!-- 底部 -->
            <div v-if="$slots.footer" class="mobile-dialog__footer">
              <slot name="footer"></slot>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch, nextTick } from 'vue'

interface Props {
  modelValue: boolean
  title?: string
  width?: string
  top?: string
  modal?: boolean
  modalClass?: string
  lockScroll?: boolean
  showClose?: boolean
  closeOnClickModal?: boolean
  closeOnPressEscape?: boolean
  beforeClose?: (done: () => void) => void
  fullscreen?: boolean
  customClass?: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'open'): void
  (e: 'opened'): void
  (e: 'close'): void
  (e: 'closed'): void
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  width: '90%',
  top: '15vh',
  modal: true,
  lockScroll: true,
  showClose: true,
  closeOnClickModal: true,
  closeOnPressEscape: true,
  fullscreen: false
})

const emit = defineEmits<Emits>()

const showHeader = computed(() => {
  return props.title || props.showClose || !!slots.title
})

const dialogClasses = computed(() => [
  'mobile-dialog',
  {
    'mobile-dialog--fullscreen': props.fullscreen,
    [props.customClass!]: props.customClass
  }
])

const dialogStyles = computed(() => {
  if (props.fullscreen) {
    return {}
  }
  return {
    width: props.width,
    marginTop: props.top
  }
})

// 处理关闭
const handleClose = () => {
  if (props.beforeClose) {
    props.beforeClose(() => {
      emit('update:modelValue', false)
    })
  } else {
    emit('update:modelValue', false)
  }
}

// 处理遮罩点击
const handleOverlayClick = () => {
  if (props.closeOnClickModal) {
    handleClose()
  }
}

// 处理ESC键
const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.closeOnPressEscape) {
    handleClose()
  }
}

// 监听对话框状态
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    emit('open')
    nextTick(() => {
      emit('opened')
    })
    
    // 锁定滚动
    if (props.lockScroll) {
      document.body.style.overflow = 'hidden'
    }
    
    // 监听ESC键
    if (props.closeOnPressEscape) {
      document.addEventListener('keydown', handleEscapeKey)
    }
  } else {
    emit('close')
    nextTick(() => {
      emit('closed')
    })
    
    // 恢复滚动
    if (props.lockScroll) {
      document.body.style.overflow = ''
    }
    
    // 移除ESC键监听
    document.removeEventListener('keydown', handleEscapeKey)
  }
})

// 获取插槽
const slots = defineSlots<{
  default(): any
  title(): any
  footer(): any
}>()
</script>

<style scoped>
.mobile-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
}

.mobile-dialog {
  position: relative;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  max-width: 100%;
  max-height: calc(100vh - 40px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.mobile-dialog--fullscreen {
  width: 100% !important;
  height: 100% !important;
  max-width: 100% !important;
  max-height: 100% !important;
  margin: 0 !important;
  border-radius: 0;
}

.mobile-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 0 20px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 20px;
}

.mobile-dialog__title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.mobile-dialog__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  color: #909399;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.mobile-dialog__close:hover {
  background-color: #f5f7fa;
  color: #606266;
}

.mobile-dialog__close:active {
  transform: scale(0.95);
}

.mobile-dialog__body {
  padding: 0 20px;
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.mobile-dialog__footer {
  padding: 20px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

/* 动画 */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-slide-enter-active,
.dialog-slide-leave-active {
  transition: all 0.3s ease;
}

.dialog-slide-enter-from {
  opacity: 0;
  transform: translateY(-50px) scale(0.9);
}

.dialog-slide-leave-to {
  opacity: 0;
  transform: translateY(50px) scale(0.9);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .mobile-dialog-overlay {
    padding: 10px;
  }
  
  .mobile-dialog {
    width: 100% !important;
    margin-top: 10vh !important;
    border-radius: 12px 12px 0 0;
  }
  
  .mobile-dialog__header {
    padding: 16px 16px 0 16px;
  }
  
  .mobile-dialog__body {
    padding: 0 16px;
  }
  
  .mobile-dialog__footer {
    padding: 16px;
    flex-direction: column;
  }
  
  .mobile-dialog__footer > * {
    width: 100%;
  }
}

/* 超小屏幕 */
@media (max-width: 480px) {
  .mobile-dialog {
    margin-top: 5vh !important;
    max-height: calc(100vh - 20px);
  }
}
</style>
