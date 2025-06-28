import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
// import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    // vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // GitHub Pages部署配置
  base: process.env.NODE_ENV === 'production' ? '/music-app/' : '/',
  server: {
    port: 5188, // 固定前端端口为5188，避免与后端3000端口冲突
    host: true, // 允许外部访问
    open: true, // 自动打开浏览器
    strictPort: false, // 如果端口被占用，自动尝试下一个可用端口
    // 添加代理配置，当后端不可用时提供更好的错误处理
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        timeout: 5000,
        // 当后端不可用时的错误处理
        onError: (err, req, res) => {
          console.warn('API代理错误:', err.message)
        },
      },
    },
  },
  preview: {
    port: 4173, // 预览模式端口
    host: true,
  },
  build: {
    // 启用源码映射，方便调试
    sourcemap: process.env.NODE_ENV !== 'production',
    // 代码分割策略
    rollupOptions: {
      output: {
        // 将第三方库单独打包
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['lucide-vue-next'],
          'utils-vendor': ['axios', 'socket.io-client'],
        },
        // 静态资源文件名格式
        assetFileNames: assetInfo => {
          const fileName = assetInfo.name || ''
          const info = fileName.split('.')
          let extType = info[info.length - 1]
          if (/\.(mp3|wav|ogg|flac)$/i.test(fileName)) {
            extType = 'audio'
          } else if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(fileName)) {
            extType = 'img'
          } else if (/\.(woff2?|eot|ttf|otf)$/i.test(fileName)) {
            extType = 'fonts'
          }
          return `assets/${extType}/[name]-[hash][extname]`
        },
        // 入口文件名格式
        entryFileNames: 'assets/js/[name]-[hash].js',
        // 代码块文件名格式
        chunkFileNames: chunkInfo => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/') : []
          const fileName = facadeModuleId[facadeModuleId.length - 2] || '[name]'
          return `assets/js/${fileName}-[hash].js`
        },
      },
    },
    // 压缩选项
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production', // 生产环境下删除console
        drop_debugger: process.env.NODE_ENV === 'production', // 生产环境下删除debugger
      },
    },
    // 启用CSS代码分割
    cssCodeSplit: true,
    // 启用CSS压缩
    cssMinify: true,
    // 设置chunk大小警告的限制
    chunkSizeWarningLimit: 1000, // 单位kb
  },
  // CSS预处理器选项
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/assets/styles/variables.scss";`,
      },
    },
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'axios', 'lucide-vue-next', 'socket.io-client'],
  },
})
