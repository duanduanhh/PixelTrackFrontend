import { type NextRequest, NextResponse } from "next/server"

// 真实的访问数据存储 - 生产环境中这应该是数据库
// 这里只保留您提供的真实示例数据，并添加新字段
const realVisits = [
  {
    id: 1,
    pixel_id: 1,
    ip: "127.0.0.1",
    country: "中国",
    city: "北京",
    browser: "Chrome",
    os: "Windows",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    referer: "https://example.com",
    email: "duanduan0820@126.com",
    phone: "15039021712",
    name: "duanzhiwei",
    msg: "测试数据",
    created_at: "2025-08-12T17:24:51+08:00",
  },
]

// 像素ID和track_code的映射关系
const pixelMapping = [
  { id: 1, track_code: "GOw3zsYG8I" },
  { id: 2, track_code: "GOw6650TFG" },
  { id: 3, track_code: "GOytWco1sU" },
]

export async function GET(request: NextRequest, { params }: { params: { trackCode: string } }) {
  try {
    const trackCode = params.trackCode
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "20")

    // 根据track_code查找对应的pixel_id
    const pixel = pixelMapping.find((p) => p.track_code === trackCode)
    if (!pixel) {
      return NextResponse.json(
        {
          code: 1,
          message: "像素不存在",
          data: null,
        },
        { status: 404 },
      )
    }

    // 只返回属于该像素的访问数据
    const pixelVisits = realVisits.filter((visit) => visit.pixel_id === pixel.id)

    // 应用分页
    const total = pixelVisits.length
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const visits = pixelVisits.slice(startIndex, endIndex)

    return NextResponse.json({
      code: 0,
      message: "ok",
      data: {
        visits,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error("Get visits error:", error)
    return NextResponse.json(
      {
        code: 1,
        message: "获取访问数据失败",
        data: null,
      },
      { status: 500 },
    )
  }
}

// 添加新的访问记录的接口（供追踪像素调用）
export async function POST(request: NextRequest, { params }: { params: { trackCode: string } }) {
  try {
    const trackCode = params.trackCode
    const visitData = await request.json()

    // 根据track_code查找对应的pixel_id
    const pixel = pixelMapping.find((p) => p.track_code === trackCode)
    if (!pixel) {
      return NextResponse.json(
        {
          code: 1,
          message: "像素不存在",
          data: null,
        },
        { status: 404 },
      )
    }

    // 创建新的访问记录，包含所有新字段
    const newVisit = {
      id: realVisits.length + 1,
      pixel_id: pixel.id,
      ip: visitData.ip || "unknown",
      country: visitData.country || "",
      city: visitData.city || "",
      browser: visitData.browser || "",
      os: visitData.os || "",
      user_agent: visitData.user_agent || "",
      referer: visitData.referer || "",
      email: visitData.email || "",
      phone: visitData.phone || "",
      name: visitData.name || "",
      msg: visitData.msg || "",
      created_at: new Date().toISOString(),
    }

    // 添加到访问记录中
    realVisits.push(newVisit)

    return NextResponse.json({
      code: 0,
      message: "访问记录已保存",
      data: newVisit,
    })
  } catch (error) {
    console.error("Save visit error:", error)
    return NextResponse.json(
      {
        code: 1,
        message: "保存访问记录失败",
        data: null,
      },
      { status: 500 },
    )
  }
}
