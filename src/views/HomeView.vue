<template>
  <main class="home-container">
    <HeroSection @signup="handleSignup" />

    <section class="features-section">
      <h2 class="section-title">
        Conheça Nosso <br />
        <span class="highlight">Gerenciador Financeiro</span>
      </h2>

      <div class="features-list">
        <FeatureItem 
          number="1" 
          title="Todos os gastos na Palma Na mão" 
          description="Acompanhe cada centavo de onde quer que você esteja com nossa interface mobile-first." 
        />
        <FeatureItem 
          number="2" 
          title="Prático e simples" 
          description="Sem menus complicados. Adicione suas entradas e saídas em segundos." 
        />
        <FeatureItem 
          number="3" 
          title="Análises complexas" 
          description="Transformamos seus dados em gráficos fáceis de entender para sua tomada de decisão." 
        />
        <FeatureItem 
          number="4" 
          title="Relatórios mensais" 
          description="Receba fechamentos detalhados e entenda para onde seu dinheiro está indo." 
        />
      </div>
    </section>

    <div class="bottom-spacer"></div>
  </main>
</template>

<script setup lang="ts">
import HeroSection from '@/components/HeroSection.vue';
import FeatureItem from '@/components/FeatureItem.vue';

const handleSignup = () => {
  console.log("Navegar para cadastro...");
};
</script>

<style scoped>
.home-container {
  background-color: #f9fafb; 
  min-height: 100vh;
}

.features-section {
  padding: 30px 25px;
}

.section-title {
  font-size: 22px;
  color: #065f46;
  margin-bottom: 40px;
  font-weight: 600;
}

.highlight {
  font-weight: 800;
}

.bottom-spacer {
  height: 100px; 
}
</style>