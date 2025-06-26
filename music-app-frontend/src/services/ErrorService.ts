import { ref } from 'vue'

/**
 * 错误类型定义
 */
export interface AppError {
  id: string
  code: string
  message: string
  details?: any
  timestamp: number
  dismissed: boolean
}

/**
 * 错误处理服务
 * 提供统一的错误处理机制，包括错误记录、显示和上报
 */
class ErrorService {
  // 错误列表
  private errors = ref<AppError[]>([])

  // 错误处理回调
  private errorHandlers: ((error: AppError) => void)[] = []

  /**
   * 处理API错误
   * @param error 错误对象
   * @param context 错误上下文
   * @returns 格式化后的错误对象
   */
  handleApiError(error: any, context: string = 'api'): AppError {
    // 提取错误信息
    const errorMessage = this.extractErrorMessage(error)
    const errorCode = this.extractErrorCode(error)

    // 创建标准错误对象
    const appError: AppError = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      code: errorCode,
      message: errorMessage,
      details: error,
      timestamp: Date.now(),
      dismissed: false,
    }

    // 记录错误
    this.logError(appError, context)

    // 添加到错误列表
    this.errors.value.push(appError)

    // 通知错误处理器
    this.notifyErrorHandlers(appError)

    return appError
  }

  /**
   * 处理通用错误
   * @param message 错误消息
   * @param code 错误代码
   * @param details 错误详情
   * @returns 格式化后的错误对象
   */
  handleError(message: string, code: string = 'ERROR', details?: any): AppError {
    const appError: AppError = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      code,
      message,
      details,
      timestamp: Date.now(),
      dismissed: false,
    }

    // 记录错误
    this.logError(appError)

    // 添加到错误列表
    this.errors.value.push(appError)

    // 通知错误处理器
    this.notifyErrorHandlers(appError)

    return appError
  }

  /**
   * 从错误对象中提取错误消息
   * @param error 错误对象
   * @returns 错误消息
   */
  private extractErrorMessage(error: any): string {
    if (!error) return '未知错误'

    // 处理不同类型的错误对象
    if (typeof error === 'string') return error

    if (error.response && error.response.data) {
      const responseData = error.response.data
      if (responseData.message) return responseData.message
      if (responseData.error) return responseData.error
      if (typeof responseData === 'string') return responseData
    }

    if (error.message) return error.message

    return '服务器错误'
  }

  /**
   * 从错误对象中提取错误代码
   * @param error 错误对象
   * @returns 错误代码
   */
  private extractErrorCode(error: any): string {
    if (!error) return 'UNKNOWN_ERROR'

    if (error.response && error.response.status) {
      return `HTTP_${error.response.status}`
    }

    if (error.code) return error.code

    return 'APP_ERROR'
  }

  /**
   * 记录错误
   * @param error 错误对象
   * @param context 错误上下文
   */
  private logError(error: AppError, context: string = 'app'): void {
    console.error(`[${context}] ${error.code}: ${error.message}`, error.details)

    // 可以在这里添加错误上报逻辑
    // this.reportErrorToServer(error)
  }

  /**
   * 通知所有错误处理器
   * @param error 错误对象
   */
  private notifyErrorHandlers(error: AppError): void {
    this.errorHandlers.forEach(handler => {
      try {
        handler(error)
      } catch (e) {
        console.error('Error handler failed', e)
      }
    })
  }

  /**
   * 注册错误处理回调
   * @param handler 错误处理回调函数
   * @returns 取消注册的函数
   */
  onError(handler: (error: AppError) => void): () => void {
    this.errorHandlers.push(handler)

    // 返回取消注册的函数
    return () => {
      const index = this.errorHandlers.indexOf(handler)
      if (index !== -1) {
        this.errorHandlers.splice(index, 1)
      }
    }
  }

  /**
   * 获取所有未处理的错误
   * @returns 错误列表
   */
  getErrors(): AppError[] {
    return this.errors.value.filter(error => !error.dismissed)
  }

  /**
   * 标记错误为已处理
   * @param errorId 错误ID
   */
  dismissError(errorId: string): void {
    const error = this.errors.value.find(e => e.id === errorId)
    if (error) {
      error.dismissed = true
    }
  }

  /**
   * 清除所有错误
   */
  clearErrors(): void {
    this.errors.value = []
  }
}

// 创建单例实例
const errorService = new ErrorService()
export default errorService
