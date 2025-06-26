<template>
  <svg
    :class="iconClass"
    :style="iconStyle"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    @click="handleClick"
  >
    <component :is="iconComponent" />
  </svg>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue'

interface Props {
  name: string
  size?: string | number
  color?: string
  strokeWidth?: number
  spin?: boolean
  clickable?: boolean
}

interface Emits {
  (e: 'click', event: MouseEvent): void
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
  strokeWidth: 2,
  spin: false,
  clickable: false,
})

const emit = defineEmits<Emits>()

// 图标映射
const iconMap: Record<string, () => any> = {
  // 媒体图标
  headset: () => [
    h('path', { d: 'M3 18v-6a9 9 0 0 1 18 0v6' }),
    h('path', {
      d: 'M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z',
    }),
  ],
  play: () => [h('polygon', { points: '5,3 19,12 5,21' })],
  pause: () => [
    h('rect', { x: '6', y: '4', width: '4', height: '16' }),
    h('rect', { x: '14', y: '4', width: '4', height: '16' }),
  ],
  stop: () => [h('rect', { x: '6', y: '6', width: '12', height: '12' })],
  'skip-forward': () => [
    h('polygon', { points: '5,4 15,12 5,20' }),
    h('line', { x1: '19', y1: '5', x2: '19', y2: '19' }),
  ],
  'skip-back': () => [
    h('polygon', { points: '19,20 9,12 19,4' }),
    h('line', { x1: '5', y1: '19', x2: '5', y2: '5' }),
  ],
  'volume-2': () => [
    h('polygon', { points: '11,5 6,9 2,9 2,15 6,15 11,19' }),
    h('path', { d: 'm15.54 8.46a5 5 0 0 1 0 7.07' }),
    h('path', { d: 'm19.07 4.93a10 10 0 0 1 0 14.14' }),
  ],
  'volume-1': () => [
    h('polygon', { points: '11,5 6,9 2,9 2,15 6,15 11,19' }),
    h('path', { d: 'm15.54 8.46a5 5 0 0 1 0 7.07' }),
  ],
  'volume-x': () => [
    h('polygon', { points: '11,5 6,9 2,9 2,15 6,15 11,19' }),
    h('line', { x1: '23', y1: '9', x2: '17', y2: '15' }),
    h('line', { x1: '17', y1: '9', x2: '23', y2: '15' }),
  ],

  // 操作图标
  'refresh-cw': () => [
    h('polyline', { points: '23,4 23,10 17,10' }),
    h('path', { d: 'M20.49 15a9 9 0 1 1-2.12-9.36L23 10' }),
  ],
  download: () => [
    h('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
    h('polyline', { points: '7,10 12,15 17,10' }),
    h('line', { x1: '12', y1: '15', x2: '12', y2: '3' }),
  ],
  'trash-2': () => [
    h('polyline', { points: '3,6 5,6 21,6' }),
    h('path', {
      d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
    }),
  ],
  heart: () => [
    h('path', {
      d: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
    }),
  ],
  share: () => [
    h('path', { d: 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8' }),
    h('polyline', { points: '16,6 12,2 8,6' }),
    h('line', { x1: '12', y1: '2', x2: '12', y2: '15' }),
  ],

  // 状态图标
  'alert-triangle': () => [
    h('path', {
      d: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z',
    }),
    h('line', { x1: '12', y1: '9', x2: '12', y2: '13' }),
    h('line', { x1: '12', y1: '17', x2: '12.01', y2: '17' }),
  ],
  check: () => [h('polyline', { points: '20,6 9,17 4,12' })],
  'check-circle': () => [
    h('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }),
    h('polyline', { points: '22,4 12,14.01 9,11.01' }),
  ],
  'x-circle': () => [
    h('circle', { cx: '12', cy: '12', r: '10' }),
    h('line', { x1: '15', y1: '9', x2: '9', y2: '15' }),
    h('line', { x1: '9', y1: '9', x2: '15', y2: '15' }),
  ],
  info: () => [
    h('circle', { cx: '12', cy: '12', r: '10' }),
    h('line', { x1: '12', y1: '16', x2: '12', y2: '12' }),
    h('line', { x1: '12', y1: '8', x2: '12.01', y2: '8' }),
  ],

  // 导航图标
  'chevron-left': () => [h('polyline', { points: '15,18 9,12 15,6' })],
  'chevron-right': () => [h('polyline', { points: '9,18 15,12 9,6' })],
  'chevron-up': () => [h('polyline', { points: '18,15 12,9 6,15' })],
  'chevron-down': () => [h('polyline', { points: '6,9 12,15 18,9' })],
  x: () => [
    h('line', { x1: '18', y1: '6', x2: '6', y2: '18' }),
    h('line', { x1: '6', y1: '6', x2: '18', y2: '18' }),
  ],

  // 加载图标
  loader: () => [
    h('line', { x1: '12', y1: '2', x2: '12', y2: '6' }),
    h('line', { x1: '12', y1: '18', x2: '12', y2: '22' }),
    h('line', { x1: '4.93', y1: '4.93', x2: '7.76', y2: '7.76' }),
    h('line', { x1: '16.24', y1: '16.24', x2: '19.07', y2: '19.07' }),
    h('line', { x1: '2', y1: '12', x2: '6', y2: '12' }),
    h('line', { x1: '18', y1: '12', x2: '22', y2: '12' }),
    h('line', { x1: '4.93', y1: '19.07', x2: '7.76', y2: '16.24' }),
    h('line', { x1: '16.24', y1: '7.76', x2: '19.07', y2: '4.93' }),
  ],

  // 图片图标
  image: () => [
    h('rect', { x: '3', y: '3', width: '18', height: '18', rx: '2', ry: '2' }),
    h('circle', { cx: '9', cy: '9', r: '2' }),
    h('path', { d: 'm21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21' }),
  ],
}

// 计算图标组件
const iconComponent = computed(() => {
  const iconFn = iconMap[props.name]
  if (!iconFn) {
    console.warn(`Icon "${props.name}" not found`)
    return () => null
  }

  return defineComponent({
    render: iconFn,
  })
})

// 计算类名
const iconClass = computed(() => {
  const classes = ['mobile-icon']

  if (props.spin) {
    classes.push('mobile-icon--spin')
  }

  if (props.clickable) {
    classes.push('mobile-icon--clickable')
  }

  return classes
})

// 计算样式
const iconStyle = computed(() => {
  const style: Record<string, string> = {}

  if (props.color) {
    style.color = props.color
  }

  return style
})

// 点击处理
const handleClick = (event: MouseEvent) => {
  if (props.clickable) {
    emit('click', event)
  }
}
</script>

<style scoped>
.mobile-icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}

.mobile-icon--spin {
  animation: spin 1s linear infinite;
}

.mobile-icon--clickable {
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.mobile-icon--clickable:hover {
  opacity: 0.7;
}

.mobile-icon--clickable:active {
  opacity: 0.5;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
