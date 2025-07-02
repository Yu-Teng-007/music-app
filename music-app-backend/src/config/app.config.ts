import { registerAs } from '@nestjs/config'

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || [],
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  logDir: process.env.LOG_DIR || 'logs',
}))

export const fileServiceConfig = registerAs('fileService', () => ({
  url: process.env.FILE_SERVICE_URL || 'http://localhost:3001',
  apiKey:
    process.env.FILE_SERVICE_API_KEY ||
    'dev_fs_2025_7b8c9d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e',
}))
