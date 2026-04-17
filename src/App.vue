<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import BottomNav from './components/BottomNav.vue'
import FooterSection from './components/FooterSection.vue';
</script>

<template>
<BottomNav />
  <RouterView />
</template>

<style scoped>
/* Recomendo usar grid para a criação dos layouts - William */

</style>
