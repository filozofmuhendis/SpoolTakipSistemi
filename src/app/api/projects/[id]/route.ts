import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { projectService } from '@/lib/services/projects'
import { z } from 'zod'

const projectUpdateSchema = z.object({
  name: z.string().min(1, 'Proje adı gereklidir').optional(),
  description: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  status: z.enum(['pending', 'active', 'completed', 'cancelled']).optional(),
  manager_id: z.string().optional()
})

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ success: false, error: 'Yetkisiz.' }, { status: 401 })
  }

  try {
    const { id } = await params
    const project = await projectService.getProjectById(id)
    
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Proje bulunamadı.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: project })
  } catch (error) {
    console.error('Proje detay hatası:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
    return NextResponse.json({ success: false, error: 'Yetkisiz.' }, { status: 403 })
  }

  try {
    const { id } = await params
    const body = await req.json()
    const parse = projectUpdateSchema.safeParse(body)
    
    if (!parse.success) {
      return NextResponse.json(
        { success: false, error: parse.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const updated = await projectService.updateProject(id, parse.data)
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Proje güncelleme hatası:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Yetkisiz.' }, { status: 403 })
  }

  try {
    const { id } = await params
    await projectService.deleteProject(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Proje silme hatası:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
} 