import { type NextRequest, NextResponse } from "next/server"

// 简单的浏览器和操作系统检测
function detectBrowserAndOS(userAgent: string) {
  let browser = "Unknown"
  let os = "Unknown"
  
  // 浏览器检测
  if (userAgent.includes("Chrome")) browser = "Chrome"
  else if (userAgent.includes("Firefox")) browser = "Firefox"
  else if (userAgent.includes("Safari")) browser = "Safari"
  else if (userAgent.includes("Edge")) browser = "Edge"
  else if (userAgent.includes("Opera")) browser = "Opera"
  
  // 操作系统检测
  if (userAgent.includes("Windows")) os = "Windows"
  else if (userAgent.includes("Mac")) os = "macOS"
  else if (userAgent.includes("Linux")) os = "Linux"
  else if (userAgent.includes("Android")) os = "Android"
  else if (userAgent.includes("iOS")) os = "iOS"
  
  return { browser, os }
}

export async function GET(request: NextRequest, { params }: { params: { code: string } }) {
  try {
    const trackCode = params.code
    const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"
    const userAgent = request.headers.get("user-agent") || ""
    const referer = request.headers.get("referer") || ""
    
    // 检测浏览器和操作系统
    const { browser, os } = detectBrowserAndOS(userAgent)
    
    // 创建访问记录数据
    const visitData = {
      ip,
      user_agent: userAgent,
      referer,
      browser,
      os,
      // 注意：country和city需要通过IP地理位置服务获取，这里暂时留空
      country: "",
      city: "",
      timestamp: new Date().toISOString(),
    }

    // In production, save visit data to database
    console.log("Tracking visit:", {
      trackCode,
      ...visitData,
    })

    // 尝试保存到visit接口（异步，不阻塞像素返回）
    try {
      fetch(`${request.nextUrl.origin}/api/visit/${trackCode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(visitData),
      }).catch(err => console.log("Failed to save visit data:", err))
    } catch (err) {
      console.log("Error calling visit API:", err)
    }

    // Return 1x1 transparent PNG pixel
    const pixel = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      "base64",
    )

    return new NextResponse(pixel, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Length": pixel.length.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("Tracking error:", error)

    // Still return pixel even if tracking fails
    const pixel = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      "base64",
    )

    return new NextResponse(pixel, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Length": pixel.length.toString(),
      },
    })
  }
}

export async function POST(request: NextRequest, { params }: { params: { code: string } }) {
  try {
    const trackCode = params.code
    const formData = await request.json()
    const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"
    const userAgent = request.headers.get("user-agent") || ""
    const referer = request.headers.get("referer") || ""
    
    // 检测浏览器和操作系统
    const { browser, os } = detectBrowserAndOS(userAgent)
    
    // 创建完整的访问记录数据
    const visitData = {
      ip,
      user_agent: userAgent,
      referer,
      browser,
      os,
      // 表单数据
      email: formData.email || "",
      phone: formData.phone || "",
      name: formData.name || "",
      msg: formData.msg || "",
      // 注意：country和city需要通过IP地理位置服务获取，这里暂时留空
      country: "",
      city: "",
      timestamp: new Date().toISOString(),
    }

    // In production, save form data to database
    console.log("Form submission:", {
      trackCode,
      formData,
      ip,
      timestamp: new Date().toISOString(),
    })

    // 保存到visit接口
    try {
      const response = await fetch(`${request.nextUrl.origin}/api/visit/${trackCode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(visitData),
      })
      
      if (response.ok) {
        console.log("Visit data saved successfully")
      } else {
        console.log("Failed to save visit data:", response.status)
      }
    } catch (err) {
      console.log("Error calling visit API:", err)
    }

    return NextResponse.json({
      success: true,
      message: "数据提交成功",
    })
  } catch (error) {
    console.error("Form submission error:", error)
    return NextResponse.json({ success: false, message: "数据提交失败" }, { status: 500 })
  }
}
