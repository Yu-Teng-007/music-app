<template>
  <div class="mobile-empty">
    <div class="mobile-empty__image">
      <slot name="image">
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="8" y="16" width="48" height="32" rx="4" stroke="#E5E7EB" stroke-width="2" fill="none"/>
          <circle cx="20" cy="28" r="4" fill="#E5E7EB"/>
          <path d="M8 40L20 28L32 40L44 28L56 40" stroke="#E5E7EB" stroke-width="2" fill="none"/>
        </svg>
      </slot>
    </div>
    
    <div class="mobile-empty__description">
      <slot>{{ description }}</slot>
    </div>
    
    <div v-if="$slots.default" class="mobile-empty__bottom">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  description?: string
}

withDefaults(defineProps<Props>(), {
  description: '暂无数据'
})

defineSlots<{
  default(): any
  image(): any
}>()
</script>

<style scoped>
.mobile-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.mobile-empty__image {
  margin-bottom: 16px;
  opacity: 0.6;
}

.mobile-empty__description {
  color: #909399;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
}

.mobile-empty__bottom {
  margin-top: 8px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .mobile-empty {
    padding: 60px 20px;
  }
  
  .mobile-empty__description {
    font-size: 16px;
  }
}
</style>
