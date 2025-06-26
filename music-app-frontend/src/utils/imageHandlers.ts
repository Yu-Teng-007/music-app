/**
 * 图片处理工具函数
 * 集中处理应用中的图片相关逻辑，避免重复代码
 */

// 默认占位图片
const DEFAULT_COVER = '/images/default-cover.jpg'
const DEFAULT_AVATAR = '/images/default-avatar.jpg'
const DEFAULT_BACKGROUND = '/images/default-background.jpg'

/**
 * 处理图片加载错误
 * @param event 错误事件
 * @param type 图片类型，用于选择合适的默认图片
 */
export function handleImageError(
  event: Event,
  type: 'cover' | 'avatar' | 'background' = 'cover'
): void {
  const img = event.target as HTMLImageElement

  switch (type) {
    case 'avatar':
      img.src = DEFAULT_AVATAR
      break
    case 'background':
      img.src = DEFAULT_BACKGROUND
      break
    case 'cover':
    default:
      img.src = DEFAULT_COVER
      break
  }

  // 添加错误类，可用于CSS样式调整
  img.classList.add('img-error')
}

/**
 * 创建一个带有错误处理的图片URL
 * @param url 原始图片URL
 * @param type 图片类型
 * @returns 处理后的URL，如果原始URL为空则返回默认图片
 */
export function getImageUrl(
  url: string | undefined | null,
  type: 'cover' | 'avatar' | 'background' = 'cover'
): string {
  if (!url) {
    switch (type) {
      case 'avatar':
        return DEFAULT_AVATAR
      case 'background':
        return DEFAULT_BACKGROUND
      case 'cover':
      default:
        return DEFAULT_COVER
    }
  }

  return url
}

/**
 * Vue指令：v-img-fallback
 * 用于在Vue组件中快速添加图片错误处理
 *
 * 使用方式：
 * <img :src="song.coverUrl" v-img-fallback="'cover'" alt="专辑封面" />
 */
export const imgFallbackDirective = {
  mounted(el: HTMLImageElement, binding: { value: 'cover' | 'avatar' | 'background' }) {
    const type = binding.value || 'cover'

    el.addEventListener('error', event => {
      handleImageError(event, type)
    })

    // 如果src为空，直接设置默认图片
    if (!el.src) {
      switch (type) {
        case 'avatar':
          el.src = DEFAULT_AVATAR
          break
        case 'background':
          el.src = DEFAULT_BACKGROUND
          break
        case 'cover':
        default:
          el.src = DEFAULT_COVER
          break
      }
    }
  },
}
