import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const pixelId = params.id

    // In production, delete pixel from database
    console.log(`Deleting pixel ${pixelId}`)

    return NextResponse.json({
      message: "像素删除成功",
      pixelId,
    })
  } catch (error) {
    console.error("Delete pixel error:", error)
    return NextResponse.json({ message: "删除像素失败" }, { status: 500 })
  }
}
