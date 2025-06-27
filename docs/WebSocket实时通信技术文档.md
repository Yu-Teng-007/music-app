# 🔄 WebSocket实时通信技术文档

**技术栈**: Socket.IO + NestJS + Vue 3
**版本**: v1.0
**更新日期**: 2025-06-27

---

## 📋 WebSocket通信概览

WebSocket实时通信系统基于Socket.IO实现，提供双向实时数据传输能力。支持用户在线状态、实时通知、音乐同步播放等功能，确保用户获得流畅的实时交互体验。

### 🏗️ WebSocket架构设计

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端客户端    │    │  Socket.IO网关  │    │   业务处理层    │
│                 │    │                 │    │                 │
│ • Vue 3 Client  │◄──►│ • 连接管理      │◄──►│ • 事件处理器    │
│ • 事件监听      │    │ • 身份认证      │    │ • 业务逻辑      │
│ • 自动重连      │    │ • 房间管理      │    │ • 数据库操作    │
│ • 状态同步      │    │ • 消息路由      │    │ • 外部API调用   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   连接池管理    │    │   消息队列      │    │   监控告警      │
│                 │    │                 │    │                 │
│ • 连接状态      │    │ • Redis Pub/Sub │    │ • 连接监控      │
│ • 负载均衡      │    │ • 消息持久化    │    │ • 性能指标      │
│ • 故障转移      │    │ • 消息重试      │    │ • 异常告警      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🔧 服务端配置

### Socket.IO模块配置

```typescript
// src/realtime/realtime.module.ts
import { Module } from '@nestjs/common'
import { RealtimeGateway } from './realtime.gateway'
import { RealtimeService } from './realtime.service'
import { AuthModule } from '../auth/auth.module'
import { JwtModule } from '@nestjs/jwt'

@Module({
  imports: [AuthModule, JwtModule],
  providers: [RealtimeGateway, RealtimeService],
  exports: [RealtimeService],
})
export class RealtimeModule {}
```

### WebSocket网关实现

```typescript
// src/realtime/realtime.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Logger, UseGuards } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { RealtimeService } from './realtime.service'
import { WsJwtGuard } from './guards/ws-jwt.guard'

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5188',
    credentials: true,
  },
  namespace: '/',
  transports: ['websocket', 'polling'],
})
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(RealtimeGateway.name)

  constructor(
    private readonly realtimeService: RealtimeService,
    private readonly jwtService: JwtService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized')
    this.realtimeService.setServer(server)
  }

  async handleConnection(client: Socket) {
    try {
      // 从连接中提取JWT令牌
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '')

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`)
        client.disconnect()
        return
      }

      // 验证JWT令牌
      const payload = this.jwtService.verify(token)
      const userId = payload.sub

      // 将用户信息存储到socket中
      client.data.userId = userId
      client.data.username = payload.username

      // 加入用户专属房间
      await client.join(`user:${userId}`)

      // 记录用户上线
      await this.realtimeService.handleUserOnline(userId, client.id)

      this.logger.log(`User ${userId} connected with socket ${client.id}`)

      // 发送连接成功消息
      client.emit('connected', {
        message: 'Connected successfully',
        userId,
        socketId: client.id,
      })

    } catch (error) {
      this.logger.error(`Connection failed for client ${client.id}:`, error.message)
      client.emit('error', { message: 'Authentication failed' })
      client.disconnect()
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data?.userId

    if (userId) {
      await this.realtimeService.handleUserOffline(userId, client.id)
      this.logger.log(`User ${userId} disconnected from socket ${client.id}`)
    } else {
      this.logger.log(`Anonymous client ${client.id} disconnected`)
    }
  }

  // 加入房间
  @SubscribeMessage('join-room')
  @UseGuards(WsJwtGuard)
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string }
  ) {
    await client.join(data.room)
    client.emit('joined-room', { room: data.room })
    this.logger.log(`User ${client.data.userId} joined room: ${data.room}`)
  }

  // 离开房间
  @SubscribeMessage('leave-room')
  @UseGuards(WsJwtGuard)
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string }
  ) {
    await client.leave(data.room)
    client.emit('left-room', { room: data.room })
    this.logger.log(`User ${client.data.userId} left room: ${data.room}`)
  }

  // 发送私聊消息
  @SubscribeMessage('private-message')
  @UseGuards(WsJwtGuard)
  async handlePrivateMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { targetUserId: string; message: string }
  ) {
    const senderId = client.data.userId

    // 发送消息到目标用户
    this.server.to(`user:${data.targetUserId}`).emit('private-message', {
      senderId,
      senderUsername: client.data.username,
      message: data.message,
      timestamp: new Date().toISOString(),
    })

    // 确认消息已发送
    client.emit('message-sent', {
      targetUserId: data.targetUserId,
      message: data.message,
      timestamp: new Date().toISOString(),
    })

    this.logger.log(`Private message from ${senderId} to ${data.targetUserId}`)
  }

  // 音乐同步播放
  @SubscribeMessage('music-sync')
  @UseGuards(WsJwtGuard)
  async handleMusicSync(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {
      action: 'play' | 'pause' | 'seek'
      songId: string
      currentTime?: number
      room?: string
    }
  ) {
    const userId = client.data.userId
    const room = data.room || `user:${userId}`

    // 广播音乐同步事件到房间内其他用户
    client.to(room).emit('music-sync', {
      action: data.action,
      songId: data.songId,
      currentTime: data.currentTime,
      userId,
      timestamp: new Date().toISOString(),
    })

    this.logger.log(`Music sync event from ${userId}: ${data.action} - ${data.songId}`)
  }
}
```

---

## 🛠️ 服务端业务逻辑

### WebSocket服务类

```typescript
// src/realtime/realtime.service.ts
import { Injectable, Logger } from '@nestjs/common'
import { Server } from 'socket.io'
import { InjectRedis } from '@nestjs-modules/ioredis'
import Redis from 'ioredis'

