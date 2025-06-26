import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SocialController } from './social.controller'
import { SocialService } from './social.service'
import { RealtimeModule } from '../realtime/realtime.module'
import { UserFollow, UserFeed, FeedLike, FeedComment, User, Song, Playlist } from '../entities'

@Module({
  imports: [
    TypeOrmModule.forFeature([UserFollow, UserFeed, FeedLike, FeedComment, User, Song, Playlist]),
    forwardRef(() => RealtimeModule),
  ],
  controllers: [SocialController],
  providers: [SocialService],
  exports: [SocialService],
})
export class SocialModule {}
