// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
    '@element-plus/nuxt',
  ],

  elementPlus: {
    importStyle: 'css',
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  compatibilityDate: '2024-11-01',
})
