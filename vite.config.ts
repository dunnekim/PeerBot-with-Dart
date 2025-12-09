import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/PeerBot-with-Dart/',      // GitHub Pages 주소 기준
  build: {
    outDir: 'docs',                 // GitHub Pages가 바라보는 폴더
    emptyOutDir: true,              // 기존 docs 싹 비우고 다시 만들기
  },
});
