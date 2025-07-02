import { Module } from '@nestjs/common'
import { AdminAuthModule } from './admin-auth/admin-auth.module'
import { AdminUsersModule } from './admin-users/admin-users.module'
import { AdminSongsModule } from './admin-songs/admin-songs.module'
import { AdminAnalyticsModule } from './admin-analytics/admin-analytics.module'

@Module({
  imports: [
    AdminAuthModule,
    AdminUsersModule,
    AdminSongsModule,
    AdminAnalyticsModule,
  ],
  exports: [
    AdminAuthModule,
    AdminUsersModule,
    AdminSongsModule,
    AdminAnalyticsModule,
  ],
})
export class AdminModule {}
