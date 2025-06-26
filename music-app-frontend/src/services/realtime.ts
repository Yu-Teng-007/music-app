import { io, Socket } from 'socket.io-client'
import { ref } from 'vue'

// 实时通信事件类型
export interface RealtimeEvent {
  type: string
  data: any
}

// 实时通信服务
export const realtimeService = {
  socket: null as Socket | null,
  isConnected: ref(false),
  listeners: new Map<string, Set<(data: any) => void>>(),

  // 连接WebSocket服务器
  connect(token: string, apiUrl: string) {
    if (this.socket) {
      this.disconnect()
    }

    // 从API URL中提取基础URL
    const baseUrl = apiUrl.replace(/\/api\/?$/, '')

    this.socket = io(baseUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    this.socket.on('connect', () => {
      this.isConnected.value = true
      console.log('WebSocket连接已建立')
    })

    this.socket.on('disconnect', () => {
      this.isConnected.value = false
      console.log('WebSocket连接已断开')
    })

    this.socket.on('connect_error', error => {
      console.error('WebSocket连接错误:', error)
    })

    // 重新绑定所有事件监听器
    this.rebindListeners()

    return this.socket
  },

  // 断开WebSocket连接
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected.value = false
    }
  },

  // 添加事件监听器
  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }

    this.listeners.get(event)!.add(callback)

    // 如果已连接，立即绑定
    if (this.socket) {
      this.socket.on(event, callback)
    }

    // 返回取消订阅函数
    return () => this.off(event, callback)
  },

  // 移除事件监听器
  off(event: string, callback: (data: any) => void) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.delete(callback)

      if (this.socket) {
        this.socket.off(event, callback)
      }

      if (callbacks.size === 0) {
        this.listeners.delete(event)
      }
    }
  },

  // 发送事件
  emit(event: string, data: any) {
    if (this.socket && this.isConnected.value) {
      this.socket.emit(event, data)
      return true
    }
    return false
  },

  // 加入房间
  joinRoom(room: string) {
    return this.emit('join:room', { room })
  },

  // 离开房间
  leaveRoom(room: string) {
    return this.emit('leave:room', { room })
  },

  // 发送私信
  sendMessage(to: string, content: string) {
    return this.emit('message', { to, content })
  },

  // 社交功能相关的便捷方法

  // 监听新动态
  onNewFeed(callback: (data: any) => void) {
    this.on('new_feed', callback)
  },

  // 监听动态更新
  onFeedUpdate(callback: (data: any) => void) {
    this.on('feed_update', callback)
  },

  // 监听点赞通知
  onFeedLiked(callback: (data: any) => void) {
    this.on('feed_liked', callback)
  },

  // 监听新关注者
  onNewFollower(callback: (data: any) => void) {
    this.on('new_follower', callback)
  },

  // 监听新评论
  onNewComment(callback: (data: any) => void) {
    this.on('new_comment', callback)
  },

  // 取消监听社交事件
  offSocialEvents() {
    this.off('new_feed')
    this.off('feed_update')
    this.off('feed_liked')
    this.off('new_follower')
    this.off('new_comment')
  },

  // 重新绑定所有事件监听器
  rebindListeners() {
    if (!this.socket) return

    for (const [event, callbacks] of this.listeners.entries()) {
      for (const callback of callbacks) {
        this.socket.on(event, callback)
      }
    }
  },
}
