import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WsException,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Logger } from '@nestjs/common'
import { RealtimeService } from './realtime.service'
import { JwtService } from '@nestjs/jwt'

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(RealtimeGateway.name)

  constructor(
    private readonly realtimeService: RealtimeService,
    private readonly jwtService: JwtService
  ) {}

  @WebSocketServer()
  server: Server

  afterInit(server: Server) {
    this.realtimeService.setServer(server)
    this.logger.log('WebSocket服务器已初始化')
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization

      if (!token) {
        throw new WsException('未提供身份验证令牌')
      }

      // 验证JWT令牌
      const payload = this.jwtService.verify(token.replace('Bearer ', ''))
      const userId = payload.sub

      // 将用户ID存储在socket对象中
      client.data.userId = userId

      // 注册用户连接
      this.realtimeService.registerUser(userId, client.id)

      // 加入用户自己的房间
      await client.join(`user:${userId}`)

      this.logger.log(`用户 ${userId} 已连接，Socket ID: ${client.id}`)

      // 发送欢迎消息
      client.emit('connected', { message: '已成功连接到WebSocket服务器' })

      // 广播用户上线消息
      this.server.emit('user:online', {
        userId,
        onlineCount: this.realtimeService.getOnlineUsersCount(),
      })
    } catch (error) {
      this.logger.error(`WebSocket连接验证失败: ${error.message}`)
      client.disconnect()
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId

    if (userId) {
      // 移除socket连接
      this.realtimeService.removeSocket(client.id)

      this.logger.log(`用户 ${userId} 已断开连接，Socket ID: ${client.id}`)

      // 广播用户下线消息
      this.server.emit('user:offline', {
        userId,
        onlineCount: this.realtimeService.getOnlineUsersCount(),
      })
    }
  }

  @SubscribeMessage('join:room')
  handleJoinRoom(client: Socket, payload: { room: string }) {
    void client.join(payload.room)
    return { event: 'join:room', data: { room: payload.room, success: true } }
  }

  @SubscribeMessage('leave:room')
  handleLeaveRoom(client: Socket, payload: { room: string }) {
    void client.leave(payload.room)
    return { event: 'leave:room', data: { room: payload.room, success: true } }
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: { to: string; content: string }) {
    const userId = client.data.userId

    if (!userId) {
      throw new WsException('未授权')
    }

    const { to, content } = payload

    // 发送私信
    this.realtimeService.sendToUser(to, 'message', {
      from: userId,
      content,
      timestamp: new Date(),
    })

    return { event: 'message:sent', data: { to, success: true } }
  }

  // 社交功能相关的实时通信方法

  // 发送新动态通知
  sendNewFeedNotification(userId: string, feed: any) {
    this.server.to(`user:${userId}`).emit('new_feed', {
      type: 'new_feed',
      data: feed,
      timestamp: new Date().toISOString(),
    })
  }

  // 发送点赞通知
  sendLikeNotification(userId: string, like: any) {
    this.server.to(`user:${userId}`).emit('feed_liked', {
      type: 'feed_liked',
      data: like,
      timestamp: new Date().toISOString(),
    })
  }

  // 发送关注通知
  sendFollowNotification(userId: string, follower: any) {
    this.server.to(`user:${userId}`).emit('new_follower', {
      type: 'new_follower',
      data: follower,
      timestamp: new Date().toISOString(),
    })
  }

  // 发送评论通知
  sendCommentNotification(userId: string, comment: any) {
    this.server.to(`user:${userId}`).emit('new_comment', {
      type: 'new_comment',
      data: comment,
      timestamp: new Date().toISOString(),
    })
  }

  // 广播动态到关注者
  broadcastFeedToFollowers(followerIds: string[], feed: any) {
    followerIds.forEach(followerId => {
      this.server.to(`user:${followerId}`).emit('feed_update', {
        type: 'feed_update',
        data: feed,
        timestamp: new Date().toISOString(),
      })
    })
  }
}
