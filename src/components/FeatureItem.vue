<template>
  <div class="feature-item">
    <div class="feature-number">
      {{ number }}
    </div>
    <div class="feature-text">
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  number: string;
  title: string;
  description: string;
}>();
</script>

<style scoped>
.feature-item {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  padding-left: 5px;
}

.feature-number {
  font-size: 28px;
  font-weight: 800;
  color: #111827;
  line-height: 1;
  min-width: 25px;
  border-left: 3px solid #1de276; /* A barrinha verde ao lado do número */
  padding-left: 12px;
}

.feature-text h3 {
  font-size: 17px;
  color: #111827;
  margin: 0 0 6px 0;
  font-weight: 700;
}

.feature-text p {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.4;
  margin: 0;
}
</style>