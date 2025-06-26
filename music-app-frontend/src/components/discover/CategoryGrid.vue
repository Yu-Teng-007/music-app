<template>
  <div class="category-grid">
    <div
      v-for="category in categories"
      :key="category.id"
      class="category-item"
      :style="{ backgroundColor: category.color }"
      @click="onCategoryClick(category)"
    >
      <span>{{ category.name }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Category {
  id: number | string
  name: string
  color: string
}

const props = defineProps({
  categories: {
    type: Array as () => Category[],
    required: true,
  },
})

const emit = defineEmits(['category-click'])

const onCategoryClick = (category: Category) => {
  emit('category-click', category)
}
</script>

<style scoped>
.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  text-align: center;
  padding: 0.5rem;
}

.category-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* 响应式布局 */
@media (max-width: 768px) {
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .category-item {
    height: 70px;
    font-size: 0.9rem;
  }
}
</style>
