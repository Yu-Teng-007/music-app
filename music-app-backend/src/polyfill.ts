// 为较老版本的Node.js提供crypto.randomUUID兼容
import * as crypto from 'crypto'

// 如果crypto没有randomUUID方法，则添加一个polyfill
if (!crypto.randomUUID) {
  ;(crypto as any).randomUUID = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }
}

// 确保全局有crypto对象
;(global as any).crypto = crypto

export default crypto
