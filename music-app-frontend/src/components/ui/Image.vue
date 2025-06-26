<template>
  <div class="mobile-image" :class="{ 'mobile-image--loading': loading }">
    <img
      v-show="!error && !loading"
      :src="src"
      :alt="alt"
      :class="['mobile-image__img', imageClass]"
      :style="imageStyle"
      @load="handleLoad"
      @error="handleError"
    />
    
    <!-- 加载状态 -->
    <div v-if="loading" class="mobile-image__loading">
      <slot name="loading">
        <div class="mobile-image__spinner">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 11-6.219-8.56"/>
          </svg>
        </div>
      </slot>
    </div>

    <!-- 错误状态 -->
    <div v-if="error" class="mobile-image__error">
      <slot name="error">
        <div class="mobile-image__error-content">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="9" cy="9" r="2"/>
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
          </svg>
          <span v-if="errorText" class="mobile-image__error-text">{{ errorText }}</span>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  src?: string
  alt?: string
  fit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
  lazy?: boolean
  errorText?: string
  width?: string | number
  height?: string | number
  borderRadius?: string | number
}

interface Emits {
  (e: 'load', event: Event): void
  (e: 'error', event: Event): void
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  fit: 'cover',
  lazy: false,
  errorText: ''
})

const emit = defineEmits<Emits>()

// 响应式状态
const loading = ref(true)
const error = ref(false)

// 计算样式
const imageClass = computed(() => {
  return `mobile-image__img--${props.fit}`
})

const imageStyle = computed(() => {
  const style: Record<string, string> = {}
  
  if (props.width) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  }
  
  if (props.height) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }
  
  if (props.borderRadius) {
    style.borderRadius = typeof props.borderRadius === 'number' ? `${props.borderRadius}px` : props.borderRadius
  }
  
  return style
})

// 事件处理
const handleLoad = (event: Event) => {
  loading.value = false
  error.value = false
  emit('load', event)
}

const handleError = (event: Event) => {
  loading.value = false
  error.value = true
  emit('error', event)
}

// 监听src变化，重置状态
watch(() => props.src, () => {
  if (props.src) {
    loading.value = true
    error.value = false
  }
}, { immediate: true })
</script>

<style scoped>
.mobile-image {
  position: relative;
  display: inline-block;
  overflow: hidden;
}

.mobile-image__img {
  display: block;
  width: 100%;
  height: 100%;
}

.mobile-image__img--fill {
  object-fit: fill;
}

.mobile-image__img--contain {
  object-fit: contain;
}

.mobile-image__img--cover {
  object-fit: cover;
}

.mobile-image__img--none {
  object-fit: none;
}

.mobile-image__img--scale-down {
  object-fit: scale-down;
}

.mobile-image__loading,
.mobile-image__error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  color: #909399;
}

.mobile-image__spinner {
  animation: spin 1s linear infinite;
}

.mobile-image__spinner svg {
  display: block;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.mobile-image__error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.mobile-image__error-text {
  font-size: 12px;
  color: #909399;
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .mobile-image__loading,
  .mobile-image__error {
    background-color: #2a2a2a;
    color: #999999;
  }
  
  .mobile-image__error-text {
    color: #999999;
  }
}
</style>
