<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>仪表盘</h1>
      <p>欢迎使用音乐应用管理后台</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <Users />
        </div>
        <div class="stat-content">
          <div class="stat-value">1,234</div>
          <div class="stat-label">总用户数</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <Music />
        </div>
        <div class="stat-content">
          <div class="stat-value">5,678</div>
          <div class="stat-label">总歌曲数</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <Play />
        </div>
        <div class="stat-content">
          <div class="stat-value">98,765</div>
          <div class="stat-label">总播放次数</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <TrendingUp />
        </div>
        <div class="stat-content">
          <div class="stat-value">432</div>
          <div class="stat-label">活跃用户</div>
        </div>
      </div>
    </div>

    <div class="dashboard-content">
      <div class="content-section">
        <div class="section-header">
          <h2>快速操作</h2>
        </div>
        <div class="quick-actions">
          <router-link to="/songs" class="action-card">
            <Music class="action-icon" />
            <div class="action-content">
              <h3>歌曲管理</h3>
              <p>管理音乐库中的所有歌曲</p>
            </div>
          </router-link>

          <router-link to="/users" class="action-card">
            <Users class="action-icon" />
            <div class="action-content">
              <h3>用户管理</h3>
              <p>管理系统用户和权限</p>
            </div>
          </router-link>

          <router-link to="/analytics" class="action-card">
            <BarChart3 class="action-icon" />
            <div class="action-content">
              <h3>数据统计</h3>
              <p>查看详细的数据分析报告</p>
            </div>
          </router-link>
        </div>
      </div>

      <div class="content-section">
        <div class="section-header">
          <h2>系统状态</h2>
        </div>
        <div class="status-grid">
          <div class="status-item">
            <div class="status-indicator success"></div>
            <div class="status-content">
              <div class="status-title">API服务</div>
              <div class="status-desc">运行正常</div>
            </div>
          </div>

          <div class="status-item">
            <div class="status-indicator success"></div>
            <div class="status-content">
              <div class="status-title">数据库</div>
              <div class="status-desc">连接正常</div>
            </div>
          </div>

          <div class="status-item">
            <div class="status-indicator warning"></div>
            <div class="status-content">
              <div class="status-title">存储空间</div>
              <div class="status-desc">使用率 78%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Users, Music, Play, TrendingUp, BarChart3 } from 'lucide-vue-next'
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: $spacing-lg;
  margin-bottom: $spacing-xl;
}

.stat-card {
  background: $background-white;
  border-radius: $border-radius-lg;
  padding: $spacing-lg;
  box-shadow: $shadow-sm;
  border: 1px solid $border-light;
  display: flex;
  align-items: center;
  gap: $spacing-md;
  transition: box-shadow $transition-fast;

  &:hover {
    box-shadow: $shadow-md;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    background: rgba($primary-color, 0.1);
    border-radius: $border-radius-lg;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $primary-color;
  }

  .stat-content {
    flex: 1;

    .stat-value {
      font-size: 24px;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      margin-bottom: $spacing-xs;
    }

    .stat-label {
      font-size: $font-size-sm;
      color: $text-secondary;
    }
  }
}

.dashboard-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: $spacing-xl;

  @media (max-width: $breakpoint-lg) {
    grid-template-columns: 1fr;
  }
}

.content-section {
  .section-header {
    margin-bottom: $spacing-lg;

    h2 {
      font-size: 20px;
      font-weight: $font-weight-semibold;
      color: $text-primary;
    }
  }
}

.quick-actions {
  display: grid;
  gap: $spacing-md;
}

.action-card {
  background: $background-white;
  border-radius: $border-radius-lg;
  padding: $spacing-lg;
  box-shadow: $shadow-sm;
  border: 1px solid $border-light;
  display: flex;
  align-items: center;
  gap: $spacing-md;
  text-decoration: none;
  color: inherit;
  transition: all $transition-fast;

  &:hover {
    box-shadow: $shadow-md;
    transform: translateY(-2px);
  }

  .action-icon {
    width: 40px;
    height: 40px;
    color: $primary-color;
  }

  .action-content {
    flex: 1;

    h3 {
      font-size: $font-size-md;
      font-weight: $font-weight-medium;
      color: $text-primary;
      margin-bottom: $spacing-xs;
    }

    p {
      font-size: $font-size-sm;
      color: $text-secondary;
      margin: 0;
    }
  }
}

.status-grid {
  background: $background-white;
  border-radius: $border-radius-lg;
  padding: $spacing-lg;
  box-shadow: $shadow-sm;
  border: 1px solid $border-light;
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.status-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;

  .status-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;

    &.success {
      background-color: $success-color;
    }

    &.warning {
      background-color: $warning-color;
    }

    &.error {
      background-color: $error-color;
    }
  }

  .status-content {
    flex: 1;

    .status-title {
      font-size: $font-size-sm;
      font-weight: $font-weight-medium;
      color: $text-primary;
      margin-bottom: 2px;
    }

    .status-desc {
      font-size: $font-size-xs;
      color: $text-secondary;
    }
  }
}
</style>
