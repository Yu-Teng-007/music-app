import { Module } from '@nestjs/common'
import { WinstonModule } from 'nest-winston'
import { ConfigModule, ConfigService } from '@nestjs/config'
import * as winston from 'winston'
import { join } from 'path'

@Module({
  imports: [
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('app.nodeEnv') === 'production'
        const logDir = configService.get('app.logDir') || 'logs'

        // 自定义格式化函数
        const customFormat = winston.format.printf((info: any) => {
          // 将对象转换为字符串
          const timestamp = info.timestamp ? String(info.timestamp) : new Date().toISOString()
          const level = info.level ? String(info.level) : 'info'
          const message = info.message ? String(info.message) : ''
          const context = info.context ? String(info.context) : 'Application'
          const trace = info.trace ? `\n${String(info.trace)}` : ''

          return `${timestamp} [${level}] [${context}] ${message}${trace}`
        })

        return {
          transports: [
            // 控制台日志
            new winston.transports.Console({
              format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.ms(),
                isProduction ? winston.format.json() : customFormat
              ),
              level: isProduction ? 'info' : 'debug',
            }),
            // 错误日志文件
            new winston.transports.File({
              filename: join(logDir, 'error.log'),
              level: 'error',
              format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
            }),
            // 所有日志文件
            new winston.transports.File({
              filename: join(logDir, 'combined.log'),
              format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
            }),
          ],
        }
      },
    }),
  ],
})
export class LoggerModule {}