@Injectable()
export class RealtimeService {
  private server: Server
  private readonly logger = new Logger(RealtimeService.name)

  constructor(@InjectRedis() private readonly redis: Redis) {}

  setServer(server: Server) {
    this.server = server
  }

  /**
   * 处理用户上线
   */
  async handleUserOnline(userId: string, socketId: string) {
    // 在Redis中记录用户在线状态
    await this.redis.hset('online_users', userId, JSON.stringify({
      socketId,
      onlineAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    }))

    // 通知用户的关注者
    await this.notifyFollowers(userId, 'user-online', { userId })

    this.logger.log(`User ${userId} is now online`)
  }

  /**
   * 处理用户下线
   */
  async handleUserOffline(userId: string, socketId: string) {
    // 从Redis中移除用户在线状态
    await this.redis.hdel('online_users', userId)

    // 通知用户的关注者
    await this.notifyFollowers(userId, 'user-offline', { userId })

    this.logger.log(`User ${userId} is now offline`)
  }

  /**
   * 获取在线用户列表
   */
  async getOnlineUsers(): Promise<string[]> {
    const onlineUsers = await this.redis.hgetall('online_users')
    return Object.keys(onlineUsers)
  }

  /**
   * 检查用户是否在线
   */
  async isUserOnline(userId: string): Promise<boolean> {
    const userInfo = await this.redis.hget('online_users', userId)
    return !!userInfo
  }

  /**
   * 发送通知给指定用户
   */
  async sendNotificationToUser(userId: string, notification: any) {
    if (!this.server) {
      this.logger.warn('WebSocket server not initialized')
      return
    }

    this.server.to(`user:${userId}`).emit('notification', {
      ...notification,
      timestamp: new Date().toISOString(),
    })

    this.logger.log(`Notification sent to user ${userId}: ${notification.type}`)
  }

  /**
   * 发送通知给多个用户
   */
  async sendNotificationToUsers(userIds: string[], notification: any) {
    if (!this.server) {
      this.logger.warn('WebSocket server not initialized')
      return
    }

    const rooms = userIds.map(id => `user:${id}`)

    for (const room of rooms) {
      this.server.to(room).emit('notification', {
        ...notification,
        timestamp: new Date().toISOString(),
      })
    }

    this.logger.log(`Notification sent to ${userIds.length} users: ${notification.type}`)
  }

