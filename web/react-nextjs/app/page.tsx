import { Alert, Card, Space, Typography } from 'antd'
import Counter from '@/components/counter'

const { Title, Paragraph } = Typography

export default function Home() {
  return (
    <main style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={2} style={{ margin: 0 }}>
            React + Next.js 学习项目
          </Title>

          <Alert
            type="success"
            showIcon
            message="技术栈"
            description="React Hooks · Next.js · TypeScript · Redux Toolkit · Ant Design"
            closable={false}
          />

          <Paragraph>
            以下是一个使用 <strong>Redux Toolkit</strong> 管理状态、
            <strong>Ant Design</strong> 构建 UI 的计数器示例：
          </Paragraph>

          <Counter />
        </Space>
      </Card>
    </main>
  )
}
