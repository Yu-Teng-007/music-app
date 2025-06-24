/* eslint-disable no-console */
import { NestFactory } from '@nestjs/core'
import { AppModule } from '../src/app.module'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Playlist } from '../src/entities/playlist.entity'
import { Song } from '../src/entities/song.entity'
import { User } from '../src/entities/user.entity'
import { Repository } from 'typeorm'

interface PlaylistData {
  name: string
  description: string
  isPrivate: boolean
  songTitles: string[] // 歌曲标题列表，用于查找对应的歌曲
}

const playlistsData: PlaylistData[] = [
  {
    name: '华语经典',
    description: '精选华语乐坛经典歌曲，跨越不同年代的音乐记忆',
    isPrivate: false,
    songTitles: ['晴天', '稻香', '青花瓷', '海阔天空', '真的爱你', '红豆', '后来', '匆匆那年'],
  },
  {
    name: '民谣时光',
    description: '温暖的民谣歌曲，适合安静的午后时光',
    isPrivate: false,
    songTitles: ['南山南', '消愁', '成都', '理想', '像我这样的人', '董小姐', '安和桥'],
  },
  {
    name: '摇滚精神',
    description: '燃烧的摇滚乐，释放内心的激情与力量',
    isPrivate: false,
    songTitles: ['夜空中最亮的星', '海阔天空', '真的爱你'],
  },
  {
    name: '电子律动',
    description: '现代电子音乐，感受科技与音乐的完美融合',
    isPrivate: false,
    songTitles: ['Faded', 'Closer'],
  },
  {
    name: '古典雅韵',
    description: '永恒的古典音乐作品，感受艺术的纯粹之美',
    isPrivate: false,
    songTitles: ['月光奏鸣曲', '四季·春'],
  },
  {
    name: '爵士夜晚',
    description: '优雅的爵士乐，营造浪漫的夜晚氛围',
    isPrivate: false,
    songTitles: ['Fly Me to the Moon', 'What a Wonderful World'],
  },
  {
    name: '说唱节拍',
    description: '节奏感强烈的说唱音乐，展现语言的韵律之美',
    isPrivate: false,
    songTitles: ['中国话', '本草纲目'],
  },
  {
    name: '轻音乐盒',
    description: '舒缓的轻音乐和新世纪音乐，放松身心的最佳选择',
    isPrivate: false,
    songTitles: ['River Flows in You', 'Kiss the Rain', '天空之城'],
  },
  {
    name: '流行金曲',
    description: '最受欢迎的流行歌曲合集，紧跟音乐潮流',
    isPrivate: false,
    songTitles: ['光年之外', '修炼爱情', '小幸运', '模特'],
  },
  {
    name: '怀旧经典',
    description: '那些年我们一起听过的歌，满满的回忆杀',
    isPrivate: false,
    songTitles: ['晴天', '红豆', '后来', '匆匆那年', 'Country Roads'],
  },
]

async function seedPlaylists() {
  const app = await NestFactory.createApplicationContext(AppModule)
  const playlistRepository = app.get<Repository<Playlist>>(getRepositoryToken(Playlist))
  const songRepository = app.get<Repository<Song>>(getRepositoryToken(Song))
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User))

  console.log('开始创建默认播放列表...')

  try {
    // 查找管理员用户作为播放列表创建者
    const adminUser = await userRepository.findOne({
      where: { username: 'admin' },
    })

    if (!adminUser) {
      console.log('❌ 未找到管理员用户，请先运行管理员种子文件')
      return
    }

    for (const playlistData of playlistsData) {
      // 检查播放列表是否已存在
      const existingPlaylist = await playlistRepository.findOne({
        where: { name: playlistData.name, userId: adminUser.id },
      })

      if (existingPlaylist) {
        console.log(`播放列表已存在，跳过: ${playlistData.name}`)
        continue
      }

      // 查找歌曲
      const songs: Song[] = []
      for (const songTitle of playlistData.songTitles) {
        const song = await songRepository.findOne({
          where: { title: songTitle },
        })
        if (song) {
          songs.push(song)
        } else {
          console.log(`⚠️  未找到歌曲: ${songTitle}`)
        }
      }

      if (songs.length === 0) {
        console.log(`⚠️  播放列表 ${playlistData.name} 没有找到任何歌曲，跳过创建`)
        continue
      }

      // 生成随机封面图片
      const randomId = Math.floor(Math.random() * 1000) + 1
      const coverUrl = `https://picsum.photos/400/400?random=${randomId}`

      // 创建播放列表
      const newPlaylist = playlistRepository.create({
        name: playlistData.name,
        description: playlistData.description,
        isPrivate: playlistData.isPrivate,
        coverUrl: coverUrl,
        userId: adminUser.id,
        user: adminUser,
        songs: songs,
      })

      await playlistRepository.save(newPlaylist)

      console.log(`✅ 成功创建播放列表: ${playlistData.name} (包含 ${songs.length} 首歌曲)`)
    }

    console.log('🎵 默认播放列表创建完成！')
  } catch (error) {
    console.error('❌ 创建播放列表失败:', error.message)
    throw error
  } finally {
    await app.close()
  }
}

// 运行脚本
if (require.main === module) {
  seedPlaylists().catch(console.error)
}

export { seedPlaylists }
