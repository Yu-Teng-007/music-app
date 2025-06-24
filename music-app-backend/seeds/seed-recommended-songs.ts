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

  // 2023-2024年热门流行歌曲
  {
    title: '孤勇者',
    artist: '陈奕迅',
    album: '孤勇者',
    duration: 254,
    genre: '流行',
    year: 2021,
    playCount: 18500,
    lyrics: '爱你孤身走暗巷 爱你不跪的模样\n爱你对峙过绝望 不肯哭一场',
  },
  {
    title: '本草纲目2.0',
    artist: '周杰伦',
    album: '最伟大的作品',
    duration: 198,
    genre: '流行',
    year: 2022,
    playCount: 16800,
    lyrics: '如果华佗再世 崇洋都被医治\n外邦来学汉字 激发我民族意识',
  },
  {
    title: '最伟大的作品',
    artist: '周杰伦',
    album: '最伟大的作品',
    duration: 225,
    genre: '流行',
    year: 2022,
    playCount: 17200,
    lyrics: '魔杖一挥 就是我的 Style\n调色盘上的颜料 被我画成了诗',
  },
  {
    title: '四季予你',
    artist: '程响',
    album: '四季予你',
    duration: 243,
    genre: '流行',
    year: 2023,
    playCount: 15600,
    lyrics: '春天的花开秋天的风 以及冬天的落阳\n忧郁的青春年少的我 曾经无知的这么想',
  },
  {
    title: '星辰大海',
    artist: '黄霄雲',
    album: '星辰大海',
    duration: 267,
    genre: '流行',
    year: 2023,
    playCount: 14900,
    lyrics: '我愿变成童话里 你爱的那个天使\n张开双手 变成翅膀守护你',
  },
  {
    title: '可可托海的牧羊人',
    artist: '王琪',
    album: '可可托海的牧羊人',
    duration: 298,
    genre: '民谣',
    year: 2020,
    playCount: 19200,
    lyrics: '那夜的雨也没能留住你\n山谷的风它陪着我哭泣',
  },
  {
    title: '白月光与朱砂痣',
    artist: '大籽',
    album: '白月光与朱砂痣',
    duration: 234,
    genre: '流行',
    year: 2021,
    playCount: 17800,
    lyrics: '白月光在照耀 你才想起她的好\n朱砂痣久难消 你是否能知道',
  },
  {
    title: '踏山河',
    artist: '是七叔呢',
    album: '踏山河',
    duration: 276,
    genre: '古风',
    year: 2021,
    playCount: 16500,
    lyrics: '何人在唱 古老的歌\n风沙漫天 胡杨如火',
  },
  {
    title: '飞鸟和蝉',
    artist: '任然',
    album: '飞鸟和蝉',
    duration: 245,
    genre: '流行',
    year: 2020,
    playCount: 15300,
    lyrics: '飞鸟和蝉 不同季节\n你我也是 有缘无分',
  },
  {
    title: '世间美好与你环环相扣',
    artist: '柏松',
    album: '世间美好与你环环相扣',
    duration: 289,
    genre: '民谣',
    year: 2019,
    playCount: 14700,
    lyrics: '想把世间所有的美好 都给你\n想把世间所有的温柔 都给你',
  },

  // 抖音热门歌曲
  {
    title: '大鱼',
    artist: '周深',
    album: '大鱼海棠',
    duration: 278,
    genre: '流行',
    year: 2016,
    playCount: 18900,
    lyrics: '海浪无声将夜幕深深淹没\n漫过天空尽头的角落',
  },
  {
    title: '起风了',
    artist: '买辣椒也用券',
    album: '起风了',
    duration: 321,
    genre: '民谣',
    year: 2017,
    playCount: 22100,
    lyrics: '我曾难自拔于世界之大\n也沉溺于其中梦话',
  },
  {
    title: '少年',
    artist: '梦然',
    album: '少年',
    duration: 234,
    genre: '流行',
    year: 2019,
    playCount: 20500,
    lyrics: '我还是从前那个少年 没有一丝丝改变\n时间只不过是考验 种在心中信念丝毫未减',
  },
  {
    title: '芒种',
    artist: '音阙诗听',
    album: '芒种',
    duration: 267,
    genre: '古风',
    year: 2019,
    playCount: 17600,
    lyrics: '一想到你我就 wu\n空恨别梦久 wu\n烧去纸灰埋烟柳',
  },
  {
    title: '下山',
    artist: '要不要买菜',
    album: '下山',
    duration: 198,
    genre: '古风',
    year: 2020,
    playCount: 19800,
    lyrics: '我下山是为了拯救你\n不是为了拯救世界',
  },

  // 国际流行音乐
  {
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    album: '÷ (Divide)',
    duration: 233,
    genre: '流行',
    year: 2017,
    playCount: 25600,
    lyrics: "The club isn't the best place to find a lover\nSo the bar is where I go",
  },
  {
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 200,
    genre: '流行',
    year: 2019,
    playCount: 24300,
    lyrics: "I've been tryna call\nI've been on my own for long enough",
  },
  {
    title: 'Stay',
    artist: 'The Kid LAROI & Justin Bieber',
    album: 'Stay',
    duration: 141,
    genre: '流行',
    year: 2021,
    playCount: 23800,
    lyrics:
      "I do the same thing I told you that I never would\nI told you I'd change, even when I knew I never could",
  },
  {
    title: 'As It Was',
    artist: 'Harry Styles',
    album: "Harry's House",
    duration: 167,
    genre: '流行',
    year: 2022,
    playCount: 22900,
    lyrics: "Holdin' me back\nGravity's holdin' me back",
  },
  {
    title: 'Anti-Hero',
    artist: 'Taylor Swift',
    album: 'Midnights',
    duration: 200,
    genre: '流行',
    year: 2022,
    playCount: 21700,
    lyrics:
      'I have this thing where I get older but just never wiser\nMidnights become my afternoons',
  },

  // 电子舞曲
  {
    title: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    duration: 203,
    genre: '电子',
    year: 2020,
    playCount: 20800,
    lyrics: 'If you wanna run away with me\nI know a galaxy and I can take you for a ride',
  },
  {
    title: "Don't Start Now",
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    duration: 183,
    genre: '电子',
    year: 2019,
    playCount: 19500,
    lyrics:
      "If you don't wanna see me dancing with somebody\nIf you wanna believe that anything could stop me",
  },
  {
    title: 'Peaches',
    artist: 'Justin Bieber ft. Daniel Caesar & Giveon',
    album: 'Justice',
    duration: 198,
    genre: '流行',
    year: 2021,
    playCount: 18200,
    lyrics: 'I got my peaches out in Georgia\nI get my weed from California',
  },

  // 华语说唱/Hip-Hop
  {
    title: '野狼Disco',
    artist: '宝石Gem',
    album: '野狼Disco',
    duration: 234,
    genre: '说唱',
    year: 2019,
    playCount: 21500,
    lyrics: '心里的花 我想要带你回家\n在那深夜酒吧 哪管它是真是假',
  },
  {
    title: '大田后生仔',
    artist: '林启得',
    album: '大田后生仔',
    duration: 267,
    genre: '说唱',
    year: 2021,
    playCount: 18700,
    lyrics: '我是大田后生仔 爱拼才会赢\n不怕风雨来 勇敢向前行',
  },
  {
    title: '万疆',
    artist: '李玉刚',
    album: '万疆',
    duration: 298,
    genre: '古风',
    year: 2020,
    playCount: 16900,
    lyrics: '红日升在东方 其大道满霞光\n我何其幸 生于你怀 承一脉血流淌',
  },

  // K-Pop热门
  {
    title: 'Dynamite',
    artist: 'BTS',
    album: 'BE',
    duration: 199,
    genre: '流行',
    year: 2020,
    playCount: 28900,
    lyrics:
      "Cause I-I-I'm in the stars tonight\nSo watch me bring the fire and set the night alight",
  },
  {
    title: 'Butter',
    artist: 'BTS',
    album: 'Butter',
    duration: 164,
    genre: '流行',
    year: 2021,
    playCount: 27600,
    lyrics: 'Smooth like butter\nLike a criminal undercover',
  },
  {
    title: 'How You Like That',
    artist: 'BLACKPINK',
    album: 'THE ALBUM',
    duration: 181,
    genre: '流行',
    year: 2020,
    playCount: 26300,
    lyrics: 'How you like that, that, that, that, that\nHow you like that, that, that, that, that',
  },
  {
    title: 'Next Level',
    artist: 'aespa',
    album: 'Savage',
    duration: 210,
    genre: '流行',
    year: 2021,
    playCount: 24800,
    lyrics: "I'm on the next level\nYeah, I'm on the next level",
  },

  // 日语流行音乐
  {
    title: '炎',
    artist: 'LiSA',
    album: '鬼灭之刃',
    duration: 276,
    genre: '流行',
    year: 2020,
    playCount: 23400,
    lyrics: '強くなれる理由を知った\n僕を連れて進め',
  },
  {
    title: '紅蓮華',
    artist: 'LiSA',
    album: '鬼灭之刃',
    duration: 243,
    genre: '流行',
    year: 2019,
    playCount: 22700,
    lyrics: '強くなれる理由を知った\n僕を連れて進め',
  },
  {
    title: 'Lemon',
    artist: '米津玄師',
    album: 'Lemon',
    duration: 287,
    genre: '流行',
    year: 2018,
    playCount: 21900,
    lyrics: '夢ならばどれほどよかったでしょう\n未だにあなたのことを夢にみる',
  },

  // 独立音乐/Indie
  {
    title: '我记得',
    artist: '赵雷',
    album: '无法长大',
    duration: 312,
    genre: '民谣',
    year: 2016,
    playCount: 13800,
    lyrics: '我记得那些年 我们一起走过的路\n我记得那些话 你曾经对我说过',
  },
  {
    title: '斑马斑马',
    artist: '宋冬野',
    album: '安和桥北',
    duration: 298,
    genre: '民谣',
    year: 2013,
    playCount: 12600,
    lyrics: '斑马斑马 你不要睡着啦\n再给我看看你受伤的尾巴',
  },
  {
    title: '关于郑州的记忆',
    artist: '李志',
    album: '梵高先生',
    duration: 345,
    genre: '民谣',
    year: 2005,
    playCount: 11400,
    lyrics: '关于郑州的记忆 都是美好的\n关于郑州的记忆 都是温暖的',
  },

  // 经典老歌
  {
    title: '月亮代表我的心',
    artist: '邓丽君',
    album: '岛国之情歌第六集',
    duration: 198,
    genre: '流行',
    year: 1977,
    playCount: 18600,
    lyrics: '你问我爱你有多深 我爱你有几分\n我的情也真 我的爱也真 月亮代表我的心',
  },
  {
    title: '甜蜜蜜',
    artist: '邓丽君',
    album: '甜蜜蜜',
    duration: 176,
    genre: '流行',
    year: 1979,
    playCount: 17800,
    lyrics: '甜蜜蜜 你笑得甜蜜蜜\n好像花儿开在春风里 开在春风里',
  },
  {
    title: '上海滩',
    artist: '叶丽仪',
    album: '上海滩',
    duration: 234,
    genre: '流行',
    year: 1980,
    playCount: 16500,
    lyrics: '浪奔 浪流 万里涛涛江水永不休\n淘尽了 世间事 混作滔滔一片潮流',
  },

  // 网络热门歌曲
  {
    title: '学猫叫',
    artist: '小潘潘',
    album: '学猫叫',
    duration: 198,
    genre: '流行',
    year: 2018,
    playCount: 19200,
    lyrics: '我们一起学猫叫 一起喵喵喵喵喵\n在你面前撒个娇 哎呦喵喵喵喵喵',
  },
  {
    title: '沙漠骆驼',
    artist: '展展与罗罗',
    album: '沙漠骆驼',
    duration: 267,
    genre: '民谣',
    year: 2017,
    playCount: 18400,
    lyrics: '我要穿越这片沙漠 找寻真的自我\n身边只有一匹骆驼陪我',
  },
  {
    title: '38度6',
    artist: '黑龙',
    album: '38度6',
    duration: 234,
    genre: '流行',
    year: 2018,
    playCount: 17100,
    lyrics: '38度6的高烧 还在念着你的好\n38度6的高烧 求求你别再跑',
  },

  // 治愈系音乐
  {
    title: '夜的钢琴曲五',
    artist: '石进',
    album: '夜的钢琴曲',
    duration: 298,
    genre: '轻音乐',
    year: 2010,
    playCount: 15600,
    lyrics: '',
  },
  {
    title: '风居住的街道',
    artist: '矶村由纪子',
    album: '风居住的街道',
    duration: 267,
    genre: '轻音乐',
    year: 2003,
    playCount: 14800,
    lyrics: '',
  },
  {
    title: 'Summer',
    artist: '久石让',
    album: '菊次郎的夏天',
    duration: 198,
    genre: '轻音乐',
    year: 1999,
    playCount: 16200,
    lyrics: '',
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
