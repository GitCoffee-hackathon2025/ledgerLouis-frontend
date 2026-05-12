<template>
  <section class="testimonials-section">
    <h2 class="section-label">
      Empresas que já usam o <br />
      <span class="brand-highlight">Ledger Louis</span>
    </h2>

    <div class="stack-container" @click="nextCard">
      <TransitionGroup name="stack">
        <div 
          v-for="(company, index) in visibleCompanies" 
          :key="company.name" 
          class="company-card"
          :class="getCardClass(index)"
          :style="{ zIndex: 10 - index }"
        >
          <div class="card-content-wrapper">
            <div class="card-header">
              <div class="logo-box">
                <img v-if="company.image" :src="company.image" :alt="company.name" class="company-logo" />
                <component v-else :is="company.icon" :size="20" class="icon" />
              </div>
              <div class="header-text">
                <h3>{{ company.name }}</h3>
                <p class="niche">{{ company.niche }}</p>
              </div>
            </div>
            
            <div class="quote-content">
              <Quote class="quote-icon" :size="14" />
              <p class="testimonial-text">{{ company.quote }}</p>
            </div>
          </div>

          <div class="card-footer" v-if="index === 0">
            <div class="tap-indicator">
              <span>Próximo</span>
              <ChevronRight :size="14" />
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Coffee, Activity, Quote, ChevronRight, Laptop } from 'lucide-vue-next';
import gitcoffeImg from '@/assets/img/Gitcoffeimg.png';
import healthupImg from '@/assets/img/healthupimg.png';
import aquaImg from '@/assets/img/AQUAimg.png';

const companies = ref([
  {
    name: 'GitCoffe',
    niche: 'Empresa de software',
    quote: 'O Ledger Louis trouxe uma clareza financeira que nunca tivemos. Interface muito intuitiva e prática.',
    icon: Coffee,
    image: gitcoffeImg
  },
  {
    name: 'HealthUp',
    niche: 'Saúde e Bem-estar',
    quote: 'Gerenciar os custos fixos ficou muito mais simples. Um benefício real para o nosso dia a dia.',
    icon: Activity,
    image: healthupImg
  },
  {
    name: 'AQUA',
    niche: 'dados hidrometeorológicos',
    quote: 'A melhor ferramenta para controle de fluxo de caixa que já utilizamos nos últimos anos. Ganhamos o Hackton por causa dela',
    icon: Laptop,
    image: aquaImg
  }
]);

const activeIndex = ref(0);
let timer: any = null;

const visibleCompanies = computed(() => {
  const list = [...companies.value];
  const rotated = [];
  for (let i = 0; i < list.length; i++) {
    rotated.push(list[(activeIndex.value + i) % list.length]);
  }
  return rotated;
});

const nextCard = () => {
  activeIndex.value = (activeIndex.value + 1) % companies.value.length;
  resetTimer();
};

const getCardClass = (index: number) => {
  if (index === 0) return 'card-top';
  if (index === 1) return 'card-middle';
  return 'card-back';
};

const resetTimer = () => {
  if (timer) clearInterval(timer);
  timer = setInterval(nextCard, 5000);
};

onMounted(() => resetTimer());
onUnmounted(() => { if (timer) clearInterval(timer); });
</script>

<style scoped>
.testimonials-section {
  padding: 10px 25px 50px 25px;
  overflow: hidden;
}

.section-label {
  text-align: center;
  font-size: 12px; /* Reduzido */
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-secondary);
  margin-bottom: 20px;
}

.brand-highlight {
  font-size: 23px; /* Reduzido de 26px */
  color: var(--color-success-dark);
  text-transform: none;
  display: block;
  margin-top: 4px;
}

.stack-container {
  position: relative;
  height: 200px; /* Reduzido de 220px */
  width: 100%;
  perspective: 1000px;
  cursor: pointer;
}

.company-card {
  position: absolute;
  width: 100%;
  height: 175px; /* Reduzido de 190px */
  background: var(--color-surface);
  border-radius: 18px; /* Levemente mais arredondado proporcionalmente */
  padding: 18px; /* Reduzido de 22px */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--color-border);
  transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  backface-visibility: hidden;
}

/* --- Visibilidade e Escalonamento --- */
.card-top {
  transform: translateY(0) scale(1);
  opacity: 1;
}

.card-middle {
  transform: translateY(15px) scale(0.95);
  opacity: 0.6;
}

.card-back {
  transform: translateY(30px) scale(0.90);
  opacity: 0.3;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.logo-box {
  width: 36px; /* Reduzido de 42px */
  height: 36px;
  background-color: var(--color-surface-soft);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-success-alt);
  overflow: hidden;
}

.company-logo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.icon {
  width: 100%;
  height: 100%;
}

.header-text h3 {
  font-size: 16px; /* Reduzido de 18px */
  font-weight: 700;
  margin: 0;
  color: var(--color-text);
}

.niche {
  font-size: 11px; /* Reduzido de 12px */
  color: var(--color-text-tertiary);
  margin: 0;
}

.quote-content {
  position: relative;
  padding-left: 18px;
}

.quote-icon {
  position: absolute;
  left: 0;
  top: 0;
  color: var(--color-success-alt);
  opacity: 0.2;
}

.testimonial-text {
  font-size: 14px; /* Reduzido de 15px */
  line-height: 1.4;
  color: var(--color-text-secondary);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--color-surface-soft);
  padding-top: 8px;
}

.tap-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  color: var(--color-success-alt);
  text-transform: uppercase;
}

/* --- Animação de Saída (Fix para o bug visual) --- */
.stack-leave-active {
  position: absolute;
  z-index: 100 !important; /* Garante que o card saindo fique por cima de tudo */
}

.stack-leave-to {
  transform: translateX(-110%) rotate(-10deg) scale(0.9);
  opacity: 0;
}

/* Evita que os cards que estão entrando ou se movendo "pulem" */
.stack-move {
  transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}
</style>