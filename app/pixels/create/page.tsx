"use client"

import { PIXELS_API } from "@/lib/config"
import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Eye, Plus, ArrowLeft, Copy, Check, Home } from "lucide-react"
import Link from "next/link"

interface CustomField {
  name: string
  type: string
  required: boolean
}

export default function CreatePixelPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [customFields, setCustomFields] = useState<CustomField[]>([])
  const [loading, setLoading] = useState(false)
  const [createdPixel, setCreatedPixel] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log('Sending request to backend API...');
      const response = await fetch(`${PIXELS_API}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name
        }),
      });
      console.log('Response status:', response.status);

      if (response.ok) {
        const pixel = await response.json()
        setCreatedPixel(pixel)
      } else {
        alert("创建像素失败")
      }
    } catch (error) {
      alert("创建像素失败，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  const addCustomField = () => {
    setCustomFields([...customFields, { name: "", type: "text", required: false }])
  }

  const updateCustomField = (index: number, field: Partial<CustomField>) => {
    const updated = [...customFields]
    updated[index] = { ...updated[index], ...field }
    setCustomFields(updated)
  }

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index))
  }

  const copyTrackingCode = () => {
    if (!createdPixel) return

    const trackingCode = `<img src="${window.location.origin}/track/${createdPixel.trackCode}" width="1" height="1" style="display:none;" />`
    navigator.clipboard.writeText(trackingCode)
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
              <CardDescription>您的追踪像素已经创建完成，可以开始使用了。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">像素信息</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p>
                    <strong>名称:</strong> {createdPixel.name}
                  </p>
                  <p>
                    <strong>描述:</strong> {createdPixel.description}
                  </p>
                  <p>
                    <strong>追踪代码:</strong> {createdPixel.trackCode}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">追踪代码</h3>
                <p className="text-sm text-gray-600 mb-3">将以下代码复制到您想要追踪的网页中：</p>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm relative">
                  <code>
                    {`<img src="${window.location.origin}/track/${createdPixel.trackCode}" width="1" height="1" style="display:none;" />`}
                  </code>
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
                    setFormData({ name: "", description: "" })
                    setCustomFields([])
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
            <CardTitle>创建追踪像素</CardTitle>
            <CardDescription>创建一个新的追踪像素来收集访客数据和转化信息。</CardDescription>
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

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>自定义收集字段</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addCustomField}>
                    <Plus className="mr-2 h-4 w-4" />
                    添加字段
                  </Button>
                </div>

                {customFields.map((field, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Input
                      placeholder="字段名称"
                      value={field.name}
                      onChange={(e) => updateCustomField(index, { name: e.target.value })}
                      className="flex-1"
                    />
                    <select
                      value={field.type}
                      onChange={(e) => updateCustomField(index, { type: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="text">文本</option>
                      <option value="email">邮箱</option>
                      <option value="tel">电话</option>
                      <option value="number">数字</option>
                    </select>
                    <label className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateCustomField(index, { required: e.target.checked })}
                      />
                      <span className="text-sm">必填</span>
                    </label>
                    <Button type="button" variant="outline" size="sm" onClick={() => removeCustomField(index)}>
                      删除
                    </Button>
                  </div>
                ))}

                {customFields.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    暂无自定义字段，点击"添加字段"来收集额外的用户信息
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "创建中..." : "创建像素"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
