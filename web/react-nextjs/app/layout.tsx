import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.scss'
import ReduxProvider from '@/components/redux-provider'
import AntdProvider from '@/components/antd-provider'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'React Next.js 学习项目',
  description: 'React Hooks · Next.js · TypeScript · Redux · Ant Design',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ReduxProvider>
          <AntdProvider>{children}</AntdProvider>
        </ReduxProvider>
      </body>
    </html>
  )
}

