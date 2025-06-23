<template>
  <div class="test-api-view">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-white mb-8">API 测试页面</h1>

      <!-- 测试结果显示 -->
      <div class="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 class="text-xl font-semibold text-white mb-4">测试结果</h2>
        <div class="space-y-2">
          <div
            v-for="(result, index) in testResults"
            :key="index"
            :class="[
              'p-3 rounded',
              result.success ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200',
            ]"
          >
            <div class="font-medium">{{ result.name }}</div>
            <div class="text-sm">{{ result.message }}</div>
            <div v-if="result.data" class="text-xs mt-2 opacity-75">
              数据: {{ JSON.stringify(result.data, null, 2).substring(0, 200) }}...
            </div>
          </div>
        </div>
      </div>

      <!-- 测试按钮 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          @click="testBasicConnection"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
        >
          测试基本连接
        </button>

        <button
          @click="testGetSongs"
          class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
        >
          获取歌曲列表
        </button>

        <button
          @click="testGetRecommended"
          class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors"
        >
          获取推荐歌曲
        </button>

        <button
          @click="testGetPopular"
          class="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded transition-colors"
        >
          获取热门歌曲
        </button>

        <button
          @click="testSearchSongs"
          class="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded transition-colors"
        >
          搜索歌曲
        </button>

        <button
          @click="testGetPlaylists"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded transition-colors"
        >
          获取播放列表
        </button>

        <button
          @click="testRegister"
          class="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded transition-colors"
        >
          测试注册
        </button>

        <button
          @click="testLogin"
          class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
        >
          测试登录
        </button>

        <button
          @click="runAllTests"
          class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors col-span-full"
        >
          运行所有测试
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { apiClient, authApi, musicApi, playlistApi } from '@/services/api'

interface TestResult {
  name: string
  success: boolean
  message: string
  data?: any
}

const testResults = ref<TestResult[]>([])

const addResult = (result: TestResult) => {
  testResults.value.unshift(result)
  if (testResults.value.length > 10) {
    testResults.value = testResults.value.slice(0, 10)
  }
}

const testBasicConnection = async () => {
  try {
    const response = await apiClient.get('/')
    addResult({
      name: '基本连接测试',
      success: true,
      message: '连接成功',
      data: response.data,
    })
  } catch (error: any) {
    addResult({
      name: '基本连接测试',
      success: false,
      message: error.message || '连接失败',
    })
  }
}

const testGetSongs = async () => {
  try {
    const data = await musicApi.getSongs({ limit: 5 })
    addResult({
      name: '获取歌曲列表',
      success: true,
      message: `成功获取 ${data.data?.length || 0} 首歌曲`,
      data: data.data,
    })
  } catch (error: any) {
    addResult({
      name: '获取歌曲列表',
      success: false,
      message: error.message || '获取失败',
    })
  }
}

const testGetRecommended = async () => {
  try {
    const data = await musicApi.getRecommendedSongs(5)
    addResult({
      name: '获取推荐歌曲',
      success: true,
      message: `成功获取 ${data?.length || 0} 首推荐歌曲`,
      data: data,
    })
  } catch (error: any) {
    addResult({
      name: '获取推荐歌曲',
      success: false,
      message: error.message || '获取失败',
    })
  }
}

const testGetPopular = async () => {
  try {
    const data = await musicApi.getPopularSongs(5)
    addResult({
      name: '获取热门歌曲',
      success: true,
      message: `成功获取 ${data?.length || 0} 首热门歌曲`,
      data: data,
    })
  } catch (error: any) {
    addResult({
      name: '获取热门歌曲',
      success: false,
      message: error.message || '获取失败',
    })
  }
}

const testSearchSongs = async () => {
  try {
    const data = await musicApi.searchSongs('夜曲', 5)
    addResult({
      name: '搜索歌曲',
      success: true,
      message: `搜索"夜曲"找到 ${data?.length || 0} 首歌曲`,
      data: data,
    })
  } catch (error: any) {
    addResult({
      name: '搜索歌曲',
      success: false,
      message: error.message || '搜索失败',
    })
  }
}

const testGetPlaylists = async () => {
  try {
    const data = await playlistApi.getPublicPlaylists(5)
    addResult({
      name: '获取播放列表',
      success: true,
      message: `成功获取 ${data?.length || 0} 个播放列表`,
      data: data,
    })
  } catch (error: any) {
    addResult({
      name: '获取播放列表',
      success: false,
      message: error.message || '获取失败',
    })
  }
}

const testRegister = async () => {
  try {
    const randomEmail = `test${Date.now()}@example.com`
    const data = await authApi.register({
      email: randomEmail,
      name: '测试用户',
      password: '123456',
      confirmPassword: '123456',
    })
    addResult({
      name: '用户注册',
      success: true,
      message: `注册成功: ${randomEmail}`,
      data: { user: data.user },
    })
  } catch (error: any) {
    addResult({
      name: '用户注册',
      success: false,
      message: error.message || '注册失败',
    })
  }
}

const testLogin = async () => {
  try {
    // 先注册一个用户
    const randomEmail = `test${Date.now()}@example.com`
    await authApi.register({
      email: randomEmail,
      name: '测试用户',
      password: '123456',
      confirmPassword: '123456',
    })

    // 然后登录
    const data = await authApi.login({
      email: randomEmail,
      password: '123456',
    })

    addResult({
      name: '用户登录',
      success: true,
      message: `登录成功: ${randomEmail}`,
      data: { user: data.user },
    })
  } catch (error: any) {
    addResult({
      name: '用户登录',
      success: false,
      message: error.message || '登录失败',
    })
  }
}

const runAllTests = async () => {
  testResults.value = []

  const tests = [
    testBasicConnection,
    testGetSongs,
    testGetRecommended,
    testGetPopular,
    testSearchSongs,
    testGetPlaylists,
    testRegister,
    testLogin,
  ]

  for (const test of tests) {
    await test()
    // 添加小延迟避免请求过快
    await new Promise(resolve => setTimeout(resolve, 500))
  }
}
</script>

<style scoped>
.test-api-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 50%, #581c87 100%);
}
</style>
