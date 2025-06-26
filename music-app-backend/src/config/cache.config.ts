import { registerAs } from '@nestjs/config'

export default registerAs('cache', () => ({
  ttl: parseInt(process.env.CACHE_TTL || '3600000', 10), // 默认缓存时间，单位毫秒（1小时）
  maxItems: parseInt(process.env.CACHE_MAX_ITEMS || '1000', 10), // 最大缓存项数
  checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD || '600000', 10), // 清理过期缓存的检查周期，单位毫秒（10分钟）
}))
