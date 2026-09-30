<script setup lang="ts">
import { useRouter } from 'vue-router';
import { BarChart3, Repeat, Smartphone, Tags, Users, Zap } from 'lucide-vue-next';
import HeroSection from '@/components/sections/HeroSection.vue';
import FeatureItem from '@/components/sections/FeatureItem.vue';
import HowItWorks from '@/components/sections/HowItWorks.vue';
import CompanyTestimonials from '@/components/sections/CompanyTestimonials.vue';
import CalltoAction from '@/components/sections/CalltoAction.vue';
import FooterSection from '@/components/layout/FooterSection.vue';

const router = useRouter();

const features = [
  {
    icon: Zap,
    title: 'Lançamentos em segundos',
    description: 'Registre entradas e saídas sem menus complicados — valor, descrição e pronto.',
  },
  {
    icon: Repeat,
    title: 'Despesas fixas no automático',
    description: 'Aluguel, salários e assinaturas são lançados sozinhos quando a data chega.',
  },
  {
    icon: BarChart3,
    title: 'Relatórios com previsão',
    description: 'Média mensal, desvio padrão e a estimativa de gastos do próximo mês.',
  },
  {
    icon: Tags,
    title: 'Organização por tags',
    description: 'Catalogue transações com rótulos livres e filtre qualquer relatório por eles.',
  },
  {
    icon: Users,
    title: 'Equipe na mesma página',
    description: 'Convide sócios e colaboradores com papéis de owner, admin ou viewer.',
  },
  {
    icon: Smartphone,
    title: 'No bolso, em qualquer lugar',
    description: 'Interface mobile-first que funciona como app instalado no celular.',
  },
];

const handleSignup = () => {
  router.push({ name: 'cadastro' });
};
</script>

<template>
  <div class="home">
    <HeroSection @signup="handleSignup" />

    <section id="recursos" class="section">
      <header class="section-heading">
        <p class="section-eyebrow">Recursos</p>
        <h2>Tudo o que sua empresa precisa para <span class="gradient-text">controlar o caixa</span></h2>
      </header>

      <div class="features-grid">
        <FeatureItem v-for="feature in features" :key="feature.title" v-bind="feature" />
      </div>
    </section>

    <HowItWorks />
    <CompanyTestimonials />
    <CalltoAction @signup="handleSignup" />
    <FooterSection />
  </div>
</template>

<style scoped>
.features-grid {
  display: grid;
  gap: var(--space-4);
}

@media (min-width: 640px) {
  .features-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .features-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
