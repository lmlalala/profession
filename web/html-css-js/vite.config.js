import { defineConfig } from 'vite'
import postcssPxtorem from 'postcss-pxtorem'

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        postcssPxtorem({
          rootValue: 16,
          propList: ['*'],
          // 不转换以下属性，避免影响边框等细节
          exclude: /node_modules/i,
          // 小于 1px 的不转换
          minPixelValue: 1,
          // 不转换媒体查询中的 px（媒体查询断点保持 px）
          mediaQuery: false,
        }),
      ],
    },
  },
  // 多页面应用配置
  build: {
    rollupOptions: {
      input: {
        main:           'index.html',
        html5:          'pages/html5.html',
        cssLayout:      'pages/css-layout.html',
        cssAnimation:   'pages/css-animation.html',
        cssInterview:   'pages/css-interview.html',
        jsBasic:        'pages/js-basic.html',
        jsEs6:          'pages/js-es6.html',
        jsAsync:        'pages/js-async.html',
        jsAdvanced:     'pages/js-advanced.html',
        vue2Principle:  'pages/vue2-principle.html',
        vue3Principle:  'pages/vue3-principle.html',
        reactPrinciple: 'pages/react-principle.html',
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    host: true,
  },
  preview: {
    port: 4000,
    open: true,
  },
})
