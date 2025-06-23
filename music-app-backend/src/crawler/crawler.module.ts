import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CrawlerController } from './crawler.controller'
import { MusicCrawlerService } from './music-crawler.service'
import { MultiSiteCrawlerService } from './services/multi-site-crawler.service'
import { DuplicateDetectionService } from './services/duplicate-detection.service'
import { Ve33Adapter } from './adapters/ve33-adapter'
import { Song } from '../entities/song.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Song])],
  controllers: [CrawlerController],
  providers: [MusicCrawlerService, MultiSiteCrawlerService, DuplicateDetectionService, Ve33Adapter],
  exports: [MusicCrawlerService, MultiSiteCrawlerService, DuplicateDetectionService],
})
export class CrawlerModule {}
