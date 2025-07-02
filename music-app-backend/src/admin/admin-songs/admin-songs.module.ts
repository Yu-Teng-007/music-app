import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Song, User } from '../../entities'
import { AdminSongsController } from './admin-songs.controller'
import { AdminSongsService } from './admin-songs.service'
import { AdminAuthModule } from '../admin-auth/admin-auth.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Song, User]),
    AdminAuthModule,
  ],
  controllers: [AdminSongsController],
  providers: [AdminSongsService],
  exports: [AdminSongsService],
})
export class AdminSongsModule {}
