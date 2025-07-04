// 统一导出所有工具函数

// 表单验证工具
export {
  validatePassword,
  validateConfirmPassword,
  validateUsername,
  validatePhone,
  validatePlaylistName,
  validatePlaylistDescription,
  validateFileSize,
  validateFileType,
  validateAudioFile,
  validateImageFile,
} from './validators'

// 本地存储工具
export {
  isFirstLaunch,
  setFirstLaunchCompleted,
  clearFirstLaunchFlag,
  getFirstLaunchTime,
  isOnboardingCompleted,
} from './storage'
