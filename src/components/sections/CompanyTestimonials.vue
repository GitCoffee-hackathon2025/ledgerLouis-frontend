<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useGsapScope } from '@/composables/useGsapScope';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';
import gitcoffeImg from '@/assets/img/Gitcoffeimg.png';
import healthupImg from '@/assets/img/healthupimg.png';
import aquaImg from '@/assets/img/AQUAimg.png';

const voices = [
  {
    name: 'AQUA',
    niche: 'Dados hidrometeorológicos',
    quote:
      'A melhor ferramenta para controle de fluxo de caixa que já utilizamos. Ganhamos o Hackathon por causa dela.',
    image: aquaImg,
  },
  {
    name: 'GitCoffe',
    niche: 'Empresa de software',
    quote:
      'O Ledger Louis trouxe uma clareza financeira que nunca tivemos. Interface intuitiva e prática.',
    image: gitcoffeImg,
  },
  {
    name: 'HealthUp',
    niche: 'Saúde e bem-estar',
    quote: 'Gerenciar os custos fixos ficou muito mais simples no nosso dia a dia.',
    image: healthupImg,
  },
];

const track = ref<HTMLElement>();
const canPrev = ref(false);
const canNext = ref(true);
// Fracao visivel da faixa e posicao do scroll: alimentam a barra de progresso.
const thumb = ref({ width: 100, left: 0 });
const active = ref(0);
const dragging = ref(false);
const root = ref<HTMLElement>();
const stage = ref<HTMLElement>();
// Em telas largas os cards entram um a um pela direita, andam com o scroll e saem pela esquerda,
// soltos do container (so a borda da tela os corta).
const scrubbed = ref(false);
let scrubOffset = 0;
let pinTimeline:
  | { scrollTrigger?: { start: number; end: number }; duration: () => number }
  | undefined;

// Peso do trecho em que a faixa percorre os cards, na linha do tempo presa.
const TRAVEL = 2.5;

// ponytail: decide uma vez na montagem; se a janela cruzar 900px a faixa so volta ao modo nativo no reload.
useGsapScope(root, ({ gsap }) => {
  const el = track.value;
  if (!el || !window.matchMedia('(min-width: 900px)').matches) return;
  const cards = Array.from(el.children);
  const offscreen = () => window.innerWidth;

  // Entrada: cada card chega no seu tempo enquanto o palco sobe ate o centro da tela.
  gsap.fromTo(
    cards,
    { x: offscreen },
    {
      x: 0,
      ease: 'power3.out',
      stagger: 0.25,
      scrollTrigger: {
        trigger: stage.value,
        start: 'top 90%',
        end: 'center center',
        scrub: 1,
        invalidateOnRefresh: true,
      },
    },
  );

  // Palco preso: a faixa corre ate o ultimo card e depois cada card sai, em sequencia.
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: stage.value,
      start: 'center center',
      end: () => `+=${window.innerHeight * 1.8}`,
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
    },
    defaults: { ease: 'none' },
  });
  tl.to(el, {
    x: () => -maxScroll(el),
    duration: TRAVEL,
    onUpdate: () => {
      scrubOffset = -Number(gsap.getProperty(el, 'x'));
      sync();
    },
  });
  tl.fromTo(
    cards,
    { x: 0 },
    { x: () => -offscreen(), duration: 1, stagger: 0.2, ease: 'power2.in', immediateRender: false },
  );

  pinTimeline = tl;
  scrubbed.value = true;
});

// Medidas vem do layout (offsetLeft), que o transform da faixa nao altera.
function stepOf(el: HTMLElement) {
  const card = el.firstElementChild as HTMLElement | null;
  return card ? card.offsetWidth + parseFloat(getComputedStyle(el).columnGap || '0') : 0;
}

function contentWidth(el: HTMLElement) {
  const last = el.lastElementChild as HTMLElement | null;
  return last ? last.offsetLeft + last.offsetWidth : 0;
}

const maxScroll = (el: HTMLElement) => Math.max(0, contentWidth(el) - el.clientWidth);

function sync() {
  const el = track.value;
  if (!el) return;
  const offset = scrubbed.value ? scrubOffset : el.scrollLeft;
  const max = maxScroll(el);
  canPrev.value = offset > 4;
  canNext.value = offset < max - 4;
  const width = Math.min((el.clientWidth / (contentWidth(el) || 1)) * 100, 100);
  thumb.value = { width, left: max > 0 ? (offset / max) * (100 - width) : 0 };
  // No fim da faixa o ultimo card nunca chega ao inicio, entao ele vale como ativo.
  active.value = canNext.value ? Math.round(offset / (stepOf(el) || 1)) : voices.length - 1;
}

function go(direction: 1 | -1) {
  const el = track.value;
  if (!el) return;
  const trigger = pinTimeline?.scrollTrigger;
  if (scrubbed.value && pinTimeline && trigger) {
    // A pagina e quem move a faixa: rola a pagina ate o ponto do card pedido.
    const next = Math.min(Math.max(active.value + direction, 0), voices.length - 1);
    const fraction = Math.min((next * stepOf(el)) / (maxScroll(el) || 1), 1);
    const timeline = (fraction * TRAVEL) / pinTimeline.duration();
    window.scrollTo({
      top: trigger.start + timeline * (trigger.end - trigger.start),
      behavior: 'smooth',
    });
    return;
  }
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollBy({ left: direction * stepOf(el), behavior: reduce ? 'auto' : 'smooth' });
}

