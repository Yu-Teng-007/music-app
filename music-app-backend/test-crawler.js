const axios = require('axios')

const BASE_URL = 'http://localhost:3001/api'

async function testCrawler() {
  try {
    console.log('🚀 开始测试音乐爬虫功能...\n')

    // 1. 先尝试注册用户（如果已存在会失败，但不影响测试）
    console.log('1. 尝试注册测试用户...')
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        email: '1040851426@qq.com',
        password: 'admin123',
        name: '测试用户',
      })
      console.log('✅ 用户注册成功')
    } catch (error) {
      console.log('ℹ️ 用户可能已存在，继续登录...')
    }

    // 2. 登录获取token
    console.log('2. 正在登录...')
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: '1040851426@qq.com',
      password: 'admin123',
    })

    if (!loginResponse.data.success) {
      console.error('❌ 登录失败:', loginResponse.data.message)
      return
    }

    const token = loginResponse.data.data.accessToken
    console.log('✅ 登录成功')

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }

    // 3. 获取爬虫配置
    console.log('\n3. 获取爬虫配置...')
    const configResponse = await axios.get(`${BASE_URL}/crawler/config`, { headers })
    console.log('✅ 爬虫配置:', JSON.stringify(configResponse.data.data, null, 2))

    // 4. 测试连接
    console.log('\n4. 测试目标网站连接...')
    const testResponse = await axios.post(`${BASE_URL}/crawler/test`, {}, { headers })
    console.log('✅ 连接测试结果:', testResponse.data)

    // 5. 开始爬取（少量数据用于测试）
    console.log('\n5. 开始爬取推荐音乐（5首）...')
    const crawlResponse = await axios.post(
      `${BASE_URL}/crawler/start`,
      {
        type: 'recommended',
        limit: 5,
      },
      { headers }
    )

    console.log('爬取请求结果:', crawlResponse.data)

    if (crawlResponse.data.success) {
      // 6. 监控爬取进度
      console.log('\n6. 监控爬取进度...')
      let progress
      do {
        await new Promise(resolve => setTimeout(resolve, 2000)) // 等待2秒
        const progressResponse = await axios.get(`${BASE_URL}/crawler/progress`, { headers })
        progress = progressResponse.data.data
        console.log(
          `进度: ${progress.progress}% - ${progress.message} (${progress.current}/${progress.total})`
        )
      } while (progress.status === 'running')

      console.log('✅ 爬取完成！最终状态:', progress.status)

      // 7. 查看爬取结果
      console.log('\n7. 查看爬取的歌曲...')
      const songsResponse = await axios.get(
        `${BASE_URL}/songs?limit=10&sortBy=createdAt&sortOrder=DESC`,
        { headers }
      )

      if (
        songsResponse.data.success &&
        songsResponse.data.data &&
        songsResponse.data.data.data &&
        songsResponse.data.data.data.length > 0
      ) {
        console.log('✅ 成功爬取的歌曲:')
        songsResponse.data.data.data.forEach((song, index) => {
          console.log(`${index + 1}. ${song.title} - ${song.artist} (${song.album})`)
          if (song.sourceUrl) {
            console.log(`   来源: ${song.sourceUrl}`)
          }
        })
      } else {
        console.log('⚠️ 没有找到新爬取的歌曲')
        console.log('响应数据结构:', JSON.stringify(songsResponse.data, null, 2))
      }

      // 8. 获取统计信息
      console.log('\n8. 获取爬取统计...')
      const statsResponse = await axios.get(`${BASE_URL}/crawler/stats`, { headers })
      console.log('统计信息:', statsResponse.data.data)
    } else {
      console.error('❌ 爬取失败:', crawlResponse.data.message)
    }
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message)
    if (error.response) {
      console.error('响应数据:', error.response.data)
    }
  }
}

// 运行测试
testCrawler()
  .then(() => {
    console.log('\n🎉 测试完成！')
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 测试失败:', error)
    process.exit(1)
  })
