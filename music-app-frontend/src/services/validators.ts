// 表单验证工具函数

// 邮箱验证
export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) return '邮箱不能为空'
  if (!emailRegex.test(email)) return '请输入有效的邮箱地址'
  return null
}

// 密码验证
export const validatePassword = (password: string): string | null => {
  if (!password) return '密码不能为空'
  if (password.length < 6) return '密码长度至少6位'
  if (password.length > 50) return '密码长度不能超过50位'
  return null
}

// 姓名验证
export const validateName = (name: string): string | null => {
  if (!name) return '姓名不能为空'
  if (name.length < 2) return '姓名长度至少2位'
  if (name.length > 20) return '姓名长度不能超过20位'
  return null
}

// 确认密码验证
export const validateConfirmPassword = (
  password: string,
  confirmPassword: string
): string | null => {
  if (!confirmPassword) return '确认密码不能为空'
  if (password !== confirmPassword) return '两次输入的密码不一致'
  return null
}

// 用户名验证
export const validateUsername = (username: string): string | null => {
  if (!username) return '用户名不能为空'
  if (username.length < 3) return '用户名长度至少3位'
  if (username.length > 20) return '用户名长度不能超过20位'
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return '用户名只能包含字母、数字和下划线'
  return null
}

// 手机号验证
export const validatePhone = (phone: string): string | null => {
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phone) return '手机号不能为空'
  if (!phoneRegex.test(phone)) return '请输入有效的手机号'
  return null
}

// 播放列表名称验证
export const validatePlaylistName = (name: string): string | null => {
  if (!name) return '播放列表名称不能为空'
  if (name.length < 1) return '播放列表名称不能为空'
  if (name.length > 50) return '播放列表名称不能超过50位'
  return null
}

// 播放列表描述验证
export const validatePlaylistDescription = (description: string): string | null => {
  if (description && description.length > 200) return '播放列表描述不能超过200位'
  return null
}

// 文件大小验证（单位：MB）
export const validateFileSize = (file: File, maxSizeMB: number): string | null => {
  const fileSizeMB = file.size / (1024 * 1024)
  if (fileSizeMB > maxSizeMB) return `文件大小不能超过${maxSizeMB}MB`
  return null
}

// 文件类型验证
export const validateFileType = (file: File, allowedTypes: string[]): string | null => {
  if (!allowedTypes.includes(file.type)) {
    return `不支持的文件类型，支持的类型：${allowedTypes.join(', ')}`
  }
  return null
}

// 音频文件验证
export const validateAudioFile = (file: File): string | null => {
  const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/flac', 'audio/ogg']
  const maxSizeMB = 50 // 50MB

  const typeError = validateFileType(file, allowedTypes)
  if (typeError) return typeError

  const sizeError = validateFileSize(file, maxSizeMB)
  if (sizeError) return sizeError

  return null
}

// 图片文件验证
export const validateImageFile = (file: File): string | null => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  const maxSizeMB = 5 // 5MB

  const typeError = validateFileType(file, allowedTypes)
  if (typeError) return typeError

  const sizeError = validateFileSize(file, maxSizeMB)
  if (sizeError) return sizeError

  return null
}
