<script setup lang="ts">
import { useRouter } from 'vue-router';
import HeroSection from '@/components/sections/HeroSection.vue';
import ManifestoSection from '@/components/sections/ManifestoSection.vue';
import FeatureBento from '@/components/sections/FeatureBento.vue';
import HowItWorks from '@/components/sections/HowItWorks.vue';
import CompanyTestimonials from '@/components/sections/CompanyTestimonials.vue';
import CalltoAction from '@/components/sections/CalltoAction.vue';
import FooterSection from '@/components/layout/FooterSection.vue';

const router = useRouter();

const handleSignup = () => {
  router.push({ name: 'cadastro' });
};
</script>

<template>
  <div class="home">
    <HeroSection @signup="handleSignup" />
    <ManifestoSection />
    <FeatureBento />
    <HowItWorks />
    <CompanyTestimonials />
    <CalltoAction @signup="handleSignup" />
    <FooterSection />
  </div>
</template>
