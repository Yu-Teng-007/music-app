import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class CacheService {
  private cache: Map<string, any> = new Map()
  private readonly ttl: number

  constructor(private configService: ConfigService) {
    this.ttl = this.configService.get('cache.ttl') || 3600000 // 默认1小时
  }

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const expiry = Date.now() + (ttl || this.ttl)
    this.cache.set(key, { value, expiry })
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key)
  }

  async clear(): Promise<void> {
    this.cache.clear()
  }
}
