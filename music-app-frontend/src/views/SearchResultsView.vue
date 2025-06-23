<template>
  <div class="search-results-view">
    <!-- 搜索头部 -->
    <div class="search-header">
      <div class="search-bar">
        <Search :size="20" class="search-icon" />
        <input
          type="text"
          v-model="searchQuery"
          placeholder="搜索歌曲、艺人、专辑、歌单"
          class="search-input"
          @keyup.enter="performSearch"
        />
        <button v-if="searchQuery" @click="clearSearch" class="clear-btn">
          <X :size="16" />
        </button>
      </div>
      <button @click="performSearch" class="search-btn" :disabled="!searchQuery.trim()">
        搜索
      </button>
    </div>

    <!-- 搜索结果 -->
    <div v-if="hasSearched" class="search-content">
      <!-- 结果统计 -->
      <div class="search-stats">
        <span v-if="searchKeyword">搜索"{{ searchKeyword }}"的结果</span>
        <span class="result-count">共找到 {{ totalResults }} 个结果</span>
      </div>

      <!-- 分类标签 -->
      <div class="result-tabs">
        <button
          v-for="tab in searchTabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
        >
          {{ tab.label }}
          <span v-if="getTabCount(tab.key) > 0" class="tab-count">{{ getTabCount(tab.key) }}</span>
        </button>
      </div>

      <!-- 筛选和排序 -->
      <div class="filters-section" v-if="activeTab === 'songs'">
        <div class="filter-group">
          <label>流派：</label>
          <select v-model="selectedGenre" @change="applyFilters">
            <option value="">全部</option>
            <option v-for="genre in genres" :key="genre" :value="genre">{{ genre }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>排序：</label>
          <select v-model="sortBy" @change="applyFilters">
            <option value="relevance">相关度</option>
            <option value="playCount">播放量</option>
            <option value="createdAt">发布时间</option>
            <option value="title">歌曲名称</option>
          </select>
        </div>
      </div>

      <!-- 搜索结果内容 -->
      <div class="results-container">
        <!-- 歌曲结果 -->
        <div v-if="activeTab === 'songs'" class="songs-results">
          <div v-if="loading" class="loading">搜索中...</div>
          <div v-else-if="filteredSongs.length === 0" class="no-results">
            <Music :size="48" />
            <p>没有找到相关歌曲</p>
          </div>
          <div v-else class="songs-list">
            <div
              v-for="song in filteredSongs"
              :key="song.id"
              class="song-item"
              @click="playSong(song)"
            >
              <img :src="song.coverUrl" :alt="song.title" class="song-cover" />
              <div class="song-info">
                <h3 class="song-title">{{ song.title }}</h3>
                <p class="song-artist">{{ song.artist }}</p>
                <p class="song-album">{{ song.album }}</p>
              </div>
              <div class="song-meta">
                <span class="song-duration">{{ formatDuration(song.duration) }}</span>
                <button class="play-btn" @click.stop="playSong(song)">
                  <Play :size="16" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 艺人结果 -->
        <div v-if="activeTab === 'artists'" class="artists-results">
          <div v-if="artists.length === 0" class="no-results">
            <User :size="48" />
            <p>没有找到相关艺人</p>
          </div>
          <div v-else class="artists-list">
            <div v-for="artist in artists" :key="artist" class="artist-item">
              <div class="artist-avatar">{{ artist.charAt(0) }}</div>
              <div class="artist-info">
                <h3 class="artist-name">{{ artist }}</h3>
                <p class="artist-songs">{{ getArtistSongCount(artist) }} 首歌曲</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 专辑结果 -->
        <div v-if="activeTab === 'albums'" class="albums-results">
          <div v-if="albums.length === 0" class="no-results">
            <Disc :size="48" />
            <p>没有找到相关专辑</p>
          </div>
          <div v-else class="albums-list">
            <div v-for="album in albums" :key="album.name" class="album-item">
              <img :src="album.coverUrl" :alt="album.name" class="album-cover" />
              <div class="album-info">
                <h3 class="album-name">{{ album.name }}</h3>
                <p class="album-artist">{{ album.artist }}</p>
                <p class="album-songs">{{ album.songCount }} 首歌曲</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 歌单结果 -->
        <div v-if="activeTab === 'playlists'" class="playlists-results">
          <div v-if="playlists.length === 0" class="no-results">
            <ListMusic :size="48" />
            <p>没有找到相关歌单</p>
          </div>
          <div v-else class="playlists-list">
            <div v-for="playlist in playlists" :key="playlist.id" class="playlist-item">
              <img :src="playlist.coverUrl" :alt="playlist.name" class="playlist-cover" />
              <div class="playlist-info">
                <h3 class="playlist-name">{{ playlist.name }}</h3>
                <p class="playlist-creator">{{ playlist.creator }}</p>
                <p class="playlist-songs">{{ playlist.songCount }} 首歌曲</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="page-btn">
          上一页
        </button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          下一页
        </button>
      </div>
    </div>

    <!-- 搜索历史 -->
    <div v-else class="search-history">
      <h3>搜索历史</h3>
      <div v-if="searchHistory.length === 0" class="no-history">
        <Search :size="48" />
        <p>暂无搜索历史</p>
      </div>
      <div v-else class="history-list">
        <div
          v-for="(item, index) in searchHistory"
          :key="index"
          class="history-item"
          @click="searchFromHistory(item)"
        >
          <Clock :size="16" />
          <span>{{ item }}</span>
          <button @click.stop="removeFromHistory(index)" class="remove-btn">
            <X :size="14" />
          </button>
        </div>
      </div>
      <button v-if="searchHistory.length > 0" @click="clearHistory" class="clear-history-btn">
        清空历史
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMusicStore } from '@/stores/music'
import { musicApi } from '@/services'
import type { Song } from '@/stores/music'
import { Search, X, Play, Music, User, Disc, ListMusic, Clock } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const musicStore = useMusicStore()

