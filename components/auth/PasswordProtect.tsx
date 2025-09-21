"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock } from "lucide-react"

export default function PasswordProtect() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === process.env.NEXT_PUBLIC_HOME_PASSWORD) {
      sessionStorage.setItem("isAuthenticated", "true")
      // 强制刷新页面以确保所有组件都能获取到认证状态
      window.location.href = "/"
    } else {
      setError("密码错误，请重试")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <Lock className="h-12 w-12 text-blue-600 mb-4" />
          <h2 className="text-2xl font-bold text-center">请输入访问密码</h2>
          <p className="text-gray-500 text-center mt-2">
            请输入正确的密码以访问网站
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="输入密码"
            className="mb-4"
          />
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <Button type="submit" className="w-full">
            确认
          </Button>
        </form>
      </div>
    </div>
  )
}