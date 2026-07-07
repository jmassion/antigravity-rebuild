import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: '../../projects/spatial-lab',
    emptyOutDir: true,
  },
});