  /**
   * 广播消息到所有在线用户
   */
  async broadcastToAll(event: string, data: any) {
    if (!this.server) {
      this.logger.warn('WebSocket server not initialized')
      return
    }

    this.server.emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    })

    this.logger.log(`Broadcast event: ${event}`)
  }

  /**
   * 通知关注者
   */
  private async notifyFollowers(userId: string, event: string, data: any) {
    // 这里需要从数据库获取关注者列表
    // 简化实现，实际应该查询数据库
    const followers = await this.getFollowers(userId)

    if (followers.length > 0) {
      await this.sendNotificationToUsers(followers, {
        type: event,
        ...data,
      })
    }
  }

  /**
   * 获取用户关注者列表（示例实现）
   */
  private async getFollowers(userId: string): Promise<string[]> {
    // 实际实现应该查询数据库
    // 这里返回空数组作为示例
    return []
  }

  /**
   * 更新用户活动时间
   */
  async updateUserActivity(userId: string) {
    const userInfo = await this.redis.hget('online_users', userId)
    if (userInfo) {
      const parsed = JSON.parse(userInfo)
      parsed.lastActivity = new Date().toISOString()
      await this.redis.hset('online_users', userId, JSON.stringify(parsed))
    }
  }

  /**
   * 获取房间内的用户数量
   */
  async getRoomUserCount(room: string): Promise<number> {
    if (!this.server) return 0

    const sockets = await this.server.in(room).fetchSockets()
    return sockets.length
  }

  /**
   * 获取服务器统计信息
   */
  async getServerStats() {
    if (!this.server) {
      return {
        connectedClients: 0,
        onlineUsers: 0,
        rooms: 0,
      }
    }

    const sockets = await this.server.fetchSockets()
    const onlineUsers = await this.getOnlineUsers()

    return {
      connectedClients: sockets.length,
      onlineUsers: onlineUsers.length,
      rooms: this.server.sockets.adapter.rooms.size,
    }
  }
}
```

---

## 🎯 前端客户端实现

### Vue 3 WebSocket服务

```typescript
// src/services/realtime.ts
import { io, Socket } from 'socket.io-client'
import { ref, reactive } from 'vue'

interface NotificationData {
  type: string
  message: string
  data?: any
  timestamp: string
}

interface MusicSyncData {
  action: 'play' | 'pause' | 'seek'
  songId: string
  currentTime?: number
  userId: string
  timestamp: string
}

class RealtimeService {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  // 响应式状态
  public isConnected = ref(false)
  public connectionError = ref<string | null>(null)
  public onlineUsers = ref<string[]>([])
  public notifications = reactive<NotificationData[]>([])

  /**
   * 连接WebSocket服务器
   */
  connect(token: string, serverUrl: string = '/') {
    if (this.socket?.connected) {
      console.warn('WebSocket already connected')
      return
    }

    this.socket = io(serverUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 5000,
      retries: 3,
    })

