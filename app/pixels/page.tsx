"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Eye, Plus, Search, MoreHorizontal, Copy, Edit, Trash2, Power, PowerOff, Home, BarChart3 } from "lucide-react"
import Link from "next/link"

interface Pixel {
  id: string
  name: string
  track_code: string
  status: boolean
  fields: any
  created_at: string
}

export default function PixelsPage() {
  const [pixels, setPixels] = useState<Pixel[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchPixels()
  }, [])

  const fetchPixels = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/pixels", {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      })

      if (response.ok) {
        const { data } = await response.json()
        setPixels(Array.isArray(data) ? data : [])
      } else {
        setPixels([])
      }
    } catch (error) {
      console.error("Failed to fetch pixels:", error)
    } finally {
      setLoading(false)
    }
  }

  const togglePixelStatus = async (pixelId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/pixels/${pixelId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: !currentStatus }),
      })

      if (response.ok) {
        fetchPixels()
      }
    } catch (error) {
      console.error("Failed to toggle pixel status:", error)
    }
  }

  const deletePixel = async (pixelId: string) => {
    if (!confirm("确定要删除这个像素吗？此操作不可恢复。")) {
      return
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/pixels/${pixelId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchPixels()
      }
    } catch (error) {
      console.error("Failed to delete pixel:", error)
    }
  }

  const copyTrackingCode = (pixel: Pixel) => {
    const trackingCode = `<img src="${window.location.origin}/track/${pixel.track_code}" width="1" height="1" style="display:none;" />`
    navigator.clipboard.writeText(trackingCode)
    alert("追踪代码已复制到剪贴板")
  }

  const filteredPixels = (Array.isArray(pixels) ? pixels : []).filter(
    (pixel) => pixel?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载像素列表中...</p>
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
            <Link href="/dashboard">
              <Button variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                控制台
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
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">像素管理</h1>
          <p className="text-gray-600">管理您的追踪像素，查看统计数据和复制追踪代码</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索像素名称或描述..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pixels Table */}
        <Card>
          <CardHeader>
            <CardTitle>像素列表</CardTitle>
            <CardDescription>共 {filteredPixels.length} 个像素</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名称</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>PV</TableHead>
                  <TableHead>UV</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPixels.length > 0 ? (
                  filteredPixels.map((pixel) => (
                    <TableRow key={pixel.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{pixel.name}</p>
                          <p className="text-sm text-gray-500">{pixel.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={pixel.status ? "default" : "secondary"}>
                          {pixel.status ? "启用" : "停用"}
                        </Badge>
                      </TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>{new Date(pixel.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => copyTrackingCode(pixel)}>
                              <Copy className="mr-2 h-4 w-4" />
                              复制代码
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => togglePixelStatus(pixel.id, pixel.status)}>
                              {pixel.status === 1 ? (
                                <>
                                  <PowerOff className="mr-2 h-4 w-4" />
                                  停用
                                </>
                              ) : (
                                <>
                                  <Power className="mr-2 h-4 w-4" />
                                  启用
                                </>
                              )}
                            </DropdownMenuItem>
                            <Link href={`/analytics?trackCode=${pixel.track_code}`}>
                              <DropdownMenuItem>
                                <BarChart3 className="mr-2 h-4 w-4" />
                                数据分析
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              编辑
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deletePixel(pixel.id)} className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="text-gray-500 mb-4">
                        {searchTerm ? "没有找到匹配的像素" : "还没有创建任何像素"}
                      </div>
                      {!searchTerm && (
                        <Link href="/pixels/create">
                          <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            创建第一个像素
                          </Button>
                        </Link>
                      )}
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
