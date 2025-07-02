<template>
  <div class="analytics-view">
    <div class="page-header">
      <h1>数据统计</h1>
      <p>查看详细的运营数据和分析报告</p>
    </div>

    <div class="content-placeholder">
      <div class="placeholder-icon">
        <TrendingUp />
      </div>
      <h2>数据统计功能</h2>
      <p>此页面将包含用户增长、播放统计、热门内容和详细的数据可视化图表</p>
      <div class="placeholder-actions">
        <button class="btn btn-primary">生成报告</button>
        <button class="btn btn-default">导出数据</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrendingUp } from 'lucide-vue-next'
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.analytics-view {
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