    this.setupEventListeners()
  }

  /**
   * 断开WebSocket连接
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected.value = false
    }
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners() {
    if (!this.socket) return

    // 连接成功
    this.socket.on('connect', () => {
      console.log('WebSocket connected:', this.socket?.id)
      this.isConnected.value = true
      this.connectionError.value = null
      this.reconnectAttempts = 0
    })

    // 连接断开
    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason)
      this.isConnected.value = false

      if (reason === 'io server disconnect') {
        // 服务器主动断开，需要重新连接
        this.handleReconnect()
      }
    })

    // 连接错误
    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
      this.connectionError.value = error.message
      this.handleReconnect()
    })

    // 接收通知
    this.socket.on('notification', (data: NotificationData) => {
      this.notifications.push(data)
      this.handleNotification(data)
    })

    // 音乐同步
    this.socket.on('music-sync', (data: MusicSyncData) => {
      this.handleMusicSync(data)
    })

    // 用户上线/下线
    this.socket.on('user-online', (data: { userId: string }) => {
      if (!this.onlineUsers.value.includes(data.userId)) {
        this.onlineUsers.value.push(data.userId)
      }
    })

    this.socket.on('user-offline', (data: { userId: string }) => {
      const index = this.onlineUsers.value.indexOf(data.userId)
      if (index > -1) {
        this.onlineUsers.value.splice(index, 1)
      }
    })

    // 私聊消息
    this.socket.on('private-message', (data) => {
      this.handlePrivateMessage(data)
    })
  }

  /**
   * 处理重连逻辑
   */
  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      this.connectionError.value = 'Connection failed after multiple attempts'
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`)

    setTimeout(() => {
      if (this.socket && !this.socket.connected) {
        this.socket.connect()
      }
    }, delay)
  }

  /**
   * 加入房间
   */
  joinRoom(room: string) {
    if (this.socket?.connected) {
      this.socket.emit('join-room', { room })
    }
  }

  /**
   * 离开房间
   */
  leaveRoom(room: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave-room', { room })
    }
  }

  /**
   * 发送私聊消息
   */
  sendPrivateMessage(targetUserId: string, message: string) {
    if (this.socket?.connected) {
      this.socket.emit('private-message', { targetUserId, message })
    }
  }

  /**
   * 发送音乐同步事件
   */
  sendMusicSync(data: {
    action: 'play' | 'pause' | 'seek'
    songId: string
    currentTime?: number
    room?: string
  }) {
    if (this.socket?.connected) {
      this.socket.emit('music-sync', data)
    }
  }

  /**
   * 处理通知
   */
  private handleNotification(notification: NotificationData) {
    // 可以在这里添加通知处理逻辑
    // 例如：显示Toast、播放声音等
    console.log('Received notification:', notification)

    // 触发自定义事件
    window.dispatchEvent(new CustomEvent('realtime-notification', {
      detail: notification
    }))
  }

  /**
   * 处理音乐同步
   */
  private handleMusicSync(data: MusicSyncData) {
    console.log('Received music sync:', data)

    // 触发自定义事件
    window.dispatchEvent(new CustomEvent('music-sync', {
      detail: data
    }))
  }

  /**
   * 处理私聊消息
   */
  private handlePrivateMessage(data: any) {
    console.log('Received private message:', data)

    // 触发自定义事件
    window.dispatchEvent(new CustomEvent('private-message', {
      detail: data
    }))
  }

  /**
   * 获取连接状态
   */
  get connected(): boolean {
    return this.socket?.connected || false
  }

  /**
   * 获取Socket ID
   */
  get socketId(): string | undefined {
    return this.socket?.id
  }
}

// 创建单例实例
export const realtimeService = new RealtimeService()
```

### Vue组件中的使用

```vue
<!-- src/components/RealtimeNotifications.vue -->
<template>
  <div class="realtime-notifications">
    <!-- 连接状态指示器 -->
    <div class="connection-status" :class="{ connected: realtimeService.isConnected.value }">
      <div class="status-dot"></div>
      <span>{{ realtimeService.isConnected.value ? '已连接' : '未连接' }}</span>
    </div>

    <!-- 通知列表 -->
    <div class="notifications-list">
      <div
        v-for="notification in recentNotifications"
        :key="notification.timestamp"
        class="notification-item"
        :class="notification.type"
      >
        <div class="notification-content">
          <h4>{{ notification.type }}</h4>
          <p>{{ notification.message }}</p>
        </div>
        <div class="notification-time">
          {{ formatTime(notification.timestamp) }}
        </div>
      </div>
    </div>

    <!-- 在线用户列表 -->
    <div class="online-users">
      <h3>在线用户 ({{ realtimeService.onlineUsers.value.length }})</h3>
      <div class="users-list">
        <div
          v-for="userId in realtimeService.onlineUsers.value"
          :key="userId"
          class="user-item"
        >
          <div class="user-avatar"></div>
          <span>{{ userId }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { realtimeService } from '@/services/realtime'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// 最近的通知（最多显示10条）
const recentNotifications = computed(() => {
  return realtimeService.notifications.slice(-10).reverse()
})

// 格式化时间
const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString()
}

// 处理自定义事件
const handleRealtimeNotification = (event: CustomEvent) => {
  const notification = event.detail

  // 可以在这里添加额外的处理逻辑
  // 例如：显示Toast通知
  console.log('Notification received in component:', notification)
}

const handleMusicSync = (event: CustomEvent) => {
  const syncData = event.detail

  // 处理音乐同步事件
  console.log('Music sync received in component:', syncData)
}

onMounted(() => {
  // 如果用户已登录且未连接，则建立连接
  if (authStore.isAuthenticated && authStore.token && !realtimeService.connected) {
    realtimeService.connect(authStore.token)
  }

  // 监听自定义事件
  window.addEventListener('realtime-notification', handleRealtimeNotification)
  window.addEventListener('music-sync', handleMusicSync)
})

onUnmounted(() => {
  // 清理事件监听器
  window.removeEventListener('realtime-notification', handleRealtimeNotification)
  window.removeEventListener('music-sync', handleMusicSync)
})
</script>

<style scoped>
.realtime-notifications {
  padding: 1rem;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ef4444;
  transition: background-color 0.3s;
}

.connection-status.connected .status-dot {
  background-color: #10b981;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 0.5rem;
  background-color: #f3f4f6;
}

.notification-item.error {
  background-color: #fef2f2;
  border-left: 4px solid #ef4444;
}

.notification-item.success {
  background-color: #f0fdf4;
  border-left: 4px solid #10b981;
}

.online-users {
  margin-top: 2rem;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  margin-bottom: 0.25rem;
}

.user-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #3b82f6;
}
</style>
```

