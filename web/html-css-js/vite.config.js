import { defineConfig } from 'vite'

export default defineConfig({
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
