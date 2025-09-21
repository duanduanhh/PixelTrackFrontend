"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Eye, Home, Download, ArrowLeft, RefreshCw, CheckCircle, Server, Clock, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { API_BASE_URL } from "@/lib/config"

interface Visit {
  id: number
  pixel_id: number
  ip: string
  country?: string
  browser?: string
  os?: string
  user_agent?: string
  referer?: string
  email: string
  phone: string
  name: string
  msg: string
  created_at: string
}

interface VisitData {
  visits: Visit[]
  total: number
  page?: number
  pageSize?: number
  totalPages?: number
}

interface ApiResponse {
  code: number
  message: string
  data: VisitData | null
}

export default function PixelAnalyticsPage() {
  const searchParams = useSearchParams()
  const trackCode = searchParams.get('trackCode') || ''

  const [data, setData] = useState<VisitData>({
    visits: [],
    total: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(false)

  useEffect(() => {
    if (trackCode) {
      fetchVisitData()
    }
  }, [trackCode, currentPage, pageSize])

  // Auto refresh every 30 seconds if enabled
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (autoRefresh && trackCode) {
      interval = setInterval(() => {
        fetchVisitData(true) // Silent refresh
      }, 30000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh, trackCode, currentPage, pageSize])

  const fetchVisitData = async (silent = false) => {
    if (!silent) {
      setLoading(true)
      setError(null)
    }

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
      })

      const apiUrl = `${API_BASE_URL}/visit/${trackCode}?${params}`
      console.log("🔄 Requesting visit data from backend:", apiUrl)

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store", // Always fetch fresh data
      })

      console.log("📊 Response status:", response.status)

      if (response.ok) {
        const result: ApiResponse = await response.json()
        console.log("✅ API Response:", result)

        if (result.code === 0 && result.data) {
          const safeData: VisitData = {
            visits: Array.isArray(result.data.visits) ? result.data.visits : [],
            total: Number(result.data.total) || 0,
            page: result.data.page,
            pageSize: result.data.pageSize,
            totalPages: result.data.totalPages,
          }
          setData(safeData)
          setLastUpdated(new Date())
          if (!silent) {
            setError(null)
          }
        } else {
          if (!silent) {
            setError(result.message || "获取访客数据失败")
          }
        }
      } else {
        const errorData = await response.json()
        if (!silent) {
          setError(errorData.message || `网络请求失败: ${response.status} ${response.statusText}`)
        }
      }
    } catch (error) {
      console.error("💥 Failed to fetch visit data:", error)
      if (!silent) {
        setError(`请求失败: ${error instanceof Error ? error.message : "未知错误"}`)
      }
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }

  const exportToCSV = () => {
    if (data.visits.length === 0) {
      alert("没有数据可导出")
      return
    }

    const headers = ["ID", "像素ID", "IP地址", "国家", "浏览器", "操作系统", "用户代理", "来源页面", "邮箱", "电话", "姓名", "留言", "访问时间"]
    const csvContent = [
      headers.join(","),
      ...data.visits.map((visit) =>
        [
          visit.id,
          visit.pixel_id,
          visit.ip,
          visit.country || "",
          visit.browser || "",
          visit.os || "",
          `"${(visit.user_agent || "").replace(/"/g, '""')}"`,
          visit.referer || "",
          visit.email || "",
          visit.phone || "",
          visit.name || "",
          `"${(visit.msg || "").replace(/"/g, '""')}"`,
          new Date(visit.created_at).toLocaleString(),
        ].join(","),
      ),
    ].join("\n")

    // 添加UTF-8 BOM以解决Excel中文乱码问题
    const csvWithBOM = "\uFEFF" + csvContent
    const blob = new Blob([csvWithBOM], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `访客数据_${trackCode}_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(Number.parseInt(newPageSize))
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在从后端实时获取访客数据...</p>
          <p className="text-sm text-gray-500 mt-2">追踪代码: {trackCode}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-600 mb-4">后端数据获取失败</h2>
          <div className="text-red-600 mb-6 p-4 bg-red-50 rounded-lg">
            <p className="font-medium">{error}</p>
          </div>
          <div className="space-y-2">
            <Button onClick={() => fetchVisitData()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              重新获取数据
            </Button>
            <div className="text-sm text-gray-500">追踪代码: {trackCode}</div>
          </div>
        </div>
      </div>
    )
  }

  const totalPages = data.totalPages || Math.ceil(data.total / pageSize)

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
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回像素管理
              </Button>
            </Link>
            <Button variant="outline" onClick={() => fetchVisitData()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              刷新数据
            </Button>
            <Button
              variant="outline"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? "bg-green-50 border-green-200 text-green-700" : ""}
            >
              <Clock className="mr-2 h-4 w-4" />
              {autoRefresh ? "停止自动刷新" : "自动刷新"}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">实时数据分析</h1>
          <p className="text-gray-600">
            追踪代码: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{trackCode}</span>
          </p>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">实时后端数据</span>
            </div>
            <div className="flex items-center space-x-2">
              <Server className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-blue-600">API路由代理</span>
            </div>
            {lastUpdated && (
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">最后更新: {lastUpdated.toLocaleTimeString()}</span>
              </div>
            )}
            {autoRefresh && (
              <div className="flex items-center space-x-2">
                <div className="animate-pulse h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">自动刷新中</span>
              </div>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">总访问量</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.total}</div>
              <p className="text-xs text-green-600">实时统计</p>
            </CardContent>
          </Card>

          {data.visits.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">国家分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(() => {
                    const countryStats = data.visits.reduce((acc, visit) => {
                      if (visit.country) {
                        acc[visit.country] = (acc[visit.country] || 0) + 1
                      }
                      return acc
                    }, {} as Record<string, number>)
                    
                    const topCountries = Object.entries(countryStats)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 3)
                    
                    return topCountries.length > 0 ? (
                      topCountries.map(([country, count]) => (
                        <div key={country} className="flex items-center justify-between">
                          <span className="text-sm">{country}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400">暂无国家数据</span>
                    )
                  })()}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Visitor Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>访客详细数据</CardTitle>
            <CardDescription className="flex items-center justify-between">
              <span>
                {data.total === 0 ? (
                  "后端暂无访客数据"
                ) : (
                  <>
                    实时显示后端数据 - 共 {data.total} 条记录
                    {totalPages > 1 && (
                      <>
                        ，第 {currentPage} / {totalPages} 页
                      </>
                    )}
                    {lastUpdated && (
                      <span className="ml-2 text-xs text-gray-400">(更新于 {lastUpdated.toLocaleString()})</span>
                    )}
                  </>
                )}
              </span>
              <div className="flex items-center space-x-4">
                {totalPages > 1 && (
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="pageSize" className="text-sm">
                      每页显示:
                    </Label>
                    <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent"
                  onClick={exportToCSV}
                  disabled={data.visits.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  导出CSV
                </Button>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>像素ID</TableHead>
                    <TableHead>IP地址</TableHead>
                    <TableHead>国家</TableHead>
                    <TableHead>浏览器</TableHead>
                    <TableHead>操作系统</TableHead>
                    <TableHead>来源页面</TableHead>
                    <TableHead>邮箱</TableHead>
                    <TableHead>电话</TableHead>
                    <TableHead>姓名</TableHead>
                    <TableHead>留言</TableHead>
                    <TableHead>访问时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.visits.length > 0 ? (
                    data.visits.map((visit) => (
                      <TableRow key={visit.id}>
                        <TableCell className="font-mono">{visit.id}</TableCell>
                        <TableCell className="font-mono">{visit.pixel_id}</TableCell>
                        <TableCell className="font-mono">{visit.ip}</TableCell>
                        <TableCell>
                          {visit.country ? (
                            <Badge variant="outline">{visit.country}</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {visit.browser ? (
                            <Badge variant="outline">{visit.browser}</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {visit.os ? (
                            <Badge variant="outline">{visit.os}</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={visit.referer}>
                          {visit.referer ? (
                            <a href={visit.referer} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {visit.referer}
                            </a>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {visit.email ? (
                            <Badge variant="outline">{visit.email}</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {visit.phone ? (
                            <Badge variant="outline">{visit.phone}</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>{visit.name || <span className="text-gray-400">-</span>}</TableCell>
                        <TableCell className="max-w-xs truncate" title={visit.msg}>
                          {visit.msg || <span className="text-gray-400">-</span>}
                        </TableCell>
                        <TableCell>{new Date(visit.created_at).toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-8">
                        <div className="text-gray-500">后端暂无该像素的访客数据</div>
                        <p className="text-sm text-gray-400 mt-2">当有用户访问追踪链接时，数据将实时显示在这里</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  显示第 {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, data.total)} 条，共{" "}
                  {data.total} 条记录
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    上一页
                  </Button>

                  {/* Page numbers */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === currentPage ? "default" : "outline"}
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
