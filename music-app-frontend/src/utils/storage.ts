/**
 * 本地存储工具函数
 * 用于管理应用的本地存储状态
 */

// 存储键名常量
const STORAGE_KEYS = {
  FIRST_LAUNCH: 'music_app_first_launch',
  ONBOARDING_COMPLETED: 'music_app_onboarding_completed',
} as const

/**
 * 检查是否为首次启动应用
 * @returns {boolean} 如果是首次启动返回true，否则返回false
 */
export const isFirstLaunch = (): boolean => {
  try {
    const hasLaunched = localStorage.getItem(STORAGE_KEYS.FIRST_LAUNCH)
    const onboardingCompleted = localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED)
    
    // 如果从未启动过或者引导未完成，则认为是首次启动
    return !hasLaunched || !onboardingCompleted
  } catch (error) {
    console.error('检查首次启动状态失败:', error)
    // 如果localStorage不可用，默认认为是首次启动
    return true
  }
}

/**
 * 标记首次启动引导已完成
 */
export const setFirstLaunchCompleted = (): void => {
  try {
    const timestamp = new Date().toISOString()
    localStorage.setItem(STORAGE_KEYS.FIRST_LAUNCH, timestamp)
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true')
  } catch (error) {
    console.error('保存首次启动完成状态失败:', error)
  }
}

/**
 * 清除首次启动标记（用于测试或重置）
 */
export const clearFirstLaunchFlag = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.FIRST_LAUNCH)
    localStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED)
  } catch (error) {
    console.error('清除首次启动标记失败:', error)
  }
}

/**
 * 获取应用首次启动时间
 * @returns {string | null} 首次启动时间的ISO字符串，如果未记录则返回null
 */
export const getFirstLaunchTime = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.FIRST_LAUNCH)
  } catch (error) {
    console.error('获取首次启动时间失败:', error)
    return null
  }
}

/**
 * 检查引导是否已完成
 * @returns {boolean} 如果引导已完成返回true，否则返回false
 */
export const isOnboardingCompleted = (): boolean => {
  try {
    const completed = localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED)
    return completed === 'true'
  } catch (error) {
    console.error('检查引导完成状态失败:', error)
    return false
  }
}
