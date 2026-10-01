import { onBeforeUnmount, onMounted, type Ref } from 'vue';

type Gsap = typeof import('gsap').gsap;
type ScrollTriggerPlugin = typeof import('gsap/ScrollTrigger').ScrollTrigger;

/**
 * Executa animacoes GSAP presas a um elemento raiz.
 * - GSAP e carregado sob demanda (fora do bundle inicial).
 * - Tudo roda dentro de um matchMedia: com prefers-reduced-motion nada anima
 *   e o conteudo fica no estado final.
 * - Ao desmontar, `revert()` desfaz tweens, ScrollTriggers e estilos inline.
 */
export const useGsapScope = (
  scope: Ref<HTMLElement | undefined>,
  setup: (tools: { gsap: Gsap; ScrollTrigger: ScrollTriggerPlugin }) => void,
) => {
  let mm: ReturnType<Gsap['matchMedia']> | undefined;
  let disposed = false;

  onMounted(async () => {
    const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
    if (disposed || !scope.value) return;
    gsap.registerPlugin(ScrollTrigger);
    mm = gsap.matchMedia(scope.value);
    mm.add('(prefers-reduced-motion: no-preference)', () => setup({ gsap, ScrollTrigger }));
  });

  onBeforeUnmount(() => {
    disposed = true;
    mm?.revert();
  });
};
