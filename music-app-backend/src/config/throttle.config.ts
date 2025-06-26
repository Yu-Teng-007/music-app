import { registerAs } from '@nestjs/config'

export default registerAs('throttle', () => ({
  ttl: parseInt(process.env.THROTTLE_TTL || '60', 10), // 时间窗口，单位秒
  limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10), // 在时间窗口内允许的最大请求数
}))
