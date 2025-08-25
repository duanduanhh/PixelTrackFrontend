import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateFrom =
      searchParams.get("dateFrom") || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    const dateTo = searchParams.get("dateTo") || new Date().toISOString().split("T")[0]
    const source = searchParams.get("source") || "all"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "20")

    // Mock analytics data - in production, this would query the database
    const mockTrendData = generateTrendData(dateFrom, dateTo)
    const mockSourceData = generateSourceData(source)
    const { visitorData, pagination } = generateVisitorDataWithPagination(dateFrom, dateTo, source, page, pageSize)

    const summary = {
      totalPV: mockTrendData.reduce((sum, day) => sum + day.pv, 0),
      totalUV: mockTrendData.reduce((sum, day) => sum + day.uv, 0),
      conversionRate:
        mockTrendData.length > 0
          ? (mockTrendData.reduce((sum, day) => sum + day.uv, 0) /
              mockTrendData.reduce((sum, day) => sum + day.pv, 0)) *
            100
          : 0,
      topSource: mockSourceData.length > 0 ? mockSourceData[0].name : "暂无数据",
    }

    const analyticsData = {
      trendData: mockTrendData,
      sourceData: mockSourceData,
      visitorData,
      pagination,
      summary,
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({ message: "获取分析数据失败" }, { status: 500 })
  }
}

function generateTrendData(dateFrom: string, dateTo: string) {
  const start = new Date(dateFrom)
  const end = new Date(dateTo)
  const data = []

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const baseDate = new Date(d)
    const dayOfWeek = baseDate.getDay()

    // Simulate higher traffic on weekdays
    const weekdayMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 0.7 : 1.2

    const pv = Math.floor((Math.random() * 500 + 200) * weekdayMultiplier)
    const uv = Math.floor(pv * (0.6 + Math.random() * 0.3)) // UV is 60-90% of PV

    data.push({
      date: baseDate.toISOString().split("T")[0],
      pv,
      uv,
    })
  }

  return data
}

function generateSourceData(sourceFilter: string) {
  const allSources = [
    { name: "Google", value: 1250, percentage: 35.2 },
    { name: "Facebook", value: 890, percentage: 25.1 },
    { name: "直接访问", value: 650, percentage: 18.3 },
    { name: "Twitter", value: 420, percentage: 11.8 },
    { name: "LinkedIn", value: 280, percentage: 7.9 },
    { name: "其他", value: 60, percentage: 1.7 },
  ]

  if (sourceFilter === "all") {
    return allSources
  }

  // Filter by specific source
  const filtered = allSources.filter((source) => {
    if (sourceFilter === "direct") return source.name === "直接访问"
    return source.name.toLowerCase().includes(sourceFilter.toLowerCase())
  })

  return filtered.length > 0 ? filtered : [{ name: "无数据", value: 0, percentage: 0 }]
}

function generateVisitorDataWithPagination(
  dateFrom: string,
  dateTo: string,
  sourceFilter: string,
  page: number,
  pageSize: number,
) {
  const sources = [
    "https://google.com/search",
    "https://facebook.com/ref",
    "https://twitter.com/share",
    "https://linkedin.com/feed",
    "", // direct access
  ]

  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0",
  ]

  const pixelNames = ["首页追踪", "产品页追踪", "注册转化", "购买转化", "联系我们"]

  const start = new Date(dateFrom)
  const end = new Date(dateTo)
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

  // Generate all visitors first
  const allVisitors = []
  const totalVisitors = Math.floor(Math.random() * 40 * daysDiff + 10 * daysDiff)

  for (let i = 0; i < totalVisitors; i++) {
    const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
    const referer = sources[Math.floor(Math.random() * sources.length)]

    // Apply source filter
    if (sourceFilter !== "all") {
      if (sourceFilter === "direct" && referer !== "") continue
      if (sourceFilter !== "direct" && !referer.includes(sourceFilter)) continue
    }

    allVisitors.push({
      id: `visitor_${i}`,
      ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
      referer,
      pixelName: pixelNames[Math.floor(Math.random() * pixelNames.length)],
      createdAt: randomDate.toISOString(),
    })
  }

  // Sort by date descending
  allVisitors.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  // Calculate pagination
  const totalRecords = allVisitors.length
  const totalPages = Math.ceil(totalRecords / pageSize)
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const visitorData = allVisitors.slice(startIndex, endIndex)

  const pagination = {
    currentPage: page,
    totalPages,
    totalRecords,
    pageSize,
  }

  return { visitorData, pagination }
}
