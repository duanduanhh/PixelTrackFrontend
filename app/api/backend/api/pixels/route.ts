import { type NextRequest, NextResponse } from "next/server"
import { API_BASE_URL } from "@/lib/config"

export async function GET(request: NextRequest) {
  try {
    console.log("🔄 Proxying request to backend:", `${API_BASE_URL}/api/pixels`)

    const response = await fetch(`${API_BASE_URL}/api/pixels`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "TrackPixel-Frontend/1.0",
      },
    })

    console.log("📊 Backend response status:", response.status)
    console.log("📋 Backend response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Backend error response:", errorText)

      // Special handling for HTTPS requirement
      if (errorText.includes("only https is supported")) {
        return NextResponse.json(
          {
            code: 1,
            message: "后端服务要求使用HTTPS连接，但HTTPS连接失败。请检查SSL证书配置或联系管理员。",
            data: null,
            debug: {
              backendMessage: errorText,
              suggestion: "后端服务配置为仅支持HTTPS，需要正确的SSL证书",
            },
          },
          { status: 503 },
        )
      }

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
    console.log("📄 Content-Type:", contentType)

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

    // Validate response structure
    if (typeof data !== "object" || data === null) {
      console.error("❌ Invalid response structure:", data)
      return NextResponse.json(
        {
          code: 1,
          message: "后端返回数据格式无效",
          data: null,
        },
        { status: 500 },
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("💥 Proxy error:", error)

    // More detailed error handling
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        {
          code: 1,
          message: `无法连接到后端服务 ${API_BASE_URL} - 请确认后端服务正在运行。`,
          data: null,
          debug: { baseUrl: API_BASE_URL, error: error.message },
        },
        { status: 503 },
      )
    }

    if (error instanceof SyntaxError && error.message.includes("JSON")) {
      return NextResponse.json(
        {
          code: 1,
          message: "后端返回的数据不是有效的JSON格式",
          data: null,
        },
        { status: 502 },
      )
    }

    return NextResponse.json(
      {
        code: 1,
        message: `代理请求失败: ${error instanceof Error ? error.message : "未知错误"}`,
        data: null,
        debug: {
          errorType: error?.constructor?.name,
          errorMessage: error instanceof Error ? error.message : "未知错误",
        },
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("🔄 Proxying POST request to backend:", `${API_BASE_URL}/api/pixels`)
    console.log("📤 Request body:", body)

    const response = await fetch(`${API_BASE_URL}/api/pixels`, {
      method: "POST",
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
      console.error("❌ Backend error response:", errorText)

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

    if (error instanceof SyntaxError && error.message.includes("JSON")) {
      return NextResponse.json(
        {
          code: 1,
          message: "后端返回的数据不是有效的JSON格式",
          data: null,
        },
        { status: 502 },
      )
    }

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
