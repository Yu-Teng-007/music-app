import { NestFactory } from '@nestjs/core'
import { AppModule } from '../src/app.module'
import { SongsService } from '../src/songs/songs.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Song } from '../src/entities/song.entity'
import { Repository } from 'typeorm'

interface SeedSongData {
  title: string
  artist: string
  album: string
  duration: number
  genre: string
  year: number
  playCount: number
  lyrics?: string
}

const recommendedSongs: SeedSongData[] = [
  {
    title: '晴天',
    artist: '周杰伦',
    album: '叶惠美',
    duration: 269,
    genre: '流行',
    year: 2003,
    playCount: 9200,
    lyrics: '故事的小黄花 从出生那年就飘着\n童年的荡秋千 随记忆一直摇到现在',
  },
  {
    title: '夜空中最亮的星',
    artist: '逃跑计划',
    album: '世界',
    duration: 276,
    genre: '摇滚',
    year: 2011,
    playCount: 8500,
    lyrics: '夜空中最亮的星 能否听清\n那仰望的人 心底的孤独和叹息',
  },
  {
    title: '南山南',
    artist: '马頔',
    album: '孤岛',
    duration: 287,
    genre: '民谣',
    year: 2014,
    playCount: 7800,
    lyrics: '你在南方的艳阳里 大雪纷飞\n我在北方的寒夜里 四季如春',
  },
  {
    title: '消愁',
    artist: '毛不易',
    album: '平凡的一天',
    duration: 264,
    genre: '民谣',
    year: 2017,
    playCount: 7200,
    lyrics: '当你走进这欢乐场 背上所有的梦与想\n各色的脸上各色的妆 没人记得你的模样',
  },
  {
    title: '红豆',
    artist: '王菲',
    album: '唱游',
    duration: 201,
    genre: '流行',
    year: 1998,
    playCount: 6800,
    lyrics: '还没好好的感受 雪花绽放的气候\n我们一起颤抖 会更明白什么是温柔',
  },
  {
    title: '光年之外',
    artist: '邓紫棋',
    album: '新的心跳',
    duration: 245,
    genre: '流行',
    year: 2017,
    playCount: 6500,
    lyrics: '感受停在我发端的指尖\n如何瞬间 冻结时间',
  },
  {
    title: '理想',
    artist: '赵雷',
    album: '赵小雷',
    duration: 312,
    genre: '民谣',
    year: 2016,
    playCount: 6200,
    lyrics: '理想总是遥不可及 是不是应该放弃\n花开花落又是雨季 春天啊你在哪里',
  },
  {
    title: '修炼爱情',
    artist: '林俊杰',
    album: '新地球',
    duration: 267,
    genre: '流行',
    year: 2014,
    playCount: 5900,
    lyrics: '爱情不是想象 或者一厢情愿就可以\n我们都还在学习 给彼此空间和信任',
  },
  {
    title: '像我这样的人',
    artist: '毛不易',
    album: '平凡的一天',
    duration: 246,
    genre: '民谣',
    year: 2017,
    playCount: 5600,
    lyrics: '像我这样优秀的人 本该灿烂过一生\n怎么二十多年到头来 还在人海里浮沉',
  },
  {
    title: '后来',
    artist: '刘若英',
    album: '我等你',
    duration: 258,
    genre: '流行',
    year: 1999,
    playCount: 5300,
    lyrics: '后来我总算学会了如何去爱\n可惜你早已远去 消失在人海',
  },
  {
    title: '匆匆那年',
    artist: '王菲',
    album: '匆匆那年',
    duration: 241,
    genre: '流行',
    year: 2014,
    playCount: 5000,
    lyrics: '匆匆那年我们 究竟说了几遍 再见之后再拖延\n可惜谁有没有 爱过不是一场 七情上面的雄辩',
  },
  {
    title: '小幸运',
    artist: '田馥甄',
    album: '我的少女时代',
    duration: 268,
    genre: '流行',
    year: 2015,
    playCount: 4800,
    lyrics: '我听见雨滴落在青青草地\n我听见远方下课钟声响起',
  },
  {
    title: '董小姐',
    artist: '宋冬野',
    album: '安和桥北',
    duration: 295,
    genre: '民谣',
    year: 2013,
    playCount: 4500,
    lyrics: '董小姐 你从没忘记你的微笑\n就算你和我一样 渴望着衰老',
  },
  {
    title: '安和桥',
    artist: '宋冬野',
    album: '安和桥北',
    duration: 278,
    genre: '民谣',
    year: 2013,
    playCount: 4200,
    lyrics: '让我再看你一遍 从南到北\n像是被五环路蒙住的双眼',
  },
  {
    title: '模特',
    artist: '李荣浩',
    album: '模特',
    duration: 234,
    genre: '流行',
    year: 2013,
    playCount: 3900,
    lyrics: '我不是你的模特 不是你想象中的我\n我不是你的模特 不要给我设定规则',
  },
]

async function seedRecommendedSongs() {
  const app = await NestFactory.createApplicationContext(AppModule)
  const songRepository = app.get<Repository<Song>>(getRepositoryToken(Song))

  console.log('开始添加推荐歌曲数据...')

  for (const songData of recommendedSongs) {
    try {
      // 检查歌曲是否已存在
      const existingSong = await songRepository.findOne({
        where: {
          title: songData.title,
          artist: songData.artist,
        },
      })

      if (existingSong) {
        console.log(`歌曲已存在，跳过: ${songData.title} - ${songData.artist}`)
        continue
      }

      // 生成随机封面图片
      const randomId = Math.floor(Math.random() * 1000) + 1
      const coverUrl = `https://picsum.photos/300/300?random=${randomId}`

      // 创建歌曲
      const newSong = songRepository.create({
        title: songData.title,
        artist: songData.artist,
        album: songData.album,
        duration: songData.duration,
        coverUrl: coverUrl,
        audioUrl: '/uploads/music/default-song.mp3',
        genre: songData.genre,
        year: songData.year,
        playCount: songData.playCount,
        lyrics: songData.lyrics,
        fileSize: Math.floor(Math.random() * 5000000) + 3000000, // 3-8MB
        originalFileName: `${songData.title}-${songData.artist}.mp3`,
      })

      await songRepository.save(newSong)

      console.log(`成功添加歌曲: ${songData.title} - ${songData.artist}`)
    } catch (error) {
      console.error(`添加歌曲失败: ${songData.title} - ${songData.artist}`, error.message)
    }
  }

  console.log('推荐歌曲数据添加完成！')
  await app.close()
}

// 运行脚本
if (require.main === module) {
  seedRecommendedSongs().catch(console.error)
}

export { seedRecommendedSongs }