// 搜索状态
const searchQuery = ref('')
const searchKeyword = ref('')
const hasSearched = ref(false)
const loading = ref(false)
const activeTab = ref('songs')

// 搜索结果
const songs = ref<Song[]>([])
const artists = ref<string[]>([])
const albums = ref<any[]>([])
const playlists = ref<any[]>([])

// 筛选和排序
const selectedGenre = ref('')
const sortBy = ref('relevance')
const genres = ref(['流行', '摇滚', '电子', '古典', '爵士', '民谣'])

// 分页
const currentPage = ref(1)
const pageSize = ref(20)
const totalResults = ref(0)

// 搜索历史
const searchHistory = ref<string[]>([])

const searchTabs = [
  { key: 'songs', label: '歌曲' },
  { key: 'artists', label: '艺人' },
  { key: 'albums', label: '专辑' },
  { key: 'playlists', label: '歌单' },
]

// 计算属性
const filteredSongs = computed(() => {
  let result = songs.value

  if (selectedGenre.value) {
    result = result.filter(song => song.genre === selectedGenre.value)
  }

  // 排序
  switch (sortBy.value) {
    case 'playCount':
      result = result.sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
      break
    case 'createdAt':
      result = result.sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      )
      break
    case 'title':
      result = result.sort((a, b) => a.title.localeCompare(b.title))
      break
    default: // relevance
      break
  }

  return result
})

const totalPages = computed(() => Math.ceil(totalResults.value / pageSize.value))

// 方法
const performSearch = async () => {
  if (!searchQuery.value.trim()) return

  loading.value = true
  searchKeyword.value = searchQuery.value.trim()
  hasSearched.value = true

  // 添加到搜索历史
  addToHistory(searchKeyword.value)

  try {
    // 搜索歌曲
    const songsResult = await musicApi.searchSongs(searchKeyword.value, 50)
    songs.value = songsResult || []

    // 提取艺人和专辑
    extractArtistsAndAlbums()

    // TODO: 搜索歌单
    // const playlistsResult = await playlistApi.searchPlaylists(searchKeyword.value)
    // playlists.value = playlistsResult || []

    totalResults.value =
      songs.value.length + artists.value.length + albums.value.length + playlists.value.length
  } catch (error) {
    console.error('搜索失败:', error)
  } finally {
    loading.value = false
  }
}

const extractArtistsAndAlbums = () => {
  const artistSet = new Set<string>()
  const albumMap = new Map<string, any>()

  songs.value.forEach(song => {
    // 提取艺人
    artistSet.add(song.artist)

    // 提取专辑
    const albumKey = `${song.album}-${song.artist}`
    if (!albumMap.has(albumKey)) {
      albumMap.set(albumKey, {
        name: song.album,
        artist: song.artist,
        coverUrl: song.coverUrl,
        songCount: 1,
      })
    } else {
      albumMap.get(albumKey)!.songCount++
    }
  })

  artists.value = Array.from(artistSet)
  albums.value = Array.from(albumMap.values())
}

const getTabCount = (tabKey: string) => {
  switch (tabKey) {
    case 'songs':
      return songs.value.length
    case 'artists':
      return artists.value.length
    case 'albums':
      return albums.value.length
    case 'playlists':
      return playlists.value.length
    default:
      return 0
  }
}

const getArtistSongCount = (artist: string) => {
  return songs.value.filter(song => song.artist === artist).length
}

const applyFilters = () => {
  // 筛选和排序逻辑已在计算属性中处理
}

const playSong = (song: Song) => {
  musicStore.setCurrentSong(song)
  musicStore.addToPlaylist(song)
  musicStore.play()
}

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const clearSearch = () => {
  searchQuery.value = ''
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    // TODO: 重新搜索当前页数据
  }
}

