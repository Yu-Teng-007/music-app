import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { databaseConfig, jwtConfig, appConfig, throttleConfig, cacheConfig } from './config'
import { fileServiceConfig } from './config/app.config'
import { AuthModule } from './auth/auth.module'
import { SongsModule } from './songs/songs.module'
import { PlaylistsModule } from './playlists/playlists.module'
import { MediaModule } from './media/media.module'
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
import { UsersModule } from './users/users.module'
import { RealtimeModule } from './realtime/realtime.module'
import { SocialModule } from './social/social.module'

import { AppThrottlerModule } from './common/throttler/throttler.module'
import { SecurityModule } from './common/security/security.module'
import { LoggerModule } from './common/logger/logger.module'

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, appConfig, throttleConfig, cacheConfig, fileServiceConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // 日志模块
    LoggerModule,

    // 数据库模块
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get('database')
        return {
          ...dbConfig,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
        }
      },
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
    MediaModule,
    DatabaseModule,
    CommentsModule,
    SmsModule,
    HistoryModule,
    SearchHistoryModule,
    UsersModule,
    RealtimeModule,
    SocialModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