// Arrastar com o mouse (toque ja rola nativamente). Sem snap durante o arraste; ao soltar ele reassenta.
let startX = 0;
let startScroll = 0;

function dragStart(e: PointerEvent) {
  if (scrubbed.value || e.pointerType !== 'mouse' || e.button !== 0 || !track.value) return;
  startX = e.clientX;
  startScroll = track.value.scrollLeft;
  dragging.value = true;
  track.value.setPointerCapture(e.pointerId);
}

function dragMove(e: PointerEvent) {
  if (dragging.value && track.value) track.value.scrollLeft = startScroll - (e.clientX - startX);
}

function dragEnd() {
  dragging.value = false;
}

onMounted(sync);
</script>

<template>
  <section ref="root" class="section">
    <div ref="stage">
      <div class="head">
        <header class="section-heading">
          <h2>Empresas que já usam o <span class="gradient-text">Ledger Louis</span></h2>
        </header>

        <div class="controls">
          <span class="count" aria-live="polite">{{ active + 1 }} / {{ voices.length }}</span>
          <button
            type="button"
            class="arrow"
            aria-label="Depoimento anterior"
            :disabled="!canPrev"
            @click="go(-1)"
          >
            <ChevronLeft :size="20" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="arrow"
            aria-label="Próximo depoimento"
            :disabled="!canNext"
            @click="go(1)"
          >
            <ChevronRight :size="20" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div>
        <ul
          ref="track"
          class="track"
          :class="{ 'track--dragging': dragging, 'track--scrubbed': scrubbed }"
          :tabindex="scrubbed ? undefined : 0"
          aria-label="Depoimentos de empresas"
          @scroll.passive="sync"
          @pointerdown="dragStart"
          @pointermove="dragMove"
          @pointerup="dragEnd"
          @pointercancel="dragEnd"
        >
          <li
            v-for="(item, i) in voices"
            :key="item.name"
            class="voice"
            :class="{ 'voice--active': i === active }"
          >
            <figure>
              <blockquote>{{ item.quote }}</blockquote>
              <figcaption>
                <img :src="item.image" :alt="`Logo ${item.name}`" loading="lazy" />
                <div>
                  <strong>{{ item.name }}</strong>
                  <span>{{ item.niche }}</span>
                </div>
              </figcaption>
            </figure>
          </li>
        </ul>

        <div class="progress" aria-hidden="true">
          <span :style="{ width: `${thumb.width}%`, left: `${thumb.left}%` }" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-6);
  margin-bottom: var(--space-10);
}

.head .section-heading {
  margin: 0;
}

.controls {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.count {
  margin-right: var(--space-2);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-variant-numeric: tabular-nums;
  color: var(--color-text-muted);
}

.arrow {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-full);
  background: var(--color-surface-2);
  color: var(--color-text);
  cursor: pointer;
  transition:
    border-color var(--duration-fast),
    color var(--duration-fast),
    opacity var(--duration-fast);
}

.arrow:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary-strong);
}

.arrow:focus-visible,
.track:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
}

.arrow:disabled {
  opacity: 0.35;
  cursor: default;
}

/* Faixa com snap: o proximo card aparece pela metade e convida a rolar. */
.track {
  position: relative;
  display: flex;
  gap: var(--space-4);
  margin: 0;
  padding: 0;
  list-style: none;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  border-radius: var(--radius-lg);
}

.track::-webkit-scrollbar {
  display: none;
}

@media (hover: hover) {
  .track:not(.track--scrubbed) {
    cursor: grab;
  }
}

/* Preso ao scroll da pagina: sem rolagem propria, snap nem recorte; so o ScrollTrigger move os cards. */
.track--scrubbed {
  overflow: visible;
  scroll-snap-type: none;
  border-radius: 0;
}

.track--scrubbed .voice {
  will-change: transform;
}

.track--dragging {
  scroll-snap-type: none;
  cursor: grabbing;
  user-select: none;
}

.voice {
  flex: 0 0 min(88%, 560px);
  scroll-snap-align: start;
  opacity: 0.4;
  transition: opacity var(--duration-slow) var(--ease-out);
}

.voice--active {
  opacity: 1;
}

.voice img {
  -webkit-user-drag: none;
}

figure {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-10);
  height: 100%;
  min-height: 300px;
  margin: 0;
  padding: clamp(var(--space-6), 3.5vw, var(--space-10));
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--gradient-panel);
}

blockquote {
  margin: 0;
  font-size: clamp(1.25rem, 2.4vw, 1.75rem);
  font-weight: 500;
  line-height: 1.25;
  letter-spacing: -0.03em;
  color: var(--color-text);
}

figcaption {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

figcaption img {
  width: 42px;
  height: 42px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  object-fit: cover;
}

figcaption div {
  display: flex;
  flex-direction: column;
}

figcaption strong {
  font-size: var(--text-sm);
  font-weight: 600;
}

figcaption span {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

/* Mesma linguagem da linha do tempo de "Como funciona": trilho fino com preenchimento esmeralda. */
.progress {
  position: relative;
  height: 2px;
  margin-top: var(--space-6);
  background: var(--color-border-strong);
}

.progress span {
  position: absolute;
  top: 0;
  height: 100%;
  background: var(--color-primary);
  transition: left var(--duration-fast) linear;
}
</style>
