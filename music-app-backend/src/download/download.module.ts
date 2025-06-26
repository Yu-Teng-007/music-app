import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DownloadController } from './download.controller'
import { DownloadService } from './download.service'
import { Download, DownloadCache, UserStorage, Song, User } from '../entities'

@Module({
  imports: [TypeOrmModule.forFeature([Download, DownloadCache, UserStorage, Song, User])],
  controllers: [DownloadController],
  providers: [DownloadService],
  exports: [DownloadService],
})
export class DownloadModule {}
