import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/pixelcraft16/', // 레포 이름
  plugins: [react()],
})
