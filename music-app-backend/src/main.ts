import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)

  // 启用CORS
  app.enableCors({
    origin: configService.get('app.frontendUrl'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })

  // 全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter())

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  )

  // 设置全局前缀
  app.setGlobalPrefix('api')

  const port = configService.get('app.port')
  await app.listen(port)

  console.log(`🚀 Application is running on: http://localhost:${port}/api`)
}
bootstrap()
