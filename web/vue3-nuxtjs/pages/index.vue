<template>
  <div class="container">
    <el-card class="welcome-card">
      <template #header>
        <h1>Vue3 + Nuxt3 学习项目</h1>
      </template>

      <el-space direction="vertical" :size="20" fill>
        <el-alert
          title="技术栈"
          type="success"
          description="Vue3 · Nuxt3 · TypeScript · Pinia · Element Plus"
          show-icon
          :closable="false"
        />

        <div>
          <p>计数器示例（Pinia）：</p>
          <el-space>
            <el-button type="primary" @click="counter.decrement">-</el-button>
            <el-tag size="large">{{ counter.count }}</el-tag>
            <el-button type="primary" @click="counter.increment">+</el-button>
            <el-button @click="counter.reset">重置</el-button>
          </el-space>
        </div>

        <el-button type="success" @click="showMessage">
          显示通知
        </el-button>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useCounterStore } from '~/stores/counter'

const counter = useCounterStore()

function showMessage() {
  ElMessage.success('Element Plus 通知正常工作！')
}
</script>

<style scoped lang="scss">
.container {
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
}

.welcome-card h1 {
  margin: 0;
  font-size: 1.5rem;
}
</style>
