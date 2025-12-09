import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 커스텀 도메인 사용 → 사이트 루트가 '/' 이므로 이렇게 설정
  base: '/',
  build: {
    // GitHub Pages가 docs 폴더를 바라보도록 쓰고 있던 설정이면 그대로 유지
    outDir: 'docs',
  },
})
