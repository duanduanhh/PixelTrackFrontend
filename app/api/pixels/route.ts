import { type NextRequest, NextResponse } from "next/server"

// Global pixels storage - in production, this would be in a database
const globalPixels = [
  {
    id: "1",
    name: "首页追踪",
    description: "网站首页访问追踪",
    trackCode: "px_homepage_001",
    status: 1,
    pv: 15420,
    uv: 8932,
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    name: "产品页追踪",
    description: "产品详情页访问追踪",
    trackCode: "px_product_002",
    status: 1,
    pv: 8765,
    uv: 4321,
    createdAt: "2024-01-20T14:15:00Z",
  },
  {
    id: "3",
    name: "注册转化",
    description: "用户注册转化追踪",
    trackCode: "px_signup_003",
    status: 0,
    pv: 2341,
    uv: 1876,
    createdAt: "2024-01-25T09:45:00Z",
  },
]

export async function GET() {
  try {
    return NextResponse.json({
      code: 0,
      message: "ok",
      data: globalPixels.map(pixel => ({
        id: pixel.id,
        name: pixel.name,
        track_code: pixel.trackCode,
        status: pixel.status === 1,
        fields: pixel.fields || null,
        created_at: pixel.createdAt
      }))
    })
  } catch (error) {
    console.error("Get pixels error:", error)
    return NextResponse.json({ 
      code: 500,
      message: "获取像素列表失败"
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, fields } = await request.json()

    // Generate unique tracking code
    const trackCode = `px_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const newPixel = {
      id: Date.now().toString(),
      name,
      description,
      trackCode,
      status: 1,
      fields: fields || [],
      pv: 0,
      uv: 0,
      createdAt: new Date().toISOString(),
    }

    // Add to global storage
    globalPixels.push(newPixel)

    return NextResponse.json(newPixel)
  } catch (error) {
    console.error("Create pixel error:", error)
    return NextResponse.json({ message: "创建像素失败" }, { status: 500 })
  }
}
