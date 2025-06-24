import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Song } from '../entities/song.entity'

@Injectable()
export class DatabaseService implements OnModuleInit {
  constructor(
    @InjectRepository(Song)
    private songRepository: Repository<Song>
  ) {}

  async onModuleInit() {
    await this.initializeDatabase()
  }

  private async initializeDatabase() {
    try {
      // 检查数据库连接
      const songCount = await this.songRepository.count()

      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log(`数据库连接成功，当前歌曲数量: ${songCount}`)

        if (songCount === 0) {
          // eslint-disable-next-line no-console
          console.log('数据库为空，请使用爬虫服务获取歌曲数据')
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('数据库初始化失败:', error)
    }
  }
}
