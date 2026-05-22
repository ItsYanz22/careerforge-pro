import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [
    react({
      // Enable automatic JSX runtime optimization
      fastRefresh: true,
      // Babel plugins for better optimization
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-pure-annotations'],
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@config': path.resolve(__dirname, './src/config'),
      '@templates': path.resolve(__dirname, './src/templates'),
      '@layouts': path.resolve(__dirname, './src/layouts'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@api': path.resolve(__dirname, './src/api'),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react')) {
              return 'react-vendor'
            }
            if (id.includes('@tanstack')) {
              return 'router-vendor'
            }
            if (id.includes('recharts')) {
              return 'charts-vendor'
            }
            if (id.includes('framer-motion')) {
              return 'animation-vendor'
            }
            if (id.includes('lucide-react')) {
              return 'icons-vendor'
            }
            if (id.includes('zustand')) {
              return 'state-vendor'
            }
            return 'common-vendor'
          }
          
          // Feature-based chunks
          if (id.includes('src/components/ai')) {
            return 'feature-ai'
          }
          if (id.includes('src/components/resume')) {
            return 'feature-resume'
          }
          if (id.includes('src/components/dashboard')) {
            return 'feature-dashboard'
          }
          if (id.includes('src/components/export')) {
            return 'feature-export'
          }
          if (id.includes('src/pages')) {
            return 'pages'
          }
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/png|jpe?g|gif|svg/.test(ext)) {
            return `assets/images/[name].[hash][extname]`
          }
          if (/woff|woff2|eot|ttf|otf/.test(ext)) {
            return `assets/fonts/[name].[hash][extname]`
          }
          return `assets/[name].[hash][extname]`
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tanstack/react-router',
      'zustand',
      'recharts',
      'framer-motion',
      'lucide-react',
      'axios',
    ],
  },
})
