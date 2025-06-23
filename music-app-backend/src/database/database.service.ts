import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Song } from '../entities/song.entity'
import { seedSongs } from '../seeds/songs.seed'

@Injectable()
export class DatabaseService implements OnModuleInit {
  constructor(
    @InjectRepository(Song)
    private songRepository: Repository<Song>
  ) {}

  async onModuleInit() {
    await this.seedDatabase()
  }

  private async seedDatabase() {
    try {
      // 检查是否已有数据
      const songCount = await this.songRepository.count()

      if (songCount === 0) {
        console.log('正在初始化数据库数据...')

        // 插入种子歌曲数据
        for (const songData of seedSongs) {
          const song = this.songRepository.create(songData)
          await this.songRepository.save(song)
        }

        console.log(`已成功插入 ${seedSongs.length} 首歌曲数据`)
      }
    } catch (error) {
      console.error('数据库初始化失败:', error)
    }
  }
}
