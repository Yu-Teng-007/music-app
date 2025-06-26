/**
 * 格式化工具函数
 * 集中处理应用中的各种格式化逻辑，避免重复代码
 */

/**
 * 将秒数格式化为 MM:SS 格式的时间字符串
 * @param seconds 秒数
 * @returns 格式化后的时间字符串，例如 "3:45"
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00'

  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * 格式化日期时间
 * @param dateString 日期字符串
 * @param format 格式化选项 'relative' | 'full' | 'date' | 'time'
 * @returns 格式化后的日期时间字符串
 */
export function formatDate(
  dateString: string,
  format: 'relative' | 'full' | 'date' | 'time' = 'full'
): string {
  const date = new Date(dateString)

  if (isNaN(date.getTime())) {
    return '无效日期'
  }

  // 相对时间（例如：3小时前）
  if (format === 'relative') {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSecs < 60) return '刚刚'
    if (diffMins < 60) return `${diffMins}分钟前`
    if (diffHours < 24) return `${diffHours}小时前`
    if (diffDays < 30) return `${diffDays}天前`

    // 超过30天显示完整日期
    return date.toLocaleDateString('zh-CN')
  }

  // 完整日期时间
  if (format === 'full') {
    return date.toLocaleString('zh-CN')
  }

  // 仅日期
  if (format === 'date') {
    return date.toLocaleDateString('zh-CN')
  }

  // 仅时间
  if (format === 'time') {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  return date.toLocaleString('zh-CN')
}

/**
 * 格式化播放次数
 * @param count 播放次数
 * @returns 格式化后的播放次数字符串，例如 "1.2万"
 */
export function formatPlayCount(count: number): string {
  if (isNaN(count) || count < 0) return '0'

  if (count < 10000) {
    return count.toString()
  } else if (count < 100000000) {
    return (count / 10000).toFixed(1) + '万'
  } else {
    return (count / 100000000).toFixed(1) + '亿'
  }
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小字符串，例如 "1.5 MB"
 */
export function formatFileSize(bytes: number): string {
  if (isNaN(bytes) || bytes < 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}
