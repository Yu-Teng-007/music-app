/**
 * 网络状态检测工具
 * 用于检测后端服务是否可用
 */

import { apiClient } from '@/services/http'

// 网络状态
export interface NetworkStatus {
  isOnline: boolean
  backendAvailable: boolean
  lastChecked: Date
}

// 全局网络状态
let networkStatus: NetworkStatus = {
  isOnline: navigator.onLine,
  backendAvailable: false,
  lastChecked: new Date()
}

// 网络状态变化回调
type NetworkStatusCallback = (status: NetworkStatus) => void
const statusCallbacks: NetworkStatusCallback[] = []

/**
 * 检查后端服务是否可用
 */
export const checkBackendStatus = async (): Promise<boolean> => {
  try {
    // 发送一个简单的健康检查请求
    const response = await apiClient.get('/health', { timeout: 3000 })
    return response.status === 200
  } catch (error) {
    console.warn('后端服务不可用:', error)
    return false
  }
}

/**
 * 更新网络状态
 */
const updateNetworkStatus = async () => {
  const isOnline = navigator.onLine
  const backendAvailable = isOnline ? await checkBackendStatus() : false
  
  networkStatus = {
    isOnline,
    backendAvailable,
    lastChecked: new Date()
  }

  // 通知所有监听器
  statusCallbacks.forEach(callback => callback(networkStatus))
}

/**
 * 获取当前网络状态
 */
export const getNetworkStatus = (): NetworkStatus => {
  return { ...networkStatus }
}

/**
 * 监听网络状态变化
 */
export const onNetworkStatusChange = (callback: NetworkStatusCallback): (() => void) => {
  statusCallbacks.push(callback)
  
  // 返回取消监听的函数
  return () => {
    const index = statusCallbacks.indexOf(callback)
    if (index > -1) {
      statusCallbacks.splice(index, 1)
    }
  }
}

/**
 * 初始化网络状态监听
 */
export const initNetworkStatusMonitor = () => {
  // 监听浏览器网络状态变化
  window.addEventListener('online', updateNetworkStatus)
  window.addEventListener('offline', updateNetworkStatus)

  // 初始检查
  updateNetworkStatus()

  // 定期检查后端状态（每30秒）
  const intervalId = setInterval(updateNetworkStatus, 30000)

  // 返回清理函数
  return () => {
    window.removeEventListener('online', updateNetworkStatus)
    window.removeEventListener('offline', updateNetworkStatus)
    clearInterval(intervalId)
  }
}

/**
 * 显示网络状态提示
 */
export const showNetworkStatusNotification = (status: NetworkStatus) => {
  if (!status.isOnline) {
    console.warn('网络连接已断开')
    // 可以在这里显示用户友好的提示
  } else if (!status.backendAvailable) {
    console.warn('后端服务不可用，某些功能可能无法正常使用')
    // 可以在这里显示用户友好的提示
  }
}
