<template>
  <div class="mobile-skeleton">
    <div v-if="avatar" class="mobile-skeleton__avatar" :style="avatarStyle"></div>
    
    <div class="mobile-skeleton__content">
      <div
        v-for="row in rows"
        :key="row"
        class="mobile-skeleton__row"
        :style="getRowStyle(row)"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  rows?: number
  avatar?: boolean
  avatarSize?: number
  animated?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  rows: 3,
  avatar: false,
  avatarSize: 40,
  animated: true,
  loading: true
})

const avatarStyle = computed(() => ({
  width: `${props.avatarSize}px`,
  height: `${props.avatarSize}px`
}))

const getRowStyle = (row: number) => {
  // 最后一行通常较短
  const width = row === props.rows ? '60%' : '100%'
  return { width }
}
</script>

<style scoped>
.mobile-skeleton {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 0;
}

.mobile-skeleton__avatar {
  border-radius: 50%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  flex-shrink: 0;
}

.mobile-skeleton__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mobile-skeleton__row {
  height: 16px;
  border-radius: 4px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 暗色主题支持 */
@media (prefers-color-scheme: dark) {
  .mobile-skeleton__avatar,
  .mobile-skeleton__row {
    background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
    background-size: 200% 100%;
  }
}
</style>
