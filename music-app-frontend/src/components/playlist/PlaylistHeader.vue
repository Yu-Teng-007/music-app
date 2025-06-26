<template>
  <div class="playlist-header">
    <div class="playlist-cover">
      <img :src="playlist?.coverUrl || defaultCover" alt="Playlist Cover" />
    </div>
    <div class="playlist-info">
      <h1>{{ playlist?.name || '未命名歌单' }}</h1>
      <p>{{ playlist?.description || '暂无描述' }}</p>
      <div class="playlist-stats">
        <span>{{ playlist?.songs?.length || 0 }} 首歌曲</span>
        <span>创建于 {{ formatDate(playlist?.createdAt) }}</span>
      </div>
    </div>
    <div class="playlist-actions">
      <button class="primary-btn" @click="playAll"><Play :size="16" /> 播放全部</button>
      <button class="outline-btn" @click="editPlaylist" v-if="isOwner">
        <Edit :size="16" /> 编辑
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Play, Edit } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useMusicStore } from '@/stores/music'

const props = defineProps({
  playlist: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['edit'])

const authStore = useAuthStore()
const musicStore = useMusicStore()

const defaultCover = '/images/default-playlist.jpg'

// 判断当前用户是否为歌单所有者
const isOwner = computed(() => {
  return props.playlist?.userId === authStore.user?.id
})

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return '未知时间'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// 播放整个歌单
const playAll = () => {
  if (props.playlist?.songs?.length) {
    musicStore.setPlaylist(props.playlist.songs)
    musicStore.setCurrentSong(props.playlist.songs[0])
    musicStore.play()
  }
}

// 编辑歌单
const editPlaylist = () => {
  emit('edit', props.playlist)
}
</script>

<style scoped>
.playlist-header {
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.3));
  color: white;
  border-radius: 8px;
  margin-bottom: 20px;
}

.playlist-cover {
  width: 200px;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  margin-bottom: 20px;
  align-self: center;
}

.playlist-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playlist-info {
  margin-bottom: 20px;
  text-align: center;
}

.playlist-info h1 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 10px;
}

.playlist-info p {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 15px;
}

.playlist-stats {
  display: flex;
  justify-content: center;
  gap: 20px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.playlist-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.primary-btn,
.outline-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 20px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.primary-btn {
  background: #007aff;
  color: white;
  border: none;
}

.primary-btn:hover {
  background: #0062cc;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.outline-btn {
  background: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.outline-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: white;
}

@media (min-width: 768px) {
  .playlist-header {
    flex-direction: row;
    align-items: center;
    padding: 30px;
  }

  .playlist-cover {
    margin-right: 30px;
    margin-bottom: 0;
    flex-shrink: 0;
    align-self: flex-start;
  }

  .playlist-info {
    flex: 1;
    text-align: left;
    margin-bottom: 0;
  }

  .playlist-stats {
    justify-content: flex-start;
  }

  .playlist-actions {
    margin-left: 20px;
    justify-content: flex-end;
  }
}
</style>
