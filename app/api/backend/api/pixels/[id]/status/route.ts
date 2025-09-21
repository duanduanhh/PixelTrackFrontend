import { type NextRequest, NextResponse } from "next/server"
import { API_BASE_URL } from "@/lib/config"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const pixelId = params.id
    const url = `${API_BASE_URL}/api/pixels/${pixelId}/status`

    console.log("🔄 Proxying PUT request to backend:", url)

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "TrackPixel-Frontend/1.0",
      },
      body: JSON.stringify(body),
    })

    console.log("📊 Backend response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Backend error:", errorText)
      return NextResponse.json(
        {
          code: 1,
          message: `后端服务错误: ${response.status} ${response.statusText} - ${errorText}`,
          data: null,
        },
        { status: response.status },
      )
    }

    // Check if response is JSON
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      const textResponse = await response.text()
      console.error("❌ Non-JSON response:", textResponse)
      return NextResponse.json(
        {
          code: 1,
          message: `后端返回非JSON格式数据: ${textResponse.substring(0, 100)}...`,
          data: null,
        },
        { status: 500 },
      )
    }

    const data = await response.json()
    console.log("✅ Backend response data:", data)

    return NextResponse.json(data)
  } catch (error) {
    console.error("💥 Proxy error:", error)
    return NextResponse.json(
      {
        code: 1,
        message: `代理请求失败: ${error instanceof Error ? error.message : "未知错误"}`,
        data: null,
      },
      { status: 500 },
    )
  }
}
