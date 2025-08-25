"use client"

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Home, BarChart2 } from 'lucide-react'
import Link from 'next/link'

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

export default function PixelAnalyticsPage() {
  const params = useParams()
  const trackCode = params.trackCode as string
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (trackCode) {
      fetchVisits(trackCode)
    }
  }, [trackCode])

  const fetchVisits = async (code: string) => {
    // 强制使用指定格式的trackCode
    if (!/^[A-Za-z0-9]{8,12}$/.test(code)) {
      console.error('Invalid trackCode format')
      return
    }
    
    try {
      console.log(`正在请求指定接口: http://127.0.0.1:8000/visit/${code}`)
      const response = await fetch(`http://127.0.0.1:8000/visit/${code}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      })

      console.log('响应状态:', response.status)
      if (response.ok) {
        const result = await response.json()
        console.log('接口返回数据:', result)
        if (result.code === 0) {
          console.log('有效数据:', result.data.visits)
          setVisits(result.data.visits || [])
        } else {
          console.error('API错误:', result.message)
          setVisits([])
        }
      } else {
        console.error('请求失败:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Failed to fetch visits:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在从指定数据接口加载数据...</p>
          <p className="text-sm text-gray-400 mt-2">
            /visit/{trackCode}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart2 className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold">像素数据分析</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="outline">
                <Home className="mr-2 h-4 w-4" />
                首页
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>
              访问记录 - {trackCode}
              <span className="ml-2 text-sm font-normal text-gray-500">
                (共 {visits.length} 条记录)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IP</TableHead>
                  <TableHead>用户</TableHead>
                  <TableHead>联系方式</TableHead>
                  <TableHead>留言</TableHead>
                  <TableHead>访问时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visits.length > 0 ? (
                  visits.map((visit) => (
                    <TableRow key={visit.id}>
                      <TableCell>{visit.ip}</TableCell>
                      <TableCell>{visit.name || '匿名'}</TableCell>
                      <TableCell>{visit.email || visit.phone || '未提供'}</TableCell>
                      <TableCell>{visit.msg || '-'}</TableCell>
                      <TableCell>{new Date(visit.created_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <p className="text-gray-500">暂无访问记录</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}