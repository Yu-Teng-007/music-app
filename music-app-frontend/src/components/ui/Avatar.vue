<template>
  <div :class="avatarClasses" :style="avatarStyle">
    <img
      v-if="src && !imageError"
      :src="src"
      :alt="alt"
      @error="handleImageError"
      @load="handleImageLoad"
    />
    <span v-else-if="$slots.default" class="mobile-avatar__text">
      <slot></slot>
    </span>
    <svg
      v-else
      class="mobile-avatar__icon"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  size?: number | 'large' | 'default' | 'small'
  shape?: 'circle' | 'square'
  src?: string
  alt?: string
  fit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'default',
  shape: 'circle',
  alt: '',
  fit: 'cover'
})

const imageError = ref(false)

const sizeMap = {
  large: 48,
  default: 40,
  small: 32
}

const avatarSize = computed(() => {
  if (typeof props.size === 'number') {
    return props.size
  }
  return sizeMap[props.size]
})

const avatarClasses = computed(() => [
  'mobile-avatar',
  `mobile-avatar--${props.shape}`,
  {
    'mobile-avatar--image': props.src && !imageError.value
  }
])

const avatarStyle = computed(() => ({
  width: `${avatarSize.value}px`,
  height: `${avatarSize.value}px`,
  fontSize: `${avatarSize.value * 0.4}px`
}))

const handleImageError = () => {
  imageError.value = true
}

const handleImageLoad = () => {
  imageError.value = false
}
</script>

<style scoped>
.mobile-avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  color: #909399;
  font-weight: 500;
  overflow: hidden;
  user-select: none;
  vertical-align: middle;
}

.mobile-avatar--circle {
  border-radius: 50%;
}

.mobile-avatar--square {
  border-radius: 6px;
}

.mobile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: v-bind(fit);
  display: block;
}

.mobile-avatar__text {
  line-height: 1;
  text-transform: uppercase;
}

.mobile-avatar__icon {
  width: 60%;
  height: 60%;
}

/* 图片加载状态 */
.mobile-avatar--image {
  background-color: transparent;
}

/* 不同尺寸的字体调整 */
.mobile-avatar[style*="width: 32px"] {
  font-size: 12px;
}

.mobile-avatar[style*="width: 40px"] {
  font-size: 16px;
}

.mobile-avatar[style*="width: 48px"] {
  font-size: 18px;
}
</style>
