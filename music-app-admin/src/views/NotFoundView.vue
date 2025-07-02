<template>
  <div class="not-found">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <h1>页面不存在</h1>
      <p>抱歉，您访问的页面不存在或已被移除。</p>
      <div class="actions">
        <router-link to="/dashboard" class="btn btn-primary"> 返回首页 </router-link>
        <button class="btn btn-default" @click="goBack">返回上页</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  router.go(-1)
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $background-color;
  padding: $spacing-lg;
}

.not-found-content {
  text-align: center;
  max-width: 500px;

  .error-code {
    font-size: 120px;
    font-weight: $font-weight-bold;
    color: $primary-color;
    line-height: 1;
    margin-bottom: $spacing-lg;
  }

  h1 {
    font-size: 32px;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin-bottom: $spacing-md;
  }

  p {
    font-size: $font-size-md;
    color: $text-secondary;
    margin-bottom: $spacing-xl;
    line-height: 1.6;
  }

  .actions {
    display: flex;
    gap: $spacing-md;
    justify-content: center;
    flex-wrap: wrap;
  }
}
</style>
