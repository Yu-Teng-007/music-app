import { registerAs } from '@nestjs/config'
import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import {
  User,
  Song,
  Playlist,
  Favorite,
  Genre,
  UserFollow,
  UserFeed,
  FeedLike,
  FeedComment,
  AdminUser,
  AdminRole,
  AdminPermission,
  AdminRolePermission,
  AdminUserRole,
  SystemConfig,
  AdminLog,
} from '../entities'

export default registerAs('database', (): TypeOrmModuleOptions => {
  const dbType = (process.env.DATABASE_URL ? 'postgres' : process.env.DB_TYPE || 'mysql') as
    | 'mysql'
    | 'postgres'

  // 如果有 DATABASE_URL（Render/Cloudflare 等云服务），使用它
  if (process.env.DATABASE_URL) {
    return {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [
        User,
        Song,
        Playlist,
        Favorite,
        Genre,
        UserFollow,
        UserFeed,
        FeedLike,
        FeedComment,
        AdminUser,
        AdminRole,
        AdminPermission,
        AdminRolePermission,
        AdminUserRole,
        SystemConfig,
        AdminLog,
      ],
      synchronize: false, // 暂时禁用自动同步，避免表结构冲突
      logging: process.env.NODE_ENV === 'development',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }
  }

  // 本地开发配置
  const config: any = {
    type: dbType,
    host: process.env.DB_HOST || process.env.DATABASE_HOST || 'localhost',
    port: parseInt(
      process.env.DB_PORT || process.env.DATABASE_PORT || (dbType === 'postgres' ? '5432' : '3306'),
      10
    ),
    username:
      process.env.DB_USERNAME ||
      process.env.DATABASE_USERNAME ||
      (dbType === 'postgres' ? 'postgres' : 'root'),
    password:
      process.env.DB_PASSWORD ||
      process.env.DATABASE_PASSWORD ||
      (dbType === 'postgres' ? 'password' : 'admin123'),
    database: process.env.DB_DATABASE || process.env.DATABASE_NAME || 'music_app',
    entities: [
      User,
      Song,
      Playlist,
      Favorite,
      Genre,
      UserFollow,
      UserFeed,
      FeedLike,
      FeedComment,
      AdminUser,
      AdminRole,
      AdminPermission,
      AdminRolePermission,
      AdminUserRole,
      SystemConfig,
      AdminLog,
    ],
    synchronize: false, // 暂时禁用自动同步，避免表结构冲突
    logging: process.env.NODE_ENV === 'development',
  }

  // MySQL 特定配置
  if (dbType === 'mysql') {
    config.charset = 'utf8mb4'
    config.timezone = '+08:00'
  }

  return config as TypeOrmModuleOptions
})
