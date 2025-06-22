<template>
  <div class="player-view">
    <MusicPlayer />
  </div>
</template>

<script setup lang="ts">
import MusicPlayer from '@/components/MusicPlayer.vue'
</script>

<style scoped>
.player-view {
  height: 100vh;
  overflow: hidden;
}
</style>
