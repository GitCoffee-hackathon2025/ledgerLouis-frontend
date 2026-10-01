import type { Directive } from 'vue';

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let observer: IntersectionObserver | null = null;

const getObserver = () => {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer?.unobserve(entry.target);
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
  );
  return observer;
};

/**
 * `v-reveal` — o elemento aparece com fade + subida quando entra na tela.
 * `v-reveal="2"` atrasa a entrada em 2 passos (~70ms cada), para escalonar
 * itens de uma grade.
 */
export const vReveal: Directive<HTMLElement, number | undefined> = {
  mounted(el, { value }) {
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) return;
    el.classList.add('reveal');
    if (value) el.style.setProperty('--reveal-delay', `${value * 70}ms`);
    getObserver().observe(el);
  },
  unmounted(el) {
    observer?.unobserve(el);
  },
};
