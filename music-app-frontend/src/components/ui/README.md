# 移动端原生UI组件库

这个目录包含了专为移动端优化的原生DOM组件，替代了Element Plus组件，提供更好的性能和触摸体验。

## 新增组件

### MobileImage - 图片组件

替代 `el-image`，提供图片加载、错误处理和懒加载功能。

```vue
<template>
  <!-- 基础用法 -->
  <MobileImage src="/path/to/image.jpg" alt="图片描述" fit="cover" width="100" height="100" />

  <!-- 自定义错误状态 -->
  <MobileImage src="/invalid-image.jpg">
    <template #error>
      <MobileIcon name="image" :size="24" />
    </template>
  </MobileImage>

  <!-- 自定义加载状态 -->
  <MobileImage src="/large-image.jpg">
    <template #loading>
      <MobileIcon name="loader" :size="24" spin />
    </template>
  </MobileImage>
</template>
```

**Props:**

- `src` - 图片地址
- `alt` - 图片描述
- `fit` - 图片适应方式：'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
- `lazy` - 是否懒加载
- `errorText` - 错误提示文本
- `width/height` - 尺寸
- `borderRadius` - 圆角

**Events:**

- `@load` - 图片加载成功
- `@error` - 图片加载失败

### MobileProgress - 进度条组件

替代 `el-progress`，提供进度显示功能。

```vue
<template>
  <!-- 基础进度条 -->
  <MobileProgress :percentage="50" />

  <!-- 带文本的进度条 -->
  <MobileProgress :percentage="75" show-text color="#67c23a" />

  <!-- 渐变色进度条 -->
  <MobileProgress :percentage="60" :color="['#ff6b6b', '#4ecdc4', '#45b7d1']" />

  <!-- 状态进度条 -->
  <MobileProgress :percentage="100" status="success" show-text />

  <!-- 条纹进度条 -->
  <MobileProgress :percentage="40" striped striped-flow />

  <!-- 不确定进度条 -->
  <MobileProgress indeterminate />
</template>
```

**Props:**

- `percentage` - 进度百分比 (0-100)
- `color` - 进度条颜色，支持字符串或渐变数组
- `strokeWidth` - 进度条高度
- `showText` - 是否显示文本
- `textInside` - 文本是否在进度条内部
- `status` - 状态：'success' | 'exception' | 'warning'
- `striped` - 是否显示条纹
- `stripedFlow` - 条纹是否流动
- `indeterminate` - 不确定进度模式

### MobileIcon - 图标组件

替代 `el-icon-*`，提供SVG图标。

```vue
<template>
  <!-- 基础图标 -->
  <MobileIcon name="play" />

  <!-- 自定义大小和颜色 -->
  <MobileIcon name="heart" :size="32" color="#ff6b6b" />

  <!-- 可点击图标 -->
  <MobileIcon name="share" clickable @click="handleShare" />

  <!-- 旋转图标 -->
  <MobileIcon name="loader" spin />
</template>
```

**Props:**

- `name` - 图标名称
- `size` - 图标大小
- `color` - 图标颜色
- `strokeWidth` - 线条宽度
- `spin` - 是否旋转
- `clickable` - 是否可点击

**Events:**

- `@click` - 点击事件（需要设置 clickable）

**可用图标:**

- 媒体: `headset`, `play`, `pause`, `stop`, `skip-forward`, `skip-back`, `volume-2`, `volume-1`, `volume-x`
- 操作: `refresh-cw`, `download`, `trash-2`, `heart`, `share`
- 状态: `alert-triangle`, `check`, `check-circle`, `x-circle`, `info`
- 导航: `chevron-left`, `chevron-right`, `chevron-up`, `chevron-down`, `x`
- 其他: `loader`, `image`

## 使用示例

在 DownloadCard.vue 中的使用：

```vue
<script setup lang="ts">
import { MobileImage, MobileProgress, MobileIcon } from '@/components/ui'
</script>

<template>
  <!-- 歌曲封面 -->
  <MobileImage
    :src="song.coverUrl"
    :alt="song.title"
    fit="cover"
    width="60"
    height="60"
    border-radius="8"
  >
    <template #error>
      <MobileIcon name="headset" :size="24" />
    </template>
  </MobileImage>

  <!-- 下载进度 -->
  <MobileProgress
    :percentage="download.progress"
    :color="getProgressColor(download.status)"
    :stroke-width="6"
  />

  <!-- 错误图标 -->
  <MobileIcon name="alert-triangle" :size="16" />
</template>
```

## 特性

- 🚀 **高性能**: 原生DOM实现，无额外依赖
- 📱 **移动优化**: 专为触摸交互设计
- 🎨 **主题适配**: 支持暗色主题
- 🔧 **TypeScript**: 完整的类型支持
- ♿ **无障碍**: 遵循无障碍设计规范
- 🎯 **轻量级**: 最小化包体积
