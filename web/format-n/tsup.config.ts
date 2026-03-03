import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: false,
  splitting: false,
  treeshake: true,
  outDir: 'dist',
  // 声明为外部依赖，不打包进产物（由 dependencies 字段保证消费方自动安装）
  external: ['bignumber.js', 'dayjs', 'lodash'],
  // 生成 banner 注释
  banner: {
    js: '/* format-n - 前端格式化工具库 */',
  },
})
