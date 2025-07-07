import { NextRequest, NextResponse } from 'next/server';
import { projectService } from '@/lib/services/projects';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const projectSchema = z.object({
  name: z.string().min(1, 'Proje adı zorunlu.'),
  status: z.enum(['active', 'completed', 'pending'], { required_error: 'Durum zorunlu.' }),
  startDate: z.string().min(1, 'Başlangıç tarihi zorunlu.'),
  endDate: z.string().min(1, 'Bitiş tarihi zorunlu.'),
  managerId: z.string().min(1, 'Yönetici zorunlu.'),
  description: z.string().optional()
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const project = await projectService.getProjectById(id);
    if (!project) {
      return NextResponse.json({ success: false, error: 'Proje bulunamadı.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Yetkisiz.' }, { status: 403 });
  }
  try {
    const { id } = params;
    const body = await req.json();
    const parse = projectSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ success: false, error: parse.error.flatten().fieldErrors }, { status: 400 });
    }
    const updated = await projectService.updateProject(id, parse.data);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Yetkisiz.' }, { status: 403 });
  }
  try {
    const { id } = params;
    await projectService.deleteProject(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
} 