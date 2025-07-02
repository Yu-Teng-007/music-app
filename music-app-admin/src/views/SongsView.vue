<template>
  <div class="songs-view">
    <div class="page-header">
      <h1>歌曲管理</h1>
      <p>管理音乐库中的所有歌曲内容</p>
    </div>

    <div class="content-placeholder">
      <div class="placeholder-icon">
        <Music />
      </div>
      <h2>歌曲管理功能</h2>
      <p>此页面将包含歌曲列表、上传、编辑、分类和批量操作功能</p>
      <div class="placeholder-actions">
        <button class="btn btn-primary">上传歌曲</button>
        <button class="btn btn-default">批量导入</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Music } from 'lucide-vue-next'
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.songs-view {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: $spacing-xl;

  h1 {
    font-size: 28px;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin-bottom: $spacing-sm;
  }

  p {
    color: $text-secondary;
    font-size: $font-size-md;
  }
}

.content-placeholder {
  background: $background-white;
  border-radius: $border-radius-lg;
  padding: $spacing-xl;
  text-align: center;
  box-shadow: $shadow-sm;
  border: 1px solid $border-light;

  .placeholder-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto $spacing-lg;
    background: rgba($primary-color, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $primary-color;

    svg {
      width: 40px;
      height: 40px;
    }
  }

  h2 {
    font-size: 24px;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin-bottom: $spacing-md;
  }

  p {
    color: $text-secondary;
    font-size: $font-size-md;
    margin-bottom: $spacing-xl;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
  }

  .placeholder-actions {
    display: flex;
    gap: $spacing-md;
    justify-content: center;
  }
}
</style>
