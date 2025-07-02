<template>
  <nav class="breadcrumb">
    <ol class="breadcrumb-list">
      <li v-for="(item, index) in appStore.breadcrumbs" :key="index" class="breadcrumb-item">
        <router-link
          v-if="item.path && index < appStore.breadcrumbs.length - 1"
          :to="item.path"
          class="breadcrumb-link"
        >
          {{ item.title }}
        </router-link>
        <span v-else class="breadcrumb-text">
          {{ item.title }}
        </span>

        <ChevronRight v-if="index < appStore.breadcrumbs.length - 1" class="breadcrumb-separator" />
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.breadcrumb {
  display: flex;
  align-items: center;
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: $spacing-sm;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.breadcrumb-link {
  color: $text-secondary;
  text-decoration: none;
  font-size: $font-size-sm;
  transition: color $transition-fast;

  &:hover {
    color: $primary-color;
  }
}

.breadcrumb-text {
  color: $text-primary;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
}

.breadcrumb-separator {
  width: 14px;
  height: 14px;
  color: $text-placeholder;
}
</style>
