"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Eye, MousePointer, TrendingUp, Zap } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import PasswordProtect from "@/components/auth/PasswordProtect"

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // 检查sessionStorage中是否有认证标记
    const auth = sessionStorage.getItem("isAuthenticated")
    setIsAuthenticated(auth === "true")
  }, [])

  if (!isAuthenticated && process.env.NEXT_PUBLIC_HOME_PASSWORD) {
    return <PasswordProtect />
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">TrackPixel</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/pixels">
              <Button variant="ghost">像素管理</Button>
            </Link>
            <Link href="/pixels/create">
              <Button>创建像素</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">免费追踪像素工具</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            无需注册，立即生成追踪像素，收集访客数据，实时查看统计信息
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/pixels">
              <Button size="lg" className="px-8">
                <Zap className="mr-2 h-5 w-5" />
                立即开始使用
              </Button>
            </Link>
            <Link href="/pixels/create">
              <Button variant="outline" size="lg" className="px-8 bg-transparent">
                创建追踪像素
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">核心功能</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <MousePointer className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>像素管理</CardTitle>
                <CardDescription>快速创建追踪像素，自定义收集字段，一键复制代码</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>数据分析</CardTitle>
                <CardDescription>实时访客统计，线索收集，转化率计算</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>完全免费</CardTitle>
                <CardDescription>无需注册账户，所有功能完全免费使用</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>


      {/* How it works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">使用步骤</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">创建像素</h3>
              <p className="text-gray-600">点击创建按钮，填写像素名称和描述</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">复制代码</h3>
              <p className="text-gray-600">复制生成的追踪代码到您的网站</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">查看数据</h3>
              <p className="text-gray-600">实时查看访客数据和转化统计</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Eye className="h-6 w-6" />
                <span className="text-xl font-bold">TrackPixel</span>
              </div>
              <p className="text-gray-400">免费的追踪像素工具，无需注册即可使用</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">功能</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/pixels">像素管理</Link>
                </li>
                <li>
                  <Link href="/pixels/create">创建像素</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">支持</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/help">使用帮助</Link>
                </li>
                <li>
                  <Link href="/contact">联系我们</Link>
                </li>
                <li>
                  <Link href="/api-docs">API文档</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">关于</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about">关于项目</Link>
                </li>
                <li>
                  <Link href="/privacy">隐私政策</Link>
                </li>
                <li>
                  <Link href="/terms">使用条款</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TrackPixel. 开源免费的追踪像素工具.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
