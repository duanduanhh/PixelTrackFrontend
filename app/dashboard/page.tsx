"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Users, TrendingUp, MousePointer, Plus, BarChart3, Home } from "lucide-react"
import Link from "next/link"

interface Visit {
  id: number
  pixel_id: number
  ip: string
  email?: string
  phone?: string
  name?: string
  msg?: string
  created_at: string
}

interface DashboardStats {
  totalPV: number
  totalUV: number
  conversionRate: number
  activePixels: number
  recentVisits: Visit[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPV: 0,
    totalUV: 0,
    conversionRate: 0,
    activePixels: 0,
    recentVisits: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      // 获取基本统计数据
      const statsResponse = await fetch(`${DASHBOARD_API}/stats`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      })

      // 获取最近访问记录
      const visitsResponse = await fetch(`${VISIT_API}/GOw6650TFG`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      })

      if (statsResponse.ok && visitsResponse.ok) {
        const statsData = await statsResponse.json()
        const visitsData = await visitsResponse.json()
        
        setStats({
          ...statsData.data,
          recentVisits: visitsData.data.visits
        })
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载统计数据中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold">TrackPixel</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="outline">
                <Home className="mr-2 h-4 w-4" />
                首页
              </Button>
            </Link>
            <Link href="/pixels">
              <Button variant="outline">
                <MousePointer className="mr-2 h-4 w-4" />
                像素管理
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                数据分析
              </Button>
            </Link>
            <Link href="/pixels/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                创建像素
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">数据控制台</h1>
          <p className="text-gray-600">实时查看所有追踪像素的统计数据和访客信息</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Eye className="mr-2 h-4 w-4" />
                总页面浏览量
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPV.toLocaleString()}</div>
              <p className="text-xs text-green-600">+12.5% 较上月</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Users className="mr-2 h-4 w-4" />
                独立访客
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUV.toLocaleString()}</div>
              <p className="text-xs text-green-600">+8.2% 较上月</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <TrendingUp className="mr-2 h-4 w-4" />
                转化率
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversionRate.toFixed(2)}%</div>
              <p className="text-xs text-red-600">-0.3% 较上月</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <MousePointer className="mr-2 h-4 w-4" />
                活跃像素
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activePixels}</div>
              <p className="text-xs text-green-600">+23 较上月</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>最近访客</CardTitle>
              <CardDescription>最新的访客记录</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentVisits.length > 0 ? (
                  stats.recentVisits.map((visit) => (
                    <div key={visit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                      <p className="font-medium">{visit.ip}</p>
                      <p className="text-sm text-gray-600">用户: {visit.name || '匿名'}</p>
                      <p className="text-sm text-gray-500 truncate max-w-xs">联系方式: {visit.email || visit.phone || '未提供'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{new Date(visit.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">暂无访客记录</p>
                    <Link href="/pixels/create">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        创建第一个像素
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>快速操作</CardTitle>
              <CardDescription>常用功能快捷入口</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/pixels/create">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    创建新像素
                  </Button>
                </Link>
                <Link href="/analytics">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    查看详细分析
                  </Button>
                </Link>
                <Link href="/pixels">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <MousePointer className="mr-2 h-4 w-4" />
                    管理所有像素
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
