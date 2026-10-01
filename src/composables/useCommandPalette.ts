import { ref } from 'vue';

/** Estado compartilhado: o botao do header e o atalho Ctrl/Cmd+K abrem a mesma paleta. */
const isOpen = ref(false);

export const useCommandPalette = () => ({
  isOpen,
  open: () => {
    isOpen.value = true;
  },
  close: () => {
    isOpen.value = false;
  },
  toggle: () => {
    isOpen.value = !isOpen.value;
  },
});
