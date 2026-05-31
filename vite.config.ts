import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/chrono-gacha-sim/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
});
