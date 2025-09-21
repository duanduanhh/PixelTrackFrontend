"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Eye, ArrowLeft, Copy, Check, Home, Server } from "lucide-react"
import { API_BASE_URL } from "@/lib/config"
import Link from "next/link"

interface CreatePixelResponse {
  code: number
  message: string
  data: {
    id: number
    name: string
    track_code: string
    status: boolean
    fields: any
    created_at: string
  }
}

export default function CreatePixelPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    email: "",
  })
  const [loading, setLoading] = useState(false)
  const [createdPixel, setCreatedPixel] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log("🔄 Creating pixel via backend API...")

      const response = await fetch(`${API_BASE_URL}/api/pixels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          email: formData.email,
        }),
      })

      console.log("📊 Response status:", response.status)

      if (response.ok) {
        const result: CreatePixelResponse = await response.json()
        console.log("✅ Create pixel response:", result)

        if (result.code === 0) {
          setCreatedPixel(result.data)
        } else {
          alert(result.message || "创建像素失败")
        }
      } else {
        const errorData = await response.json()
        alert(errorData.message || "创建像素失败")
      }
    } catch (error) {
      console.error("💥 Create pixel error:", error)
      alert("创建像素失败，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  const copyTrackingCode = () => {
    if (!createdPixel) return

    // Use HTTP for now, will be determined by backend requirements
    const trackingUrl = `${API_BASE_URL}/track/${createdPixel.track_code}`
    navigator.clipboard.writeText(trackingUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (createdPixel) {
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
                <Button variant="outline">返回像素管理</Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">像素创建成功！</CardTitle>
              <CardDescription>您的追踪像素已在后端创建完成，可以开始使用了。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  <Server className="mr-2 h-4 w-4 text-green-600" />
                  后端像素信息
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p>
                    <strong>ID:</strong> {createdPixel.id}
                  </p>
                  <p>
                    <strong>名称:</strong> {createdPixel.name}
                  </p>
                  <p>
                    <strong>追踪代码:</strong> {createdPixel.track_code}
                  </p>
                  <p>
                    <strong>状态:</strong> {createdPixel.status ? "启用" : "停用"}
                  </p>
                  <p>
                    <strong>创建时间:</strong> {new Date(createdPixel.created_at).toLocaleString()}
                  </p>
                  {createdPixel.email && (
                    <p>
                      <strong>通知邮箱:</strong> {createdPixel.email}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">追踪链接</h3>
                <p className="text-sm text-gray-600 mb-3">将以下链接用于追踪访客：</p>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm relative">
                  <code>{`${API_BASE_URL}/track/${createdPixel.track_code}`}</code>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2 bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                    onClick={copyTrackingCode}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex space-x-4">
                <Link href="/pixels" className="flex-1">
                  <Button className="w-full">查看所有像素</Button>
                </Link>
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => {
                    setCreatedPixel(null)
                    setFormData({ name: "", description: "", email: "" })
                  }}
                >
                  创建另一个
                </Button>
              </div>
            </CardContent>
          </Card>
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
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="mr-2 h-5 w-5 text-green-600" />
              创建追踪像素
            </CardTitle>
            <CardDescription>在后端创建一个新的追踪像素来收集访客数据和转化信息。</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">像素名称 *</Label>
                <Input
                  id="name"
                  placeholder="例如：首页追踪"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  placeholder="描述这个像素的用途..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">通知邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="例如：admin@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <p className="text-sm text-gray-500">可选：当有新的访问或转化时，将发送通知到此邮箱</p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "正在创建..." : "创建像素"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
