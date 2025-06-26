import { Injectable } from '@nestjs/common'
import { Server, Socket } from 'socket.io'

@Injectable()
export class RealtimeService {
  private server: Server
  private userSockets: Map<string, Set<string>> = new Map()

  setServer(server: Server) {
    this.server = server
  }

  // 用户连接时注册用户ID和socket.id的映射
  registerUser(userId: string, socketId: string) {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set())
    }
    const userSockets = this.userSockets.get(userId)
    if (userSockets) {
      userSockets.add(socketId)
    }
  }

  // 用户断开连接时移除映射
  removeSocket(socketId: string) {
    for (const [userId, sockets] of this.userSockets.entries()) {
      if (sockets.has(socketId)) {
        sockets.delete(socketId)
        if (sockets.size === 0) {
          this.userSockets.delete(userId)
        }
        break
      }
    }
  }

  // 向特定用户发送消息
  sendToUser(userId: string, event: string, data: any) {
    const sockets = this.userSockets.get(userId)
    if (sockets && sockets.size > 0) {
      for (const socketId of sockets) {
        this.server.to(socketId).emit(event, data)
      }
    }
  }

  // 向所有用户广播消息
  broadcast(event: string, data: any) {
    this.server.emit(event, data)
  }

  // 向特定房间广播消息
  broadcastToRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, data)
  }

  // 获取在线用户数量
  getOnlineUsersCount(): number {
    return this.userSockets.size
  }

  // 获取在线用户ID列表
  getOnlineUserIds(): string[] {
    return Array.from(this.userSockets.keys())
  }

  // 检查用户是否在线
  isUserOnline(userId: string): boolean {
    const sockets = this.userSockets.get(userId)
    return Boolean(sockets && sockets.size > 0)
  }
}
