import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User, Song, Playlist, History, Comment, UserFeed } from '../../entities'
import { AdminAnalyticsController } from './admin-analytics.controller'
import { AdminAnalyticsService } from './admin-analytics.service'
import { AdminAuthModule } from '../admin-auth/admin-auth.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Song, Playlist, History, Comment, UserFeed]),
    AdminAuthModule,
  ],
  controllers: [AdminAnalyticsController],
  providers: [AdminAnalyticsService],
  exports: [AdminAnalyticsService],
})
export class AdminAnalyticsModule {}