---

## 🔒 WebSocket安全机制

### JWT认证守卫

```typescript
// src/realtime/guards/ws-jwt.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { WsException } from '@nestjs/websockets'
import { Socket } from 'socket.io'

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient()

    try {
      // 从socket数据中获取用户信息（在连接时已验证）
      const userId = client.data?.userId

      if (!userId) {
        throw new WsException('Unauthorized')
      }

      return true
    } catch (error) {
      throw new WsException('Unauthorized')
    }
  }
}
```

### 速率限制中间件

```typescript
// src/realtime/middleware/rate-limit.middleware.ts
import { Injectable } from '@nestjs/common'
import { InjectRedis } from '@nestjs-modules/ioredis'
import Redis from 'ioredis'
import { Socket } from 'socket.io'

@Injectable()
export class WebSocketRateLimitMiddleware {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async checkRateLimit(socket: Socket, event: string): Promise<boolean> {
    const userId = socket.data?.userId
    if (!userId) return false

    const key = `ws_rate_limit:${userId}:${event}`
    const current = await this.redis.incr(key)

    if (current === 1) {
      await this.redis.expire(key, 60) // 1分钟窗口
    }

    // 不同事件的限制
    const limits = {
      'private-message': 30,    // 每分钟30条私聊
      'music-sync': 60,         // 每分钟60次音乐同步
      'join-room': 10,          // 每分钟10次加入房间
      'default': 100,           // 默认限制
    }

    const limit = limits[event] || limits.default

    if (current > limit) {
      socket.emit('rate-limit-exceeded', {
        event,
        limit,
        resetTime: Date.now() + 60000,
      })
      return false
    }

    return true
  }
}
```

### 消息验证和过滤

```typescript
// src/realtime/pipes/message-validation.pipe.ts
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common'
import { WsException } from '@nestjs/websockets'

@Injectable()
export class MessageValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (!value || typeof value !== 'object') {
      throw new WsException('Invalid message format')
    }

    // 消息长度限制
    if (value.message && value.message.length > 1000) {
      throw new WsException('Message too long')
    }

    // 内容过滤（简单示例）
    if (value.message && this.containsInappropriateContent(value.message)) {
      throw new WsException('Inappropriate content detected')
    }

    return value
  }

  private containsInappropriateContent(message: string): boolean {
    // 简单的内容过滤逻辑
    const bannedWords = ['spam', 'abuse'] // 实际应用中应该有更完善的过滤机制
    return bannedWords.some(word => message.toLowerCase().includes(word))
  }
}
```

---

## 📊 监控和性能优化

### WebSocket监控服务

