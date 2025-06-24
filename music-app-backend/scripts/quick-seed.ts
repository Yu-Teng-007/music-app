import { NestFactory } from '@nestjs/core'
import { AppModule } from '../src/app.module'
import { getRepositoryToken } from '@nestjs/typeorm'
import { User, Song, Playlist, Genre } from '../src/entities'
import { Repository } from 'typeorm'

/**
 * 快速种子文件 - 用于开发环境快速初始化基础数据
 * 只创建最基本的数据，适合开发测试使用
 */
async function quickSeed() {
  const app = await NestFactory.createApplicationContext(AppModule)
  
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User))
  const songRepository = app.get<Repository<Song>>(getRepositoryToken(Song))
  const playlistRepository = app.get<Repository<Playlist>>(getRepositoryToken(Playlist))
  const genreRepository = app.get<Repository<Genre>>(getRepositoryToken(Genre))

  console.log('🚀 快速种子文件初始化开始...')

  try {
    // 检查是否已有数据
    const userCount = await userRepository.count()
    const songCount = await songRepository.count()
    
    if (userCount > 0 || songCount > 0) {
      console.log('📊 数据库已有数据，跳过快速初始化')
      console.log(`  用户数量: ${userCount}`)
      console.log(`  歌曲数量: ${songCount}`)
      await app.close()
      return
    }

    // 1. 创建管理员用户
    console.log('👤 创建管理员用户...')
    const bcrypt = await import('bcryptjs')
    const hashedPassword = await bcrypt.hash('admin123456', 12)
    
    const adminUser = userRepository.create({
      email: 'admin@musicapp.com',
      username: 'admin',
      name: '系统管理员',
      password: hashedPassword,
      role: 'admin' as any,
      isActive: true,
    })
    await userRepository.save(adminUser)

    // 2. 创建基础音乐分类
    console.log('🎵 创建基础音乐分类...')
    const basicGenres = [
      { name: '流行', color: '#FF6B6B', icon: '🎵' },
      { name: '摇滚', color: '#4ECDC4', icon: '🎸' },
      { name: '民谣', color: '#45B7D1', icon: '🎻' },
      { name: '电子', color: '#96CEB4', icon: '🎛️' },
      { name: '古典', color: '#FFEAA7', icon: '🎼' },
    ]

    for (const genreData of basicGenres) {
      const genre = genreRepository.create({
        name: genreData.name,
        description: `${genreData.name}音乐`,
        color: genreData.color,
        icon: genreData.icon,
        isActive: true,
      })
      await genreRepository.save(genre)
    }

    // 3. 创建示例歌曲
    console.log('🎶 创建示例歌曲...')
    const sampleSongs = [
      {
        title: '晴天',
        artist: '周杰伦',
        album: '叶惠美',
        duration: 269,
        genre: '流行',
        year: 2003,
        playCount: 12500,
      },
      {
        title: '夜空中最亮的星',
        artist: '逃跑计划',
        album: '世界',
        duration: 276,
        genre: '摇滚',
        year: 2011,
        playCount: 9800,
      },
      {
        title: '南山南',
        artist: '马頔',
        album: '孤岛',
        duration: 287,
        genre: '民谣',
        year: 2014,
        playCount: 8900,
      },
    ]

    const createdSongs: Song[] = []
    for (const songData of sampleSongs) {
      const song = songRepository.create({
        title: songData.title,
        artist: songData.artist,
        album: songData.album,
        duration: songData.duration,
        coverUrl: `https://picsum.photos/300/300?random=${Math.floor(Math.random() * 1000)}`,
        audioUrl: '/uploads/music/default-song.mp3',
        genre: songData.genre,
        year: songData.year,
        playCount: songData.playCount,
        fileSize: Math.floor(Math.random() * 5000000) + 3000000,
        originalFileName: `${songData.title}-${songData.artist}.mp3`,
      })
      const savedSong = await songRepository.save(song)
      createdSongs.push(savedSong)
    }

    // 4. 创建示例播放列表
    console.log('📋 创建示例播放列表...')
    const playlist = playlistRepository.create({
      name: '精选推荐',
      description: '系统精选的优质音乐',
      isPrivate: false,
      coverUrl: `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}`,
      userId: adminUser.id,
      user: adminUser,
      songs: createdSongs,
    })
    await playlistRepository.save(playlist)

    console.log('✅ 快速种子文件初始化完成！')
    console.log('📊 创建的数据:')
    console.log(`  👤 管理员用户: 1`)
    console.log(`  🎵 音乐分类: ${basicGenres.length}`)
    console.log(`  🎶 示例歌曲: ${sampleSongs.length}`)
    console.log(`  📋 播放列表: 1`)
    console.log('\n🔐 管理员登录信息:')
    console.log('  📧 邮箱: admin@musicapp.com')
    console.log('  👤 用户名: admin')
    console.log('  🔑 密码: admin123456')

  } catch (error) {
    console.error('❌ 快速种子文件初始化失败:', error.message)
    throw error
  } finally {
    await app.close()
  }
}

// 运行脚本
if (require.main === module) {
  quickSeed().catch(console.error)
}

export { quickSeed }
