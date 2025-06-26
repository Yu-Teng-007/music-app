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
} from '../entities'

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'admin123',
    database: process.env.DB_DATABASE || 'music_app',
    entities: [User, Song, Playlist, Favorite, Genre, UserFollow, UserFeed, FeedLike, FeedComment],
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
    charset: 'utf8mb4',
    timezone: '+08:00',
  })
)
