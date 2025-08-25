import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status } = await request.json()
    const pixelId = params.id

    // In production, update pixel status in database
    console.log(`Updating pixel ${pixelId} status to ${status}`)

    return NextResponse.json({
      message: "状态更新成功",
      pixelId,
      status,
    })
  } catch (error) {
    console.error("Update pixel status error:", error)
    return NextResponse.json({ message: "更新状态失败" }, { status: 500 })
  }
}
