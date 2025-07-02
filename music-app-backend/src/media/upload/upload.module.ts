import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { HttpModule } from '@nestjs/axios'
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
        limits: {
          fileSize: 50 * 1024 * 1024, // 50MB
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
