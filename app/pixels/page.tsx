"use client"

import { useEffect, useState } from "react"
import { API_BASE_URL, TRACK_URL } from "@/lib/config"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Eye,
  Plus,
  Search,
  MoreHorizontal,
  Copy,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Home,
  BarChart3,
  RefreshCw,
  CheckCircle,
  Server,
  AlertTriangle,
  Shield,
  Lock,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Pixel {
  id: number
  name: string
  track_code: string
  status: boolean | number
  fields: any
  created_at: string
  email?: string
}

interface ApiResponse {
  code: number
  message: string
  data: Pixel[]
  debug?: any
}

export default function PixelsPage() {
  const [pixels, setPixels] = useState<Pixel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isHttpsRequired, setIsHttpsRequired] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingPixel, setEditingPixel] = useState<Pixel | null>(null)
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
  })
  const [editLoading, setEditLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchPixels()
  }, [])

  // Auto refresh every 30 seconds if enabled
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchPixels(true) // Silent refresh
      }, 30000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  const fetchPixels = async (silent = false) => {
    if (!silent) {
      setLoading(true)
      setError(null)
      setDebugInfo(null)
    }
    setIsHttpsRequired(false)

    try {
      console.log("🔄 Fetching pixels from backend API...")

      const response = await fetch("/api/backend/api/pixels", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        cache: "no-store", // Always fetch fresh data
      })

      console.log("📊 Response status:", response.status)

      const responseText = await response.text()
      console.log("📄 Raw response:", responseText.substring(0, 200) + "...")

      // Try to parse as JSON
      let result: ApiResponse
      try {
        result = JSON.parse(responseText)
      } catch (parseError) {
        console.error("❌ JSON parse error:", parseError)
        if (!silent) {
          setError(`响应不是有效的JSON格式: ${responseText.substring(0, 100)}...`)
          setDebugInfo({
            responseStatus: response.status,
            responseText: responseText.substring(0, 500),
            parseError: parseError instanceof Error ? parseError.message : "Unknown parse error",
          })
        }
        return
      }

      console.log("✅ Parsed response:", result)

      if (response.ok) {
        if (result.code === 0 && Array.isArray(result.data)) {
          setPixels(result.data)
          setLastUpdated(new Date())
          if (!silent) {
            setError(null)
            setDebugInfo(null)
          }
        } else {
          if (!silent) {
            setError(result.message || "获取像素列表失败")

            // Check if it's an HTTPS requirement issue
            if (
              result.message?.includes("HTTPS") ||
              result.debug?.backendMessage?.includes("only https is supported")
            ) {
              setIsHttpsRequired(true)
            }

            setDebugInfo({
              responseStatus: response.status,
              apiCode: result.code,
              apiMessage: result.message,
              dataType: typeof result.data,
              isArray: Array.isArray(result.data),
              debug: result.debug,
            })
          }
        }
      } else {
        if (!silent) {
          setError(result.message || `HTTP ${response.status}: ${response.statusText}`)

          // Check if it's an HTTPS requirement issue
          if (result.message?.includes("HTTPS") || result.debug?.backendMessage?.includes("only https is supported")) {
            setIsHttpsRequired(true)
          }

          setDebugInfo({
            responseStatus: response.status,
            apiCode: result.code,
            apiMessage: result.message,
            debug: result.debug,
          })
        }
      }
    } catch (error) {
      console.error("💥 Fetch Error:", error)
      if (!silent) {
        setError(`请求失败: ${error instanceof Error ? error.message : "未知错误"}`)
        setDebugInfo({
          error: error instanceof Error ? error.message : "未知错误",
          errorType: error?.constructor?.name || "Unknown",
          stack: error instanceof Error ? error.stack : null,
        })
      }
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }

  const testBackendDirectly = async () => {
    try {
      console.log("🧪 Testing HTTPS backend directly...")
      const response = await fetch(`${API_BASE_URL.replace(/^http:/, 'https:')}/api/pixels`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors",
      })
      console.log("🧪 HTTPS Direct test result:", response.status, response.statusText)
      const text = await response.text()
      console.log("🧪 HTTPS Direct response:", text.substring(0, 200))
    } catch (error) {
      console.log("🧪 HTTPS Direct test failed:", error)

      // Try HTTP
      try {
        console.log("🧪 Testing HTTP backend directly...")
        const response = await fetch(`${API_BASE_URL.replace(/^https:/, 'http:')}/api/pixels`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          mode: "cors",
        })
        console.log("🧪 HTTP Direct test result:", response.status, response.statusText)
        const text = await response.text()
        console.log("🧪 HTTP Direct response:", text.substring(0, 200))
      } catch (httpError) {
        console.log("🧪 HTTP Direct test also failed:", httpError)
      }
    }
  }

  const togglePixelStatus = async (pixelId: number, currentStatus: boolean) => {
    try {
      const newStatus = currentStatus ? 0 : 1 // 0 = 停用, 1 = 启用
      console.log(`🔄 Toggling pixel ${pixelId} status from ${currentStatus ? '启用' : '停用'} to ${newStatus ? '启用' : '停用'}`)
      
      const response = await fetch(`/api/backend/api/pixels/${pixelId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      console.log("📊 Status update response status:", response.status)

      if (response.ok) {
        const result = await response.json()
        console.log("✅ Status updated:", result)
        
        if (result.code === 0) {
          // Refresh the list to get updated data
          fetchPixels()
        } else {
          alert(result.message || "更新状态失败")
        }
      } else {
        const errorData = await response.json()
        console.error("❌ Status update failed:", errorData)
        alert(errorData.message || "更新状态失败")
      }
    } catch (error) {
      console.error("Failed to toggle pixel status:", error)
      alert("更新状态失败，请稍后重试")
    }
  }

  const deletePixel = async (pixelId: number) => {
    if (!confirm("确定要删除这个像素吗？此操作不可恢复。")) {
      return
    }

    try {
      console.log(`🗑️ Deleting pixel ${pixelId}`)
      const response = await fetch(`/api/backend/api/pixels/${pixelId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        const result = await response.json()
        console.log("✅ Pixel deleted:", result)
        // Refresh the list to get updated data
        fetchPixels()
      } else {
        const errorData = await response.json()
        alert(errorData.message || "删除像素失败")
      }
    } catch (error) {
      console.error("Failed to delete pixel:", error)
      alert("删除像素失败，请稍后重试")
    }
  }

  const copyTrackingCode = async (pixel: Pixel) => {
    try {
      const trackingUrl = `${TRACK_URL}/${pixel.track_code}`
      if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(trackingUrl)
        alert('追踪链接已复制到剪贴板')
        return
      }

      const textarea = document.createElement('textarea')
      textarea.value = trackingUrl
      textarea.setAttribute('readonly', '')
      textarea.style.position = 'absolute'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      const selection = document.getSelection()
      const selectedRange = selection?.rangeCount ? selection.getRangeAt(0) : null
      textarea.select()
      try {
        const ok = document.execCommand('copy')
        if (ok) {
          alert('追踪链接已复制到剪贴板')
          return
        }
      } finally {
        if (selectedRange) {
          selection?.removeAllRanges()
          selection?.addRange(selectedRange)
        }
        document.body.removeChild(textarea)
      }

      const pre = document.createElement('pre')
      pre.textContent = trackingUrl
      pre.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;padding:16px;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,.15);z-index:9999;'
      document.body.appendChild(pre)
      const range = document.createRange()
      range.selectNode(pre)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
      alert('无法自动复制，已为你选中文本，请使用 Ctrl/Cmd + C 复制')
      setTimeout(() => document.body.removeChild(pre), 8000)
    } catch (err) {
      console.error('复制失败:', err)
      alert('复制失败，请手动复制链接')
    }
  }

  const viewAnalytics = (trackCode: string) => {
    router.push(`/analytics/${trackCode}`)
  }

  const openEditDialog = (pixel: Pixel) => {
    setEditingPixel(pixel)
    setEditFormData({
      name: pixel.name,
      email: pixel.email || "",
    })
    setEditDialogOpen(true)
  }

  const closeEditDialog = () => {
    setEditDialogOpen(false)
    setEditingPixel(null)
    setEditFormData({
      name: "",
      email: "",
    })
    setEditLoading(false)
  }

  const handleEditSubmit = async () => {
    if (!editingPixel) return

    setEditLoading(true)
    try {
      console.log(`🔄 Updating pixel ${editingPixel.id}...`)
      
      const response = await fetch(`/api/backend/api/pixels/${editingPixel.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editFormData.name,
          email: editFormData.email || null,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log("✅ Pixel updated:", result)
        
        // Refresh the list to get updated data
        fetchPixels()
        closeEditDialog()
      } else {
        const errorData = await response.json()
        alert(errorData.message || "更新像素失败")
      }
    } catch (error) {
      console.error("Failed to update pixel:", error)
      alert("更新像素失败，请稍后重试")
    } finally {
      setEditLoading(false)
    }
  }

  const filteredPixels = pixels.filter((pixel) => pixel.name.toLowerCase().includes(searchTerm.toLowerCase()))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在从后端实时获取像素列表...</p>
          <p className="text-sm text-gray-500 mt-2">通过API路由连接后端服务</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-4xl">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-600 mb-4">
            {isHttpsRequired ? "后端要求HTTPS连接" : "后端API连接失败"}
          </h2>

          <div className="text-red-600 mb-6 p-4 bg-red-50 rounded-lg">
            <p className="font-medium">{error}</p>
          </div>

          {/* Debug Information */}
          {debugInfo && (
            <div className="bg-gray-100 p-4 rounded-lg mb-6 text-left">
              <h3 className="font-bold mb-2">🔍 调试信息:</h3>
              <div className="text-sm space-y-1">
                {debugInfo.responseStatus && (
                  <p>
                    <strong>响应状态:</strong> {debugInfo.responseStatus}
                  </p>
                )}
                {debugInfo.apiCode !== undefined && (
                  <p>
                    <strong>API代码:</strong> {debugInfo.apiCode}
                  </p>
                )}
                {debugInfo.apiMessage && (
                  <p>
                    <strong>API消息:</strong> {debugInfo.apiMessage}
                  </p>
                )}
                {debugInfo.debug && (
                  <div>
                    <strong>后端调试信息:</strong>
                    <pre className="text-xs bg-gray-200 p-2 rounded mt-1 overflow-x-auto max-h-32">
                      {JSON.stringify(debugInfo.debug, null, 2)}
                    </pre>
                  </div>
                )}
                {debugInfo.responseText && (
                  <div>
                    <strong>原始响应:</strong>
                    <pre className="text-xs bg-gray-200 p-2 rounded mt-1 overflow-x-auto max-h-32">
                      {debugInfo.responseText}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left">
            <h3 className="font-bold text-blue-800 mb-2 flex items-center">
              {isHttpsRequired ? (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  🛠️ HTTPS连接问题排查:
                </>
              ) : (
                "🛠️ 后端连接问题排查:"
              )}
            </h3>
            <div className="text-sm text-blue-700 space-y-2">
              {isHttpsRequired ? (
                <>
                  <p>
                    <strong>1. SSL证书:</strong> 确认后端配置了有效的SSL证书
                  </p>
                  <p>
                    <strong>2. 信任证书:</strong> 在浏览器中访问 https://trackback.darrel.cn 并信任证书
                  </p>
                  <p>
                    <strong>3. 开发环境:</strong> 考虑配置后端允许HTTP连接
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>1. 后端服务:</strong> 确认后端服务正在 trackback.darrel.cn 运行
                  </p>
                  <p>
                    <strong>2. API端点:</strong> 确认 /api/pixels 端点正常工作
                  </p>
                  <p>
                    <strong>3. 响应格式:</strong> 确认返回正确的JSON格式
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <Button onClick={() => fetchPixels()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              重新连接后端
            </Button>
            <Button variant="outline" onClick={testBackendDirectly}>
              <AlertTriangle className="mr-2 h-4 w-4" />
              直接测试后端
            </Button>
          </div>
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
            <Button variant="outline" onClick={() => fetchPixels()}>
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
          <p className="text-gray-600">实时管理您的追踪像素，查看统计数据和复制追踪代码</p>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">实时后端数据</span>
            </div>
            <div className="flex items-center space-x-2">
              {isHttpsRequired ? (
                <>
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-blue-600">HTTPS连接</span>
                </>
              ) : (
                <>
                  <Server className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">HTTP连接</span>
                </>
              )}
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

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索像素名称..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="text-sm text-gray-500">
                共 {pixels.length} 个像素，显示 {filteredPixels.length} 个
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pixels Table */}
        <Card>
          <CardHeader>
            <CardTitle>像素列表</CardTitle>
            <CardDescription>
              实时显示后端数据 - 共 {filteredPixels.length} 个像素
              {lastUpdated && (
                <span className="ml-2 text-xs text-gray-400">(更新于 {lastUpdated.toLocaleString()})</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>名称</TableHead>
                  <TableHead>追踪代码</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>通知邮箱</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right w-32">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPixels.length > 0 ? (
                  filteredPixels.map((pixel) => (
                    <TableRow key={pixel.id}>
                      <TableCell className="font-mono">{pixel.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{pixel.name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{pixel.track_code}</TableCell>
                      <TableCell>
                        <Badge variant={pixel.status ? "default" : "secondary"}>
                          {pixel.status ? "启用" : "停用"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {pixel.email ? (
                          <span className="text-sm text-blue-600">{pixel.email}</span>
                        ) : (
                          <span className="text-sm text-gray-400">未设置</span>
                        )}
                      </TableCell>
                      <TableCell>{new Date(pixel.created_at).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewAnalytics(pixel.track_code)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
                          >
                            <BarChart3 className="mr-1 h-3 w-3" />
                            实时数据
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => copyTrackingCode(pixel)}>
                                <Copy className="mr-2 h-4 w-4" />
                                复制追踪代码
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => togglePixelStatus(pixel.id, !!pixel.status)}>
                                {pixel.status ? (
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
                              <DropdownMenuItem onClick={() => openEditDialog(pixel)}>
                                <Edit className="mr-2 h-4 w-4" />
                                编辑
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => deletePixel(pixel.id)} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-gray-500 mb-4">{searchTerm ? "没有找到匹配的像素" : "后端暂无像素数据"}</div>
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

        {/* Edit Pixel Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>编辑像素</DialogTitle>
              <DialogDescription>
                修改像素的名称和通知邮箱设置
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-name" className="text-right">
                  名称
                </label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="col-span-3"
                  placeholder="像素名称"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-email" className="text-right">
                  通知邮箱
                </label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="col-span-3"
                  placeholder="admin@example.com"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeEditDialog}>
                取消
              </Button>
              <Button onClick={handleEditSubmit} disabled={editLoading || !editFormData.name.trim()}>
                {editLoading ? "保存中..." : "保存更改"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
