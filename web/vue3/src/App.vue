<template>
  <div class="container">
    <el-card class="main-card">
      <template #header>
        <h1>Vue3 学习项目</h1>
        <p class="subtitle">Vue3 · Vite · TypeScript · Pinia · Element Plus</p>
      </template>

      <el-space direction="vertical" :size="20" fill>
        <el-alert
          title="技术栈说明"
          type="success"
          description="使用 Vite 构建，集成 Pinia 状态管理和 Element Plus UI 组件库"
          show-icon
          :closable="false"
        />

        <el-card shadow="never">
          <template #header>Pinia 计数器示例</template>
          <el-space>
            <el-button type="primary" :icon="Minus" @click="counter.decrement" />
            <el-tag size="large" type="primary">{{ counter.count }}</el-tag>
            <el-button type="primary" :icon="Plus" @click="counter.increment" />
            <el-button @click="handleReset">重置</el-button>
          </el-space>
          <p class="hint">双倍值：{{ counter.doubleCount }}</p>
        </el-card>

        <el-card shadow="never">
          <template #header>Element Plus 表单示例</template>
          <el-form :model="form" label-width="80px" style="max-width: 400px">
            <el-form-item label="姓名">
              <el-input v-model="form.name" placeholder="请输入姓名" />
            </el-form-item>
            <el-form-item label="年龄">
              <el-input-number v-model="form.age" :min="1" :max="120" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSubmit">提交</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Minus, Plus } from '@element-plus/icons-vue'
import { useCounterStore } from './stores/counter'

const counter = useCounterStore()

const form = reactive({ name: '', age: 18 })

function handleReset() {
  counter.reset()
  ElMessage.success('已重置')
}

function handleSubmit() {
  ElMessage.success(`提交成功：${form.name}，${form.age} 岁`)
}
</script>

<style scoped lang="scss">
// SCSS 变量
$max-width: 800px;
$color-muted: #909399;
$spacing-base: 20px;

.container {
  max-width: $max-width;
  margin: 40px auto;
  padding: 0 $spacing-base;
}

.main-card {
  h1 {
    margin: 0 0 4px;
    font-size: 1.5rem;
  }
}

.subtitle {
  margin: 0;
  color: $color-muted;
  font-size: 0.875rem;
}

.hint {
  margin: 12px 0 0;
  color: $color-muted;
  font-size: 0.875rem;
}
</style>
