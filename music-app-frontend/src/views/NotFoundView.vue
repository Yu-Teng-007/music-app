<template>
  <div class="not-found-view">
    <div class="error-container">
      <!-- 404动画图标 -->
      <div class="error-icon">
        <div class="number-404">
          <span class="four">4</span>
          <span class="zero">0</span>
          <span class="four">4</span>
        </div>
        <div class="music-note">
          <Music :size="48" />
        </div>
      </div>

      <!-- 错误信息 -->
      <div class="error-content">
        <h1>页面走丢了</h1>
        <p class="error-message">
          抱歉，您访问的页面不存在或已被移动。
        </p>
        <p class="error-suggestion">
          可能是链接有误，或者页面已经被删除。
        </p>
      </div>

      <!-- 操作按钮 -->
      <div class="error-actions">
        <button @click="goHome" class="primary-btn">
          <Home :size="20" />
          回到首页
        </button>
        <button @click="goBack" class="secondary-btn">
          <ArrowLeft :size="20" />
          返回上页
        </button>
        <button @click="goToDiscover" class="secondary-btn">
          <Search :size="20" />
          去发现音乐
        </button>
      </div>

      <!-- 推荐链接 -->
      <div class="quick-links">
        <h3>您可能想要访问：</h3>
        <div class="links-grid">
          <router-link to="/" class="quick-link">
            <Home :size="20" />
            <span>首页</span>
          </router-link>
          <router-link to="/discover" class="quick-link">
            <Compass :size="20" />
            <span>发现音乐</span>
          </router-link>
          <router-link to="/playlist" class="quick-link">
            <ListMusic :size="20" />
            <span>我的歌单</span>
          </router-link>
          <router-link to="/favorites" class="quick-link">
            <Heart :size="20" />
            <span>我的收藏</span>
          </router-link>
          <router-link to="/search" class="quick-link">
            <Search :size="20" />
            <span>搜索音乐</span>
          </router-link>
          <router-link to="/profile" class="quick-link">
            <User :size="20" />
            <span>个人中心</span>
          </router-link>
        </div>
      </div>

      <!-- 错误报告 -->
      <div class="error-report">
        <details>
          <summary>技术信息</summary>
          <div class="tech-info">
            <p><strong>错误代码:</strong> 404</p>
            <p><strong>请求路径:</strong> {{ $route.fullPath }}</p>
            <p><strong>时间:</strong> {{ new Date().toLocaleString() }}</p>
            <p><strong>用户代理:</strong> {{ navigator.userAgent }}</p>
          </div>
        </details>
        <button @click="reportError" class="report-btn">
          <AlertCircle :size="16" />
          报告问题
        </button>
      </div>
    </div>

    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="floating-note note-1">♪</div>
      <div class="floating-note note-2">♫</div>
      <div class="floating-note note-3">♪</div>
      <div class="floating-note note-4">♫</div>
      <div class="floating-note note-5">♪</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  Music,
  Home,
  ArrowLeft,
  Search,
  Compass,
  ListMusic,
  Heart,
  User,
  AlertCircle,
} from 'lucide-vue-next'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}

const goToDiscover = () => {
  router.push('/discover')
}

const reportError = () => {
  // TODO: 实现错误报告功能
  alert('感谢您的反馈！我们会尽快处理这个问题。')
}
</script>

<style scoped>
.not-found-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
}

.error-container {
  max-width: 600px;
  text-align: center;
  z-index: 2;
  position: relative;
}

.error-icon {
  margin-bottom: 32px;
  position: relative;
}

.number-404 {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-size: 120px;
  font-weight: 900;
  color: var(--primary);
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

.number-404 .zero {
  animation: bounce 2s infinite;
  animation-delay: 0.5s;
}

.number-404 .four:first-child {
  animation: bounce 2s infinite;
  animation-delay: 0s;
}

.number-404 .four:last-child {
  animation: bounce 2s infinite;
  animation-delay: 1s;
}

.music-note {
  color: var(--primary);
  opacity: 0.7;
  animation: float 3s ease-in-out infinite;
}

.error-content {
  margin-bottom: 32px;
}

.error-content h1 {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.error-message {
  font-size: 18px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.error-suggestion {
  font-size: 16px;
  color: var(--text-tertiary);
}

.error-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 48px;
  flex-wrap: wrap;
}

.primary-btn, .secondary-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  text-decoration: none;
}

.primary-btn {
  background: var(--primary);
  color: white;
}

.primary-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--primary-alpha);
}

.secondary-btn {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.secondary-btn:hover {
  background: var(--bg-hover);
  transform: translateY(-1px);
}

.quick-links {
  margin-bottom: 32px;
}

.quick-links h3 {
  color: var(--text-primary);
  margin-bottom: 20px;
  font-size: 18px;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  max-width: 500px;
  margin: 0 auto;
}

.quick-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  background: var(--bg-secondary);
  border-radius: 12px;
  text-decoration: none;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.quick-link:hover {
  background: var(--bg-hover);
  color: var(--primary);
  border-color: var(--primary-alpha);
  transform: translateY(-2px);
}

.quick-link span {
  font-size: 14px;
  font-weight: 500;
}

.error-report {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

.error-report details {
  margin-bottom: 16px;
}

.error-report summary {
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 8px;
}

.tech-info {
  background: var(--bg-secondary);
  padding: 16px;
  border-radius: 8px;
  text-align: left;
  font-family: monospace;
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 8px;
}

.tech-info p {
  margin-bottom: 4px;
}

.report-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.report-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.floating-note {
  position: absolute;
  font-size: 24px;
  color: var(--primary);
  opacity: 0.1;
  animation: float 6s ease-in-out infinite;
}

.note-1 {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.note-2 {
  top: 60%;
  right: 15%;
  animation-delay: 1s;
}

.note-3 {
  top: 30%;
  right: 25%;
  animation-delay: 2s;
}

.note-4 {
  bottom: 30%;
  left: 20%;
  animation-delay: 3s;
}

.note-5 {
  bottom: 20%;
  right: 30%;
  animation-delay: 4s;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

@media (max-width: 768px) {
  .number-404 {
    font-size: 80px;
  }
  
  .error-content h1 {
    font-size: 24px;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .primary-btn, .secondary-btn {
    width: 100%;
    max-width: 200px;
    justify-content: center;
  }
  
  .links-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
