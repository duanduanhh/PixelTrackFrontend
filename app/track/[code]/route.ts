import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { code: string } }) {
  try {
    const trackCode = params.code
    const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"
    const userAgent = request.headers.get("user-agent") || ""
    const referer = request.headers.get("referer") || ""

    // In production, save visit data to database
    console.log("Tracking visit:", {
      trackCode,
      ip,
      userAgent,
      referer,
      timestamp: new Date().toISOString(),
    })

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

    // In production, save form data to database
    console.log("Form submission:", {
      trackCode,
      formData,
      ip,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: "数据提交成功",
    })
  } catch (error) {
    console.error("Form submission error:", error)
    return NextResponse.json({ success: false, message: "数据提交失败" }, { status: 500 })
  }
}
