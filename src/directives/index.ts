import type { App } from 'vue';
import { vReveal } from './reveal';
import { vMagnetic, vSpotlight, vTilt } from './pointer';

export const registerDirectives = (app: App) => {
  app.directive('reveal', vReveal);
  app.directive('tilt', vTilt);
  app.directive('spotlight', vSpotlight);
  app.directive('magnetic', vMagnetic);
};
