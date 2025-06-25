import { NextRequest, NextResponse } from 'next/server';
import { projectService } from '@/lib/services/projects';
import { z } from 'zod';

const projectSchema = z.object({
  name: z.string().min(1, 'Proje adı zorunlu.'),
  status: z.enum(['pending', 'active', 'completed'], { required_error: 'Durum zorunlu.' }),
  startDate: z.string().min(1, 'Başlangıç tarihi zorunlu.'),
  endDate: z.string().min(1, 'Bitiş tarihi zorunlu.'),
  managerId: z.string().min(1, 'Yönetici zorunlu.'),
  description: z.string().optional()
});

export async function GET(req: NextRequest) {
  try {
    const projects = await projectService.getAllProjects();
    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parse = projectSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ success: false, error: parse.error.flatten().fieldErrors }, { status: 400 });
    }
    const project = await projectService.createProject(parse.data);
    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
} 