// 搜索历史管理
const loadSearchHistory = () => {
  const history = localStorage.getItem('searchHistory')
  if (history) {
    searchHistory.value = JSON.parse(history)
  }
}

const saveSearchHistory = () => {
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
}

const addToHistory = (keyword: string) => {
  // 移除重复项
  const index = searchHistory.value.indexOf(keyword)
  if (index > -1) {
    searchHistory.value.splice(index, 1)
  }

  // 添加到开头
  searchHistory.value.unshift(keyword)

  // 限制历史记录数量
  if (searchHistory.value.length > 10) {
    searchHistory.value = searchHistory.value.slice(0, 10)
  }

  saveSearchHistory()
}

const searchFromHistory = (keyword: string) => {
  searchQuery.value = keyword
  performSearch()
}

const removeFromHistory = (index: number) => {
  searchHistory.value.splice(index, 1)
  saveSearchHistory()
}

const clearHistory = () => {
  searchHistory.value = []
  saveSearchHistory()
}

// 生命周期
onMounted(() => {
  loadSearchHistory()

  // 从路由参数获取搜索关键词
  if (route.query.q) {
    searchQuery.value = route.query.q as string
    performSearch()
  }
})

// 监听路由变化
watch(
  () => route.query.q,
  newQuery => {
    if (newQuery && newQuery !== searchQuery.value) {
      searchQuery.value = newQuery as string
      performSearch()
    }
  }
)
</script>

<style scoped>
.search-results-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.search-header {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  align-items: center;
}

.search-bar {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 12px 16px;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.search-bar:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-alpha);
}

.search-icon {
  color: var(--text-secondary);
  margin-right: 12px;
}

.search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: 16px;
  color: var(--text-primary);
}

.search-input::placeholder {
  color: var(--text-secondary);
}

.clear-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.search-btn {
  background: var(--primary);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-btn:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.search-content {
  animation: fadeIn 0.3s ease;
}

.search-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 12px;
}

.result-count {
  color: var(--text-secondary);
  font-size: 14px;
}

.result-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 16px;
}

.tab-btn {
  background: none;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.tab-btn.active {
  background: var(--primary);
  color: white;
}

.tab-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

.tab-btn:not(.active) .tab-count {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.filters-section {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 12px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-weight: 500;
  color: var(--text-primary);
}

.filter-group select {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 12px;
  color: var(--text-primary);
  cursor: pointer;
}

.results-container {
  min-height: 400px;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  font-size: 16px;
}

.no-results {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.no-results svg {
  margin-bottom: 16px;
  opacity: 0.5;
}

.songs-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.song-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.song-item:hover {
  background: var(--bg-hover);
  transform: translateY(-1px);
}

.song-cover {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.song-info {
  flex: 1;
}

.song-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.song-artist,
.song-album {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 2px;
}

.song-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.song-duration {
  font-size: 14px;
  color: var(--text-secondary);
}

.play-btn {
  background: var(--primary);
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.play-btn:hover {
  background: var(--primary-dark);
  transform: scale(1.1);
}

.artists-list,
.albums-list,
.playlists-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.artist-item,
.album-item,
.playlist-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.artist-item:hover,
.album-item:hover,
.playlist-item:hover {
  background: var(--bg-hover);
  transform: translateY(-1px);
}

.artist-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
}

.album-cover,
.playlist-cover {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.artist-name,
.album-name,
.playlist-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.artist-songs,
.album-artist,
.album-songs,
.playlist-creator,
.playlist-songs {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 2px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 40px;
  padding: 20px;
}

.page-btn {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  color: var(--text-primary);
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: var(--bg-hover);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: var(--text-secondary);
  font-weight: 500;
}

.search-history {
  max-width: 600px;
  margin: 40px auto;
  text-align: center;
}

.search-history h3 {
  color: var(--text-primary);
  margin-bottom: 24px;
}

.no-history {
  padding: 60px 20px;
  color: var(--text-secondary);
}

.no-history svg {
  margin-bottom: 16px;
  opacity: 0.5;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.history-item:hover {
  background: var(--bg-hover);
}

.history-item span {
  flex: 1;
  text-align: left;
  color: var(--text-primary);
}

.remove-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.clear-history-btn {
  background: none;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-history-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .search-results-view {
    padding: 16px;
  }

  .search-header {
    flex-direction: column;
    gap: 12px;
  }

  .search-bar {
    width: 100%;
  }

  .search-btn {
    width: 100%;
  }

  .filters-section {
    flex-direction: column;
    gap: 12px;
  }

  .result-tabs {
    flex-wrap: wrap;
  }

  .artists-list,
  .albums-list,
  .playlists-list {
    grid-template-columns: 1fr;
  }

  .song-item {
    flex-direction: column;
    text-align: center;
  }

  .song-meta {
    justify-content: center;
  }
}
</style>
