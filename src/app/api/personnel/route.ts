import { NextRequest, NextResponse } from 'next/server'
import { personnelService } from '@/services/personnelService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, full_name, phone, department, position } = body

    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: 'Email, password and full_name are required' },
        { status: 400 }
      )
    }

    const data = await personnelService.createPersonnel({
      email, password, full_name, phone, department, position
    })

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error creating personnel:', error)
    return NextResponse.json(
      { error: (error as Error).message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    await personnelService.deletePersonnel(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting personnel:', error)
    return NextResponse.json(
      { error: (error as Error).message || 'Internal server error' },
      { status: 500 }
    )
  }
}