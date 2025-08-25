import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Mock dashboard stats - in production, fetch from database
    const stats = {
      totalPV: 1234567,
      totalUV: 89123,
      conversionRate: 3.45,
      activePixels: 156,
      recentVisits: [
        {
          id: "1",
          ip: "192.168.1.100",
          referer: "https://google.com",
          pixelName: "首页追踪",
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          ip: "10.0.0.50",
          referer: "https://facebook.com",
          pixelName: "产品页追踪",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "3",
          ip: "172.16.0.25",
          referer: "",
          pixelName: "注册转化",
          createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: "4",
          ip: "203.0.113.45",
          referer: "https://twitter.com",
          pixelName: "首页追踪",
          createdAt: new Date(Date.now() - 10800000).toISOString(),
        },
        {
          id: "5",
          ip: "198.51.100.78",
          referer: "https://linkedin.com",
          pixelName: "产品页追踪",
          createdAt: new Date(Date.now() - 14400000).toISOString(),
        },
      ],
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ message: "获取统计数据失败" }, { status: 500 })
  }
}
