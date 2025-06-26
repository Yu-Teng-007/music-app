/* eslint-disable no-console */

import './polyfill'

import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  const configService = app.get(ConfigService)
  let SwaggerAddress = ''

  // 启用CORS
  app.enableCors({
    origin: configService.get<string>('app.frontendUrl'),
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

  // 设置静态文件目录
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  })
  app.useStaticAssets(join(__dirname, 'static'), {
    prefix: '/static/',
  })

  // 设置全局前缀
  app.setGlobalPrefix('api')

  // 配置Swagger
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Music App API')
      .setDescription('Music App API 文档')
      .setVersion('1.0')
      .addTag('auth', '认证相关接口')
      .addTag('songs', '歌曲相关接口')
      .addTag('playlists', '歌单相关接口')
      .addTag('favorites', '收藏相关接口')
      .addTag('upload', '上传相关接口')
      .addTag('genres', '音乐流派相关接口')
      .addTag('comments', '评论相关接口')
      .addTag('history', '历史记录相关接口')
      .addTag('search-history', '搜索历史相关接口')
      .addTag('user-preferences', '用户偏好相关接口')
      .addTag('social', '社交功能相关接口')
      .addTag('download', '离线下载相关接口')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: '输入JWT token',
          in: 'header',
        },
        'JWT-auth'
      )
      .build()

    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    })

    SwaggerAddress =
      'http://localhost:' + (configService.get<number>('app.port') || 3000) + '/api/docs'
  }

  const port = configService.get<number>('app.port') || 3000
  await app.listen(port)

  console.log(`🚀 后端服务已启动: http://localhost:${port}/api`)
  console.log(`🚀 Swagger文档已启用: ${SwaggerAddress}`)
}

// 启动应用并处理错误
void bootstrap().catch(error => {
  console.error('后端服务启动失败:', error)
  process.exit(1)
})
