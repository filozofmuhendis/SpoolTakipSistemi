import { NextRequest, NextResponse } from 'next/server';
import { projectService } from '@/lib/services/projects';
import { z } from 'zod';
import { 
  createSuccessResponse, 
  handleApiError, 
  createValidationErrorResponse 
} from '@/lib/api-response';

const projectSchema = z.object({
  name: z.string().min(1, 'Proje adı zorunlu.'),
  status: z.enum(['pending', 'active', 'completed'], { required_error: 'Durum zorunlu.' }),
  startDate: z.string().min(1, 'Başlangıç tarihi zorunlu.'),
  endDate: z.string().min(1, 'Bitiş tarihi zorunlu.'),
  managerId: z.string().min(1, 'Yönetici zorunlu.'),
  description: z.string().optional()
});

export async function GET() {
  try {
    const projects = await projectService.getAllProjects();
    const response = createSuccessResponse(projects, 'Projeler başarıyla getirildi');
    return NextResponse.json(response);
  } catch (error) {
    const { response, status } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parse = projectSchema.safeParse(body);
    
    if (!parse.success) {
      const validationErrors: Record<string, string[]> = {};
      parse.error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!validationErrors[path]) {
          validationErrors[path] = [];
        }
        validationErrors[path].push(err.message);
      });
      const { response, status } = createValidationErrorResponse(validationErrors);
      return NextResponse.json(response, { status });
    }
    
    const project = await projectService.createProject({
      ...parse.data,
      description: parse.data.description || '' // Ensure description is never undefined
    });
    const response = createSuccessResponse(project, 'Proje başarıyla oluşturuldu');
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    const { response, status } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}
