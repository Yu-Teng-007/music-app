<template>
  <div class="onboarding-container">
    <!-- Swiper 轮播容器 -->
    <swiper
      :modules="modules"
      :slides-per-view="1"
      :space-between="0"
      :autoplay="{
        delay: 4000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
        stopOnLastSlide: true,
      }"
      :pagination="{
        clickable: true,
        dynamicBullets: true,
      }"
      :navigation="{
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      }"
      :keyboard="{
        enabled: true,
        onlyInViewport: true,
      }"
      :effect="'slide'"
      :speed="600"
      :loop="false"
      :allow-touch-move="true"
      :touch-ratio="1"
      :threshold="5"
      :resistance="true"
      :resistance-ratio="0.85"
      class="onboarding-swiper"
      @swiper="onSwiper"
      @slide-change="onSlideChange"
    >
      <!-- 第一张引导图 -->
      <swiper-slide>
        <div class="slide-content">
          <div class="slide-image">
            <div class="image-placeholder discover-icon">
              <img src="@/assets/onboarding/discover.svg" alt="发现音乐" />
            </div>
          </div>
          <div class="slide-text">
            <h2>发现无限音乐</h2>
            <p>探索海量音乐库，发现你喜爱的歌曲、艺术家和专辑。智能推荐让你的音乐世界更加精彩。</p>
          </div>
        </div>
      </swiper-slide>

      <!-- 第二张引导图 -->
      <swiper-slide>
        <div class="slide-content">
          <div class="slide-image">
            <div class="image-placeholder player-icon">
              <img src="@/assets/onboarding/player.svg" alt="播放体验" />
            </div>
          </div>
          <div class="slide-text">
            <h2>极致播放体验</h2>
            <p>高品质音频播放，支持多种格式。智能均衡器和音效增强，为你带来沉浸式的听觉享受。</p>
          </div>
        </div>
      </swiper-slide>

      <!-- 第三张引导图 -->
      <swiper-slide>
        <div class="slide-content">
          <div class="slide-image">
            <div class="image-placeholder library-icon">
              <img src="@/assets/onboarding/library.svg" alt="个人音乐库" />
            </div>
          </div>
          <div class="slide-text">
            <h2>个人音乐库</h2>
            <p>创建专属歌单，收藏喜爱的音乐。云端同步让你的音乐随时随地都能陪伴你。</p>
          </div>
        </div>
      </swiper-slide>
    </swiper>

    <!-- 底部按钮区域 -->
    <div class="bottom-actions">
      <button v-if="currentSlide < totalSlides - 1" class="skip-btn" @click="skipOnboarding">
        跳过
      </button>
      <button v-if="currentSlide === totalSlides - 1" class="start-btn" @click="startApp">
        开启你的音乐世界
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { setFirstLaunchCompleted } from '@/utils'

// Swiper 相关导入
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination, Autoplay, Keyboard, EffectFade } from 'swiper/modules'

// 导入 Swiper 样式
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/autoplay'
import 'swiper/css/keyboard'
import 'swiper/css/effect-fade'

const router = useRouter()

// Swiper 模块
const modules = [Navigation, Pagination, Autoplay, Keyboard, EffectFade]

// 响应式数据
const currentSlide = ref(0)
const totalSlides = ref(3)
const swiperInstance = ref<any>(null)

// Swiper 事件处理
const onSwiper = (swiper: any) => {
  swiperInstance.value = swiper
}

const onSlideChange = (swiper: any) => {
  currentSlide.value = swiper.activeIndex
}

// 跳过引导
const skipOnboarding = () => {
  setFirstLaunchCompleted()
  router.replace('/auth')
}

// 开始使用应用
const startApp = () => {
  setFirstLaunchCompleted()
  router.replace('/auth')
}

// 键盘事件处理
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    skipOnboarding()
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.onboarding-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
}

.onboarding-swiper {
  flex: 1;
  width: 100%;
  height: 100%;
}

.onboarding-swiper :deep(.swiper-slide) {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

/* Swiper 自定义样式 */
.onboarding-swiper :deep(.swiper-pagination) {
  bottom: 120px !important;
}

.onboarding-swiper :deep(.swiper-button-next),
.onboarding-swiper :deep(.swiper-button-prev) {
  color: white;
  background: rgba(255, 255, 255, 0.1);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.onboarding-swiper :deep(.swiper-button-next:hover),
.onboarding-swiper :deep(.swiper-button-prev:hover) {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.onboarding-swiper :deep(.swiper-button-next::after),
.onboarding-swiper :deep(.swiper-button-prev::after) {
  font-size: 16px;
  font-weight: 600;
}

.slide-content {
  text-align: center;
  max-width: 400px;
  width: 100%;
  animation: slideInUp 0.8s ease-out;
}

.slide-image {
  margin-bottom: 3rem;
  display: flex;
  justify-content: center;
}

.image-placeholder {
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.image-placeholder:hover {
  transform: scale(1.05);
}

.image-placeholder svg,
.image-placeholder img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.slide-text h2 {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.slide-text p {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.bottom-actions {
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80px;
}

.skip-btn {
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.skip-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

.start-btn {
  background: linear-gradient(45deg, #4ade80, #06b6d4);
  border: none;
  color: white;
  padding: 1rem 2.5rem;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(74, 222, 128, 0.3);
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(74, 222, 128, 0.4);
}

.start-btn:active {
  transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .onboarding-swiper :deep(.swiper-slide) {
    padding: 1rem;
  }

  .slide-text h2 {
    font-size: 1.5rem;
  }

  .slide-text p {
    font-size: 1rem;
  }

  .image-placeholder {
    width: 150px;
    height: 150px;
  }

  .slide-image {
    margin-bottom: 2rem;
  }

  .bottom-actions {
    padding: 1.5rem;
  }

  .onboarding-swiper :deep(.swiper-button-next),
  .onboarding-swiper :deep(.swiper-button-prev) {
    width: 36px;
    height: 36px;
  }

  .onboarding-swiper :deep(.swiper-button-next::after),
  .onboarding-swiper :deep(.swiper-button-prev::after) {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .slide-text h2 {
    font-size: 1.3rem;
  }

  .slide-text p {
    font-size: 0.9rem;
  }

  .image-placeholder {
    width: 120px;
    height: 120px;
  }

  .start-btn {
    padding: 0.875rem 2rem;
    font-size: 1rem;
  }

  .skip-btn {
    padding: 0.625rem 1.5rem;
    font-size: 0.9rem;
  }

  .onboarding-swiper :deep(.swiper-button-next),
  .onboarding-swiper :deep(.swiper-button-prev) {
    display: none; /* 在小屏幕上隐藏导航按钮 */
  }

  .onboarding-swiper :deep(.swiper-pagination) {
    bottom: 100px !important;
  }
}

/* 动画效果 */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.image-placeholder {
  animation: pulse 3s ease-in-out infinite;
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .onboarding-container {
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  }
}
</style>
