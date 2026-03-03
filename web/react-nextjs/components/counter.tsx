'use client'

import { Button, Space, Tag, Card, message } from 'antd'
import { MinusOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { increment, decrement, reset } from '@/store/slices/counter-slice'

export default function Counter() {
  const count = useAppSelector((state) => state.counter.value)
  const dispatch = useAppDispatch()
  const [messageApi, contextHolder] = message.useMessage()

  function handleReset() {
    dispatch(reset())
    messageApi.success('计数器已重置')
  }

  return (
    <>
      {contextHolder}
      <Card title="Redux 计数器示例" style={{ maxWidth: 400 }}>
        <Space size="middle" align="center">
          <Button
            type="primary"
            icon={<MinusOutlined />}
            onClick={() => dispatch(decrement())}
          />
          <Tag color="blue" style={{ fontSize: 18, padding: '4px 16px' }}>
            {count}
          </Tag>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => dispatch(increment())}
          />
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            重置
          </Button>
        </Space>
      </Card>
    </>
  )
}
