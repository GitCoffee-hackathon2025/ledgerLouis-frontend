import type { Directive } from 'vue';

/**
 * Efeitos guiados pelo cursor. Todos escrevem CSS custom properties (nada de
 * estado reativo): o navegador anima via transform, sem re-render do Vue.
 * Desligados em telas de toque e com prefers-reduced-motion.
 */
const canHover = () =>
  window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type Cleanup = () => void;
const cleanups = new WeakMap<HTMLElement, Cleanup>();

const bind = (el: HTMLElement, setup: (el: HTMLElement) => Cleanup) => {
  if (!canHover()) return;
  cleanups.set(el, setup(el));
};

const unbind = (el: HTMLElement) => {
  cleanups.get(el)?.();
  cleanups.delete(el);
};

/** Agrupa pointermove em um unico frame. */
const frameThrottle = (fn: (e: PointerEvent) => void) => {
  let frame = 0;
  let last: PointerEvent;
  return (e: PointerEvent) => {
    last = e;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      fn(last);
    });
  };
};

/**
 * `v-tilt` - inclina o elemento ate `max` graus (padrao 4) em direcao ao
 * cursor e posiciona o reflexo via --mx/--my. Combine com a classe `.tilt`.
 */
export const vTilt: Directive<HTMLElement, number | undefined> = {
  mounted(el, { value }) {
    const max = value ?? 4;
    bind(el, () => {
      const move = frameThrottle((e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        el.classList.add('is-tilting');
        el.style.setProperty('--ry', `${((x - 0.5) * 2 * max).toFixed(2)}deg`);
        el.style.setProperty('--rx', `${((0.5 - y) * 2 * max).toFixed(2)}deg`);
        el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
        el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
      });
      const leave = () => {
        el.classList.remove('is-tilting');
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      };
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerleave', leave);
      return () => {
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerleave', leave);
      };
    });
  },
  unmounted: unbind,
};

/** `v-spotlight` - so a luz que segue o cursor (classe `.spotlight`), sem inclinar. */
export const vSpotlight: Directive<HTMLElement> = {
  mounted(el) {
    bind(el, () => {
      const move = frameThrottle((e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
        el.style.setProperty('--my', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
      });
      el.addEventListener('pointermove', move);
      return () => el.removeEventListener('pointermove', move);
    });
  },
  unmounted: unbind,
};

/**
 * `v-magnetic` - o elemento se desloca ate `pull` px em direcao ao cursor
 * quando ele chega perto. Pensado para CTAs primarios, nao para todo botao.
 */
export const vMagnetic: Directive<HTMLElement, number | undefined> = {
  mounted(el, { value }) {
    const pull = value ?? 8;
    bind(el, () => {
      const move = frameThrottle((e) => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        el.style.transform = `translate(${(dx * pull).toFixed(1)}px, ${(dy * pull).toFixed(1)}px)`;
      });
      const leave = () => {
        el.style.transform = '';
      };
      el.style.transition = 'transform 400ms var(--ease-out)';
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerleave', leave);
      return () => {
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerleave', leave);
      };
    });
  },
  unmounted: unbind,
};
