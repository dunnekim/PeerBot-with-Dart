import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/PeerBot-with-Dart/',      // GitHub Pages 주소 기준// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',              // ← 여기만 바꾸거나 아예 지워도 됨(기본값이 '/')
  build: {
    outDir: 'docs',       // GitHub Pages가 docs 폴더를 바라보도록 쓰던 설정이면 그대로 유지
  },
});
