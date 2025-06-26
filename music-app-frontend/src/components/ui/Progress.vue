<template>
  <div class="mobile-progress" :class="progressClass">
    <div class="mobile-progress__bar" :style="barStyle">
      <div 
        class="mobile-progress__fill" 
        :style="fillStyle"
      >
        <div v-if="showStripe" class="mobile-progress__stripe"></div>
      </div>
    </div>
    
    <!-- 进度文本 -->
    <div v-if="showText" class="mobile-progress__text">
      <slot name="text" :percentage="percentage">
        {{ percentage }}%
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  percentage?: number
  color?: string | string[]
  strokeWidth?: number
  showText?: boolean
  textInside?: boolean
  status?: 'success' | 'exception' | 'warning' | ''
  striped?: boolean
  stripedFlow?: boolean
  duration?: number
  indeterminate?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  percentage: 0,
  color: '#409eff',
  strokeWidth: 6,
  showText: false,
  textInside: false,
  status: '',
  striped: false,
  stripedFlow: false,
  duration: 3,
  indeterminate: false
})

// 计算进度条类名
const progressClass = computed(() => {
  const classes = []
  
  if (props.textInside) {
    classes.push('mobile-progress--text-inside')
  }
  
  if (props.status) {
    classes.push(`mobile-progress--${props.status}`)
  }
  
  if (props.indeterminate) {
    classes.push('mobile-progress--indeterminate')
  }
  
  return classes
})

// 计算进度条样式
const barStyle = computed(() => {
  return {
    height: `${props.strokeWidth}px`,
    borderRadius: `${props.strokeWidth / 2}px`
  }
})

// 计算填充样式
const fillStyle = computed(() => {
  const style: Record<string, string> = {
    width: props.indeterminate ? '100%' : `${Math.max(0, Math.min(100, props.percentage))}%`,
    borderRadius: `${props.strokeWidth / 2}px`,
    transition: props.indeterminate ? 'none' : `width ${props.duration}s ease, background-color 0.3s ease`
  }
  
  // 处理颜色
  if (props.status) {
    // 状态颜色优先级更高
    const statusColors = {
      success: '#67c23a',
      exception: '#f56c6c',
      warning: '#e6a23c'
    }
    style.backgroundColor = statusColors[props.status]
  } else if (Array.isArray(props.color)) {
    // 渐变色
    const gradientStops = props.color.map((color, index) => {
      const position = (index / (props.color.length - 1)) * 100
      return `${color} ${position}%`
    }).join(', ')
    style.background = `linear-gradient(to right, ${gradientStops})`
  } else {
    // 单色
    style.backgroundColor = props.color
  }
  
  return style
})

// 是否显示条纹
const showStripe = computed(() => {
  return props.striped || props.stripedFlow
})
</script>

<style scoped>
.mobile-progress {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.mobile-progress--text-inside {
  flex-direction: column;
  gap: 4px;
}

.mobile-progress__bar {
  flex: 1;
  background-color: #e4e7ed;
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}

.mobile-progress__fill {
  height: 100%;
  border-radius: inherit;
  position: relative;
  overflow: hidden;
}

.mobile-progress__stripe {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  );
  background-size: 16px 16px;
}

.mobile-progress--indeterminate .mobile-progress__fill {
  animation: indeterminate 2s infinite linear;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
}

.mobile-progress__text {
  font-size: 12px;
  color: #606266;
  white-space: nowrap;
  flex-shrink: 0;
}

.mobile-progress--text-inside .mobile-progress__text {
  align-self: flex-start;
}

/* 状态样式 */
.mobile-progress--success .mobile-progress__text {
  color: #67c23a;
}

.mobile-progress--exception .mobile-progress__text {
  color: #f56c6c;
}

.mobile-progress--warning .mobile-progress__text {
  color: #e6a23c;
}

/* 条纹动画 */
.mobile-progress__stripe {
  animation: stripe-flow 1s linear infinite;
}

@keyframes stripe-flow {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 16px 0;
  }
}

@keyframes indeterminate {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .mobile-progress__bar {
    background-color: #3a3a3a;
  }
  
  .mobile-progress__text {
    color: #999999;
  }
  
  .mobile-progress--success .mobile-progress__text {
    color: #67c23a;
  }
  
  .mobile-progress--exception .mobile-progress__text {
    color: #f56c6c;
  }
  
  .mobile-progress--warning .mobile-progress__text {
    color: #e6a23c;
  }
}
</style>
