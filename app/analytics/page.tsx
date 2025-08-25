"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Eye, Home, MousePointer, Download, Filter, TrendingUp, PieChartIcon as PieIcon } from "lucide-react"
import Link from "next/link"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Pie, Cell } from "recharts"

interface AnalyticsData {
  trendData: Array<{
    date: string
    pv: number
    uv: number
  }>
  sourceData: Array<{
    name: string
    value: number
    percentage: number
  }>
  visitorData: Array<{
    id: string
    ip: string
    userAgent: string
    referer: string
    pixelName: string
    createdAt: string
  }>
  pagination: {
    currentPage: number
    totalPages: number
    totalRecords: number
    pageSize: number
  }
  summary: {
    totalPV: number
    totalUV: number
    conversionRate: number
    topSource: string
  }
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({
    trendData: [],
    sourceData: [],
    visitorData: [],
    pagination: { currentPage: 1, totalPages: 1, totalRecords: 0, pageSize: 20 },
    summary: { totalPV: 0, totalUV: 0, conversionRate: 0, topSource: "" },
  })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days ago
    dateTo: new Date().toISOString().split("T")[0], // today
    source: "all",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  useEffect(() => {
    fetchAnalyticsData()
  }, [filters, currentPage, pageSize])

  const fetchAnalyticsData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        source: filters.source,
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
      })

      const response = await fetch(`/api/analytics?${params}`)
      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
      }
    } catch (error) {
      console.error("Failed to fetch analytics data:", error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    const headers = ["IP地址", "用户代理", "来源", "像素名称", "访问时间"]
    const csvContent = [
      headers.join(","),
      ...data.visitorData.map((visitor) =>
        [
          visitor.ip,
          `"${visitor.userAgent.replace(/"/g, '""')}"`,
          visitor.referer || "直接访问",
          visitor.pixelName,
          new Date(visitor.createdAt).toLocaleString(),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `访客数据_${filters.dateFrom}_${filters.dateTo}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(Number.parseInt(newPageSize))
    setCurrentPage(1) // Reset to first page when changing page size
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载分析数据中...</p>
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
              <Button variant="outline">控制台</Button>
            </Link>
            <Link href="/pixels">
              <Button variant="outline">
                <MousePointer className="mr-2 h-4 w-4" />
                像素管理
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">数据分析</h1>
          <p className="text-gray-600">深入分析访客数据，了解流量趋势和来源分布</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              筛选条件
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateFrom">开始日期</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateTo">结束日期</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>来源筛选</Label>
                <Select value={filters.source} onValueChange={(value) => handleFilterChange("source", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择来源" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有来源</SelectItem>
                    <SelectItem value="google.com">Google</SelectItem>
                    <SelectItem value="facebook.com">Facebook</SelectItem>
                    <SelectItem value="twitter.com">Twitter</SelectItem>
                    <SelectItem value="linkedin.com">LinkedIn</SelectItem>
                    <SelectItem value="direct">直接访问</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={exportToCSV} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  导出CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">总页面浏览量</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.totalPV.toLocaleString()}</div>
              <p className="text-xs text-green-600">筛选期间</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">独立访客</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.totalUV.toLocaleString()}</div>
              <p className="text-xs text-green-600">筛选期间</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">转化率</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.conversionRate.toFixed(2)}%</div>
              <p className="text-xs text-blue-600">UV/PV比率</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">主要来源</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate">{data.summary.topSource}</div>
              <p className="text-xs text-purple-600">最大流量来源</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                PV/UV 趋势图
              </CardTitle>
              <CardDescription>页面浏览量和独立访客趋势</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value, name) => [value, name === "pv" ? "PV" : "UV"]}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="pv" stroke="#8884d8" strokeWidth={2} name="PV" />
                    <Line type="monotone" dataKey="uv" stroke="#82ca9d" strokeWidth={2} name="UV" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Source Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieIcon className="mr-2 h-5 w-5" />
                来源占比
              </CardTitle>
              <CardDescription>不同来源的访客分布</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <Pie
                    data={data.sourceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visitor Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>访客详细数据</CardTitle>
            <CardDescription className="flex items-center justify-between">
              <span>
                共 {data.pagination.totalRecords} 条记录，第 {data.pagination.currentPage} /{" "}
                {data.pagination.totalPages} 页
              </span>
              <div className="flex items-center space-x-4">
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
                <Button variant="outline" size="sm" className="bg-transparent" onClick={exportToCSV}>
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
                    <TableHead>IP地址</TableHead>
                    <TableHead>用户代理</TableHead>
                    <TableHead>来源</TableHead>
                    <TableHead>像素名称</TableHead>
                    <TableHead>访问时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.visitorData.length > 0 ? (
                    data.visitorData.map((visitor) => (
                      <TableRow key={visitor.id}>
                        <TableCell className="font-mono">{visitor.ip}</TableCell>
                        <TableCell className="max-w-xs truncate" title={visitor.userAgent}>
                          {visitor.userAgent}
                        </TableCell>
                        <TableCell>
                          {visitor.referer ? (
                            <Badge variant="outline">{new URL(visitor.referer).hostname}</Badge>
                          ) : (
                            <Badge variant="secondary">直接访问</Badge>
                          )}
                        </TableCell>
                        <TableCell>{visitor.pixelName}</TableCell>
                        <TableCell>{new Date(visitor.createdAt).toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="text-gray-500">
                          {filters.source !== "all" ||
                          filters.dateFrom !==
                            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
                            ? "没有找到符合筛选条件的数据"
                            : "暂无访客数据"}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  显示第 {(data.pagination.currentPage - 1) * data.pagination.pageSize + 1} -{" "}
                  {Math.min(data.pagination.currentPage * data.pagination.pageSize, data.pagination.totalRecords)}{" "}
                  条，共 {data.pagination.totalRecords} 条记录
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(data.pagination.currentPage - 1)}
                    disabled={data.pagination.currentPage <= 1}
                  >
                    上一页
                  </Button>

                  {/* Page numbers */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
                      let pageNum
                      if (data.pagination.totalPages <= 5) {
                        pageNum = i + 1
                      } else if (data.pagination.currentPage <= 3) {
                        pageNum = i + 1
                      } else if (data.pagination.currentPage >= data.pagination.totalPages - 2) {
                        pageNum = data.pagination.totalPages - 4 + i
                      } else {
                        pageNum = data.pagination.currentPage - 2 + i
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === data.pagination.currentPage ? "default" : "outline"}
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
                    onClick={() => handlePageChange(data.pagination.currentPage + 1)}
                    disabled={data.pagination.currentPage >= data.pagination.totalPages}
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
