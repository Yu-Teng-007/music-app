import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

interface CacheItem<T> {
  value: T
  expiry: number
  lastAccessed: number
}

@Injectable()
export class CacheService implements OnModuleInit {
  private cache: Map<string, CacheItem<any>> = new Map()
  private readonly ttl: number
  private readonly maxItems: number
  private readonly checkPeriod: number
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(private configService: ConfigService) {
    this.ttl = this.configService.get('cache.ttl') || 3600000 // 默认1小时
    this.maxItems = this.configService.get('cache.maxItems') || 1000 // 默认最大1000项
    this.checkPeriod = this.configService.get('cache.checkPeriod') || 600000 // 默认10分钟清理一次
  }

  onModuleInit() {
    // 启动定期清理过期缓存的任务
    this.cleanupInterval = setInterval(() => {
      this.cleanExpiredItems()
    }, this.checkPeriod)
  }

  onModuleDestroy() {
    // 销毁定时器
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
  }

  private cleanExpiredItems(): void {
    const now = Date.now()
    let expiredCount = 0

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key)
        expiredCount++
      }
    }

    if (expiredCount > 0 && process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(`已清理 ${expiredCount} 个过期缓存项`)
    }
  }

  private enforceLimit(): void {
    // 如果缓存项超过最大限制，删除最久未访问的项
    if (this.cache.size > this.maxItems) {
      let oldest: { key: string; lastAccessed: number } | null = null

      for (const [key, item] of this.cache.entries()) {
        if (!oldest || item.lastAccessed < oldest.lastAccessed) {
          oldest = { key, lastAccessed: item.lastAccessed }
        }
      }

      if (oldest) {
        this.cache.delete(oldest.key)
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.log(`缓存已达到最大限制，删除了最久未访问的项: ${oldest.key}`)
        }
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key)
    if (!item) return null

    const now = Date.now()
    if (now > item.expiry) {
      this.cache.delete(key)
      return null
    }

    // 更新最后访问时间
    item.lastAccessed = now
    return item.value
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const expiry = Date.now() + (ttl || this.ttl)
    this.cache.set(key, {
      value,
      expiry,
      lastAccessed: Date.now(),
    })
    this.enforceLimit()
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key)
  }

  async clear(): Promise<void> {
    this.cache.clear()
  }

  /**
   * 获取缓存中的数据，如果不存在则通过提供的函数获取并缓存
   */
  async getOrSet<T>(key: string, fetchFn: () => Promise<T>, ttl?: number): Promise<T> {
    const cachedData = await this.get<T>(key)
    if (cachedData !== null) {
      return cachedData
    }

    const data = await fetchFn()
    await this.set(key, data, ttl)
    return data
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): { size: number; maxItems: number } {
    return {
      size: this.cache.size,
      maxItems: this.maxItems,
    }
  }
}
