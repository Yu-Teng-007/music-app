/* eslint-disable no-console */
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
  // 华语流行经典
  {
    title: '晴天',
    artist: '周杰伦',
    album: '叶惠美',
    duration: 269,
    genre: '流行',
    year: 2003,
    playCount: 12500,
    lyrics: '故事的小黄花 从出生那年就飘着\n童年的荡秋千 随记忆一直摇到现在',
  },
  {
    title: '稻香',
    artist: '周杰伦',
    album: '魔杰座',
    duration: 223,
    genre: '流行',
    year: 2008,
    playCount: 11200,
    lyrics: '对这个世界如果你有太多的抱怨\n跌倒了就不敢继续往前走',
  },
  {
    title: '青花瓷',
    artist: '周杰伦',
    album: '我很忙',
    duration: 228,
    genre: '流行',
    year: 2007,
    playCount: 10800,
    lyrics: '素胚勾勒出青花笔锋浓转淡\n瓶身描绘的牡丹一如你初妆',
  },

  // 摇滚经典
  {
    title: '夜空中最亮的星',
    artist: '逃跑计划',
    album: '世界',
    duration: 276,
    genre: '摇滚',
    year: 2011,
    playCount: 9800,
    lyrics: '夜空中最亮的星 能否听清\n那仰望的人 心底的孤独和叹息',
  },
  {
    title: '海阔天空',
    artist: 'Beyond',
    album: '乐与怒',
    duration: 326,
    genre: '摇滚',
    year: 1993,
    playCount: 15600,
    lyrics: '今天我 寒夜里看雪飘过\n怀着冷却了的心窝飘远方',
  },
  {
    title: '真的爱你',
    artist: 'Beyond',
    album: 'Beyond IV',
    duration: 267,
    genre: '摇滚',
    year: 1989,
    playCount: 14200,
    lyrics: '无法可修饰的一对手\n带出温暖永远在背后',
  },

  // 民谣精选
  {
    title: '南山南',
    artist: '马頔',
    album: '孤岛',
    duration: 287,
    genre: '民谣',
    year: 2014,
    playCount: 8900,
    lyrics: '你在南方的艳阳里 大雪纷飞\n我在北方的寒夜里 四季如春',
  },
  {
    title: '消愁',
    artist: '毛不易',
    album: '平凡的一天',
    duration: 264,
    genre: '民谣',
    year: 2017,
    playCount: 8200,
    lyrics: '当你走进这欢乐场 背上所有的梦与想\n各色的脸上各色的妆 没人记得你的模样',
  },
  {
    title: '成都',
    artist: '赵雷',
    album: '无法长大',
    duration: 327,
    genre: '民谣',
    year: 2016,
    playCount: 9500,
    lyrics: '让我掉下眼泪的 不止昨夜的酒\n让我依依不舍的 不止你的温柔',
  },

  // 电子音乐
  {
    title: 'Faded',
    artist: 'Alan Walker',
    album: 'Different World',
    duration: 212,
    genre: '电子',
    year: 2015,
    playCount: 13200,
    lyrics: 'You were the shadow to my light\nDid you feel us?',
  },
  {
    title: 'Closer',
    artist: 'The Chainsmokers',
    album: 'Collage',
    duration: 244,
    genre: '电子',
    year: 2016,
    playCount: 11800,
    lyrics: 'So baby pull me closer in the backseat of your Rover',
  },

  // 古典音乐
  {
    title: '月光奏鸣曲',
    artist: '贝多芬',
    album: '钢琴奏鸣曲集',
    duration: 900,
    genre: '古典',
    year: 1801,
    playCount: 6500,
    lyrics: '',
  },
  {
    title: '四季·春',
    artist: '维瓦尔第',
    album: '四季',
    duration: 600,
    genre: '古典',
    year: 1725,
    playCount: 5800,
    lyrics: '',
  },

  // 爵士乐
  {
    title: 'Fly Me to the Moon',
    artist: 'Frank Sinatra',
    album: 'It Might as Well Be Swing',
    duration: 148,
    genre: '爵士',
    year: 1964,
    playCount: 7200,
    lyrics: 'Fly me to the moon\nLet me play among the stars',
  },
  {
    title: 'What a Wonderful World',
    artist: 'Louis Armstrong',
    album: 'What a Wonderful World',
    duration: 137,
    genre: '爵士',
    year: 1967,
    playCount: 8100,
    lyrics: 'I see trees of green, red roses too\nI see them bloom for me and you',
  },

  // 说唱/Hip-Hop
  {
    title: '中国话',
    artist: 'S.H.E',
    album: 'PLAY',
    duration: 198,
    genre: '说唱',
    year: 2007,
    playCount: 7500,
    lyrics: '全世界都在学中国话 孔夫子的话 越来越国际化',
  },
  {
    title: '本草纲目',
    artist: '周杰伦',
    album: '依然范特西',
    duration: 239,
    genre: '说唱',
    year: 2006,
    playCount: 8800,
    lyrics: '如果华佗再世 崇洋都被医治\n外邦来学汉字 激发我民族意识',
  },

  // 蓝调
  {
    title: 'The Thrill Is Gone',
    artist: 'B.B. King',
    album: 'Completely Well',
    duration: 311,
    genre: '蓝调',
    year: 1969,
    playCount: 6200,
    lyrics: 'The thrill is gone\nThe thrill is gone away',
  },

  // 乡村音乐
  {
    title: 'Country Roads',
    artist: 'John Denver',
    album: 'Poems, Prayers & Promises',
    duration: 195,
    genre: '乡村',
    year: 1971,
    playCount: 7800,
    lyrics: 'Country roads, take me home\nTo the place I belong',
  },

  // 新世纪音乐
  {
    title: 'River Flows in You',
    artist: 'Yiruma',
    album: 'First Love',
    duration: 210,
    genre: '新世纪',
    year: 2001,
    playCount: 9200,
    lyrics: '',
  },
  {
    title: 'Kiss the Rain',
    artist: 'Yiruma',
    album: 'From the Yellow Room',
    duration: 280,
    genre: '新世纪',
    year: 2003,
    playCount: 8500,
    lyrics: '',
  },

  // 轻音乐
  {
    title: '天空之城',
    artist: '久石让',
    album: '天空之城 原声带',
    duration: 240,
    genre: '轻音乐',
    year: 1986,
    playCount: 11500,
    lyrics: '',
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
