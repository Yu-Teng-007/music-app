/* eslint-disable no-console */
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  const configService = app.get(ConfigService)
  let SwaggerAddress = ''

  // 启用CORS
  const frontendUrls = configService.get<string>('app.frontendUrl')?.split(',')
  app.enableCors({
    origin: (origin, callback) => {
      // 允许没有origin的请求（如移动应用、Postman等）
      if (!origin) return callback(null, true)

      // 检查origin是否在允许列表中
      if (frontendUrls.some(url => origin.startsWith(url.trim()))) {
        return callback(null, true)
      }

      callback(new Error('Not allowed by CORS'))
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
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

  // 添加Chrome开发者工具端点处理（在设置全局前缀之前）
  app.use('/.well-known/appspecific/com.chrome.devtools.json', (_req: any, res: any) => {
    res.json({
      message: 'Chrome DevTools configuration not available',
      status: 'ok',
    })
  })

  // 设置全局前缀
  app.setGlobalPrefix('api')

  // 配置Swagger
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Music App API')
      .setDescription('Music App API 文档 - 模块化架构 v2.0')
      .setVersion('2.0')
      .addTag('auth', '🔐 认证授权模块 - 用户认证和权限管理')
      .addTag('users', '👤 用户管理模块 - 用户档案和偏好设置')
      .addTag('upload', '📁 媒体处理模块 - 文件上传功能')
      .addTag('download', '📁 媒体处理模块 - 文件下载功能')
      .addTag('songs', '🎵 歌曲数据模块 - 歌曲信息管理')
      .addTag('playlists', '📋 歌单管理模块 - 歌单创建和编辑')
      .addTag('favorites', '❤️ 收藏管理模块 - 收藏歌曲和歌单')
      .addTag('genres', '🎭 分类管理模块 - 音乐类型分类')
      .addTag('history', '📊 历史记录模块 - 播放历史管理')
      .addTag('search-history', '🔍 搜索历史模块 - 搜索记录管理')
      .addTag('social', '👥 社交功能模块 - 用户关注和动态')
      .addTag('comments', '💬 评论系统模块 - 评论和回复')
      .addTag('realtime', '🔄 实时通信模块 - WebSocket消息推送')
      .addTag('sms', '📱 短信服务模块 - 验证码发送')
      .addTag('user-preferences', '⚙️ 用户偏好设置 - 个性化配置')
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

    // 配置 FLATTOP 扁平主题
    const theme = new SwaggerTheme()
    const options = {
      explorer: true,
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none', // 控制文档展开方式
        filter: true, // 启用搜索过滤
      },
      customCss: theme.getBuffer(SwaggerThemeNameEnum.FLATTOP),
      customSiteTitle: 'Music App API Documentation',
    }

    SwaggerModule.setup('api/docs', app, document, options)

    SwaggerAddress =
      'http://localhost:' + (configService.get<number>('app.port') || 3000) + '/api/docs'
  }

  const port = configService.get<number>('app.port') || 3000
  await app.listen(port, '0.0.0.0')

  console.log(`🚀 后端服务已启动:`)
  console.log(`   - 本地访问: http://localhost:${port}/api`)
  console.log(`   - 网络访问: http://127.0.0.1:${port}/api`)
  console.log(`🚀 Swagger文档已启用: ${SwaggerAddress}`)
}

// 启动应用并处理错误
void bootstrap().catch(error => {
  console.error('后端服务启动失败:', error)
  process.exit(1)
})
