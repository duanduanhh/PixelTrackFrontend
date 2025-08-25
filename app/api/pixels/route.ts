import { type NextRequest, NextResponse } from "next/server"

// Global pixels storage - in production, this would be in a database
const globalPixels = [
  {
    id: 1,
    name: "测试",
    track_code: "GOw3zsYG8I",
    status: true,
    fields: null,
    created_at: "2025-08-12T17:24:51+08:00",
  },
  {
    id: 2,
    name: "test",
    track_code: "GOw6650TFG",
    status: true,
    fields: null,
    created_at: "2025-08-12T17:26:17+08:00",
  },
  {
    id: 3,
    name: "页面测试",
    track_code: "GOytWco1sU",
    status: true,
    fields: null,
    created_at: "2025-08-12T18:49:42+08:00",
  },
]

export async function GET() {
  try {
    return NextResponse.json({
      code: 0,
      message: "ok",
      data: globalPixels,
    })
  } catch (error) {
    console.error("Get pixels error:", error)
    return NextResponse.json(
      {
        code: 1,
        message: "获取像素列表失败",
        data: null,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json()

    // Generate unique tracking code
    const trackCode = generateTrackCode()

    const newPixel = {
      id: globalPixels.length + 1,
      name,
      track_code: trackCode,
      status: true,
      fields: null,
      created_at: new Date().toISOString(),
    }

    // Add to global storage
    globalPixels.push(newPixel)

    return NextResponse.json({
      code: 0,
      message: "ok",
      data: newPixel,
    })
  } catch (error) {
    console.error("Create pixel error:", error)
    return NextResponse.json(
      {
        code: 1,
        message: "创建像素失败",
        data: null,
      },
      { status: 500 },
    )
  }
}

function generateTrackCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
