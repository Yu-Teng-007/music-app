import { registerAs } from '@nestjs/config'

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || [],
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  logDir: process.env.LOG_DIR || 'logs',
}))
