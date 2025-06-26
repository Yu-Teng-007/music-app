<template>
  <div class="song-info">
    <h2 class="song-title">{{ song?.title || '未选择歌曲' }}</h2>
    <p class="song-artist">{{ song?.artist || '未知艺人' }}</p>
    <p class="song-album" v-if="song?.album">{{ song.album }}</p>
  </div>
</template>

<script setup lang="ts">
import type { Song } from '@/stores/music'

defineProps<{
  song: Song | null
}>()
</script>

<style scoped>
.song-info {
  text-align: center;
  margin: 20px 0;
  padding: 0 20px;
}

.song-title {
  font-size: 24px;
  font-weight: 600;
  color: white;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.song-artist {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.song-album {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
