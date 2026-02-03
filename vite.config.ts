import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // For GitLab Pages: set base to your project name
  // Example: if your repo is gitlab.com/username/fixed-width-data-mapper
  // then use: base: '/fixed-width-data-mapper/'
  // For user/group pages (username.gitlab.io), use: base: '/'
  base: '/fixed-width-data-mapper/',
})