```typescript
// src/realtime/monitoring/websocket-monitor.service.ts
import { Injectable, Logger } from '@nestjs/common'
import { InjectRedis } from '@nestjs-modules/ioredis'
import Redis from 'ioredis'
import { Cron, CronExpression } from '@nestjs/schedule'

@Injectable()
export class WebSocketMonitorService {
  private readonly logger = new Logger(WebSocketMonitorService.name)

  constructor(@InjectRedis() private readonly redis: Redis) {}

  /**
   * 记录连接指标
   */
  async recordConnectionMetric(event: 'connect' | 'disconnect', userId?: string) {
    const timestamp = Date.now()
    const key = `ws_metrics:${event}:${Math.floor(timestamp / 60000)}` // 按分钟聚合

    await this.redis.incr(key)
    await this.redis.expire(key, 3600) // 保留1小时

    if (userId) {
      await this.redis.sadd(`ws_active_users:${Math.floor(timestamp / 60000)}`, userId)
      await this.redis.expire(`ws_active_users:${Math.floor(timestamp / 60000)}`, 3600)
    }
  }

  /**
   * 记录消息指标
   */
  async recordMessageMetric(event: string, userId: string) {
    const timestamp = Date.now()
    const minuteKey = `ws_messages:${event}:${Math.floor(timestamp / 60000)}`
    const userKey = `ws_user_messages:${userId}:${Math.floor(timestamp / 60000)}`

    await Promise.all([
      this.redis.incr(minuteKey),
      this.redis.incr(userKey),
      this.redis.expire(minuteKey, 3600),
      this.redis.expire(userKey, 3600),
    ])
  }

  /**
   * 获取实时统计
   */
  async getRealtimeStats() {
    const currentMinute = Math.floor(Date.now() / 60000)

    const [
      connections,
      disconnections,
      activeUsers,
      messageCount,
    ] = await Promise.all([
      this.redis.get(`ws_metrics:connect:${currentMinute}`) || '0',
      this.redis.get(`ws_metrics:disconnect:${currentMinute}`) || '0',
      this.redis.scard(`ws_active_users:${currentMinute}`),
      this.redis.get(`ws_messages:private-message:${currentMinute}`) || '0',
    ])

    return {
      connections: parseInt(connections),
      disconnections: parseInt(disconnections),
      activeUsers,
      messageCount: parseInt(messageCount),
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * 定期清理过期数据
   */
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredMetrics() {
    const cutoffTime = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 60000) // 24小时前

    const patterns = [
      'ws_metrics:*',
      'ws_active_users:*',
      'ws_messages:*',
      'ws_user_messages:*',
    ]

    for (const pattern of patterns) {
      const keys = await this.redis.keys(pattern)

      for (const key of keys) {
        const keyTime = parseInt(key.split(':').pop() || '0')
        if (keyTime < cutoffTime) {
          await this.redis.del(key)
        }
      }
    }

    this.logger.log('Cleaned up expired WebSocket metrics')
  }

  /**
   * 检测异常连接模式
   */
  async detectAnomalies() {
    const stats = await this.getRealtimeStats()

    // 检测连接异常
    if (stats.connections > 1000) { // 每分钟超过1000个连接
      this.logger.warn(`High connection rate detected: ${stats.connections} connections/minute`)
    }

    // 检测消息异常
    if (stats.messageCount > 10000) { // 每分钟超过10000条消息
      this.logger.warn(`High message rate detected: ${stats.messageCount} messages/minute`)
    }

    return stats
  }
}
```

### 性能优化配置

```typescript
// src/realtime/config/websocket.config.ts
export const websocketConfig = {
  // 连接配置
  pingTimeout: 60000,           // 60秒ping超时
  pingInterval: 25000,          // 25秒ping间隔
  upgradeTimeout: 10000,        // 10秒升级超时
  maxHttpBufferSize: 1e6,       // 1MB最大HTTP缓冲区

  // 传输配置
  transports: ['websocket', 'polling'],
  allowUpgrades: true,

  // CORS配置
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5188',
    methods: ['GET', 'POST'],
    credentials: true,
  },

  // 适配器配置（用于多实例部署）
  adapter: {
    type: 'redis',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
}
```

---

## 🧪 测试策略

### WebSocket单元测试

