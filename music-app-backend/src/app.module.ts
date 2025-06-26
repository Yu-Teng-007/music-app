import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { databaseConfig, jwtConfig, appConfig, throttleConfig, cacheConfig } from './config'
import { AuthModule } from './auth/auth.module'
import { SongsModule } from './songs/songs.module'
import { PlaylistsModule } from './playlists/playlists.module'
import { UploadModule } from './upload/upload.module'
import { DatabaseModule } from './database/database.module'
import { FavoritesModule } from './favorites/favorites.module'
import { GenresModule } from './genres/genres.module'
import { CommentsModule } from './comments/comments.module'
import { CacheModule } from './common/cache/cache.module'
import {
  User,
  Song,
  Playlist,
  Favorite,
  Genre,
  Chart,
  Comment,
  UserFollow,
  UserFeed,
  FeedLike,
  FeedComment,
  Download,
  DownloadCache,
  UserStorage,
} from './entities'
import { SmsModule } from './sms/sms.module'
import { HistoryModule } from './history/history.module'
import { SearchHistoryModule } from './search-history/search-history.module'
import { UserPreferencesModule } from './user-preferences/user-preferences.module'
import { RealtimeModule } from './realtime/realtime.module'
import { SocialModule } from './social/social.module'
import { DownloadModule } from './download/download.module'
import { AppThrottlerModule } from './common/throttler/throttler.module'
import { SecurityModule } from './common/security/security.module'
import { LoggerModule } from './common/logger/logger.module'

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, appConfig, throttleConfig, cacheConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // 日志模块
    LoggerModule,

    // 数据库模块
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('database.synchronize'),
        logging: configService.get('database.logging'),
        charset: configService.get('database.charset'),
        timezone: configService.get('database.timezone'),
      }),
    }),

    // 注册所有实体以便在种子脚本中使用
    TypeOrmModule.forFeature([
      User,
      Song,
      Playlist,
      Favorite,
      Genre,
      Chart,
      Comment,
      UserFollow,
      UserFeed,
      FeedLike,
      FeedComment,
      Download,
      DownloadCache,
      UserStorage,
    ]),

    // 静态文件服务
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          rootPath: join(__dirname, '..', configService.get('app.uploadDir') || 'uploads'),
          serveRoot: '/uploads',
        },
        {
          rootPath: join(__dirname, 'static'),
          serveRoot: '/static',
        },
      ],
      inject: [ConfigService],
    }),

    // 安全模块
    SecurityModule,

    // 请求速率限制模块
    AppThrottlerModule,

    // 缓存模块
    CacheModule,

    // 功能模块
    AuthModule,
    SongsModule,
    PlaylistsModule,
    FavoritesModule,
    GenresModule,
    UploadModule,
    DatabaseModule,
    CommentsModule,
    SmsModule,
    HistoryModule,
    SearchHistoryModule,
    UserPreferencesModule,
    RealtimeModule,
    SocialModule,
    DownloadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
