import { Alert, Button, Card, Form, Input, InputNumber, Space, Tag, App as AntdApp } from 'antd'
import { MinusOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { increment, decrement, reset } from './store/slices/counter-slice'

function Counter() {
  const count = useAppSelector((state) => state.counter.value)
  const dispatch = useAppDispatch()
  const { message } = AntdApp.useApp()

  function handleReset() {
    dispatch(reset())
    message.success('已重置')
  }

  return (
    <Card title="Redux 计数器示例" variant="borderless">
      <Space size="middle" align="center">
        <Button type="primary" icon={<MinusOutlined />} onClick={() => dispatch(decrement())} />
        <Tag color="blue" style={{ fontSize: 16, padding: '4px 16px' }}>{count}</Tag>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => dispatch(increment())} />
        <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
      </Space>
    </Card>
  )
}

function FormExample() {
  const { message } = AntdApp.useApp()
  const [form] = Form.useForm()

  function handleSubmit(values: { name: string; age: number }) {
    message.success(`提交成功：${values.name}，${values.age} 岁`)
  }

  return (
    <Card title="Ant Design 表单示例" variant="borderless">
      <Form form={form} labelCol={{ span: 4 }} style={{ maxWidth: 400 }} onFinish={handleSubmit}>
        <Form.Item label="姓名" name="name" rules={[{ required: true, message: '请输入姓名' }]}>
          <Input placeholder="请输入姓名" />
        </Form.Item>
        <Form.Item label="年龄" name="age" initialValue={18}>
          <InputNumber min={1} max={120} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">提交</Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default function App() {
  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <h1 style={{ margin: '0 0 4px' }}>React 学习项目</h1>
            <p style={{ margin: 0, color: '#909399', fontSize: '0.875rem' }}>
              React · Vite · TypeScript · Redux Toolkit · Ant Design
            </p>
          </div>
          <Alert
            type="success"
            showIcon
            message="技术栈说明"
            description="使用 Vite 构建，集成 Redux Toolkit 状态管理和 Ant Design UI 组件库"
            closable={false}
          />
          <Counter />
          <FormExample />
        </Space>
      </Card>
    </div>
  )
}
