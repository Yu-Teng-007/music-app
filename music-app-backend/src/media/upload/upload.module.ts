import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { HttpModule } from '@nestjs/axios'
import { memoryStorage } from 'multer'
import { UploadController } from './upload.controller'
import { UploadService } from './upload.service'

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000, // 30秒超时
      maxRedirects: 5,
    }),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        storage: memoryStorage(),
        limits: {
          fileSize: 50 * 1024 * 1024, // 50MB
        },
        fileFilter: (req, file, cb) => {
          // 处理文件名编码问题
          try {
            // 尝试正确解码文件名
            const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8')
            file.originalname = originalName
          } catch (error) {
            // 如果解码失败，保持原始文件名
            console.warn('文件名编码处理失败:', error)
          }
          cb(null, true)
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
