import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig, jwtConfig, appConfig } from './config';
import { AuthModule } from './auth/auth.module';
import { SongsModule } from './songs/songs.module';
import { PlaylistsModule } from './playlists/playlists.module';
import { UploadModule } from './upload/upload.module';
import { DatabaseModule } from './database/database.module';
import { FavoritesModule } from './favorites/favorites.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, appConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // 数据库模块
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '123456',
      database: process.env.DB_DATABASE || 'music_app',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
      charset: 'utf8mb4',
      timezone: '+08:00',
    }),

    // 静态文件服务
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          rootPath: join(
            __dirname,
            '..',
            configService.get('app.uploadDir') || 'uploads',
          ),
          serveRoot: '/uploads',
        },
      ],
      inject: [ConfigService],
    }),

    // 功能模块
    AuthModule,
    SongsModule,
    PlaylistsModule,
    FavoritesModule,
    UploadModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