```typescript
// src/realtime/realtime.gateway.spec.ts
import { Test, TestingModule } from '@nestjs/testing'
import { RealtimeGateway } from './realtime.gateway'
import { RealtimeService } from './realtime.service'
import { JwtService } from '@nestjs/jwt'
import { Socket } from 'socket.io'

describe('RealtimeGateway', () => {
  let gateway: RealtimeGateway
  let realtimeService: RealtimeService
  let jwtService: JwtService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RealtimeGateway,
        {
          provide: RealtimeService,
          useValue: {
            handleUserOnline: jest.fn(),
            handleUserOffline: jest.fn(),
            setServer: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
          },
        },
      ],
    }).compile()

    gateway = module.get<RealtimeGateway>(RealtimeGateway)
    realtimeService = module.get<RealtimeService>(RealtimeService)
    jwtService = module.get<JwtService>(JwtService)
  })

  describe('handleConnection', () => {
    it('should authenticate user and join room', async () => {
      const mockSocket = {
        id: 'socket-123',
        handshake: {
          auth: { token: 'valid-token' },
        },
        join: jest.fn(),
        emit: jest.fn(),
        disconnect: jest.fn(),
        data: {},
      } as any

      const mockPayload = {
        sub: 'user-123',
        username: 'testuser',
      }

      jest.spyOn(jwtService, 'verify').mockReturnValue(mockPayload)

      await gateway.handleConnection(mockSocket)

      expect(mockSocket.join).toHaveBeenCalledWith('user:user-123')
      expect(realtimeService.handleUserOnline).toHaveBeenCalledWith('user-123', 'socket-123')
      expect(mockSocket.emit).toHaveBeenCalledWith('connected', expect.any(Object))
    })

    it('should disconnect invalid token', async () => {
      const mockSocket = {
        id: 'socket-123',
        handshake: {
          auth: { token: 'invalid-token' },
        },
        emit: jest.fn(),
        disconnect: jest.fn(),
      } as any

      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('Invalid token')
      })

      await gateway.handleConnection(mockSocket)

      expect(mockSocket.emit).toHaveBeenCalledWith('error', { message: 'Authentication failed' })
      expect(mockSocket.disconnect).toHaveBeenCalled()
    })
  })
})
```

### 集成测试

```typescript
// test/websocket.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { Socket, io } from 'socket.io-client'
import { AppModule } from '../src/app.module'

describe('WebSocket (e2e)', () => {
  let app: INestApplication
  let clientSocket: Socket

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.listen(3001)
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach((done) => {
    clientSocket = io('http://localhost:3001', {
      auth: {
        token: 'valid-test-token',
      },
    })
    clientSocket.on('connect', done)
  })

  afterEach(() => {
    clientSocket.close()
  })

  it('should connect and receive welcome message', (done) => {
    clientSocket.on('connected', (data) => {
      expect(data.message).toBe('Connected successfully')
      done()
    })
  })

  it('should join and leave rooms', (done) => {
    clientSocket.emit('join-room', { room: 'test-room' })

    clientSocket.on('joined-room', (data) => {
      expect(data.room).toBe('test-room')

      clientSocket.emit('leave-room', { room: 'test-room' })

      clientSocket.on('left-room', (data) => {
        expect(data.room).toBe('test-room')
        done()
      })
    })
  })
})
```

---

## 🔧 故障排除

### 常见问题和解决方案

1. **连接失败**
   ```typescript
   // 检查认证令牌
   const token = localStorage.getItem('auth_token')
   if (!token) {
     console.error('No authentication token found')
     return
   }

   // 检查服务器地址
   const serverUrl = process.env.VITE_WS_URL || 'ws://localhost:3000'
   console.log('Connecting to:', serverUrl)
   ```

2. **消息丢失**
   ```typescript
   // 实现消息确认机制
   socket.emit('private-message', data, (ack) => {
     if (ack.success) {
       console.log('Message delivered')
     } else {
       console.error('Message failed:', ack.error)
       // 重试逻辑
     }
   })
   ```

3. **内存泄漏**
   ```typescript
   // 正确清理事件监听器
   onUnmounted(() => {
     if (socket) {
       socket.removeAllListeners()
       socket.disconnect()
     }
   })
   ```

### 调试工具

```typescript
// WebSocket调试中间件
export class WebSocketDebugMiddleware {
  use(socket: Socket, next: Function) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[WS Debug] Socket ${socket.id} - Event: ${socket.eventNames()}`)

      // 记录所有事件
      const originalEmit = socket.emit
      socket.emit = function(...args) {
        console.log(`[WS Debug] Emitting:`, args[0], args.slice(1))
        return originalEmit.apply(this, args)
      }
    }

    next()
  }
}
```

---

*本文档详细介绍了WebSocket实时通信系统的实现，包括服务端和客户端的完整代码示例。*
```