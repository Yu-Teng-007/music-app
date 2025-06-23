import { registerAs } from '@nestjs/config'

export default registerAs('crawler', () => ({
  // 基础配置
  baseUrl: process.env.CRAWLER_BASE_URL || 'https://www.33ve.com',
  userAgent:
    process.env.CRAWLER_USER_AGENT ||
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',

  // 请求配置
  timeout: parseInt(process.env.CRAWLER_TIMEOUT || '30000', 10),
  retryAttempts: parseInt(process.env.CRAWLER_RETRY_ATTEMPTS || '3', 10),
  retryDelay: parseInt(process.env.CRAWLER_RETRY_DELAY || '1000', 10),

  // 频率限制
  requestDelay: parseInt(process.env.CRAWLER_REQUEST_DELAY || '1000', 10), // 请求间隔（毫秒）
  maxConcurrent: parseInt(process.env.CRAWLER_MAX_CONCURRENT || '3', 10), // 最大并发数

  // 爬取限制
  maxSongsPerRequest: parseInt(process.env.CRAWLER_MAX_SONGS_PER_REQUEST || '100', 10),
  maxDailyRequests: parseInt(process.env.CRAWLER_MAX_DAILY_REQUESTS || '1000', 10),

  // 数据验证
  minTitleLength: parseInt(process.env.CRAWLER_MIN_TITLE_LENGTH || '1', 10),
  maxTitleLength: parseInt(process.env.CRAWLER_MAX_TITLE_LENGTH || '200', 10),
  minArtistLength: parseInt(process.env.CRAWLER_MIN_ARTIST_LENGTH || '1', 10),
  maxArtistLength: parseInt(process.env.CRAWLER_MAX_ARTIST_LENGTH || '100', 10),

  // 缓存配置
  enableCache: process.env.CRAWLER_ENABLE_CACHE === 'true',
  cacheExpiry: parseInt(process.env.CRAWLER_CACHE_EXPIRY || '3600', 10), // 缓存过期时间（秒）

  // 错误处理
  maxErrors: parseInt(process.env.CRAWLER_MAX_ERRORS || '10', 10),
  errorThreshold: parseFloat(process.env.CRAWLER_ERROR_THRESHOLD || '0.3'), // 错误率阈值

  // 日志配置
  enableDetailedLogging: process.env.CRAWLER_DETAILED_LOGGING === 'true',
  logLevel: process.env.CRAWLER_LOG_LEVEL || 'info',

  // 代理配置（可选）
  proxyEnabled: process.env.CRAWLER_PROXY_ENABLED === 'true',
  proxyHost: process.env.CRAWLER_PROXY_HOST,
  proxyPort: process.env.CRAWLER_PROXY_PORT
    ? parseInt(process.env.CRAWLER_PROXY_PORT, 10)
    : undefined,
  proxyUsername: process.env.CRAWLER_PROXY_USERNAME,
  proxyPassword: process.env.CRAWLER_PROXY_PASSWORD,

  // 安全配置
  respectRobotsTxt: process.env.CRAWLER_RESPECT_ROBOTS === 'true',
  enableRateLimit: process.env.CRAWLER_ENABLE_RATE_LIMIT !== 'false',

  // 数据处理
  enableDataCleaning: process.env.CRAWLER_ENABLE_DATA_CLEANING !== 'false',
  enableDuplicateCheck: process.env.CRAWLER_ENABLE_DUPLICATE_CHECK !== 'false',

  // 监控配置
  enableMetrics: process.env.CRAWLER_ENABLE_METRICS === 'true',
  metricsInterval: parseInt(process.env.CRAWLER_METRICS_INTERVAL || '60000', 10), // 指标收集间隔（毫秒）
}))
