import { NextRequest, NextResponse } from 'next/server';
import { projectService } from '@/services/projectService';
import { z } from 'zod';
import { createSuccessResponse, handleApiError, createValidationErrorResponse } from '@/lib/api-response';
import { ProjectStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const projects = await projectService.getAllProjects(page, limit);
    const response = createSuccessResponse(projects, 'Projeler başarıyla getirildi');
    return NextResponse.json(response);
  } catch (error) {
    const { response, status } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}

// Zod schema matching Prisma.ProjectCreateInput requirements
const requestSchema = z.object({
  name: z.string().min(1, 'Proje adı zorunlu.'),
  status: z.nativeEnum(ProjectStatus, { required_error: 'Durum zorunlu.' }),
  startDate: z.string().min(1, 'Başlangıç tarihi zorunlu.'), // ISO String expected
  endDate: z.string().optional().nullable(),
  managerId: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  budget: z.number().optional()
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parse = requestSchema.safeParse(body);

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

    // Strict alignment with Prisma.ProjectCreateInput
    // Converting camelCase DTO to snake_case DB model
    const projectData = {
      name: parse.data.name,
      status: parse.data.status,
      start_date: parse.data.startDate,
      // Handle optional/nullable fields explicitly for strict mode
      end_date: parse.data.endDate ?? null,
      manager_id: parse.data.managerId ?? null,
      description: parse.data.description ?? null,
      budget: parse.data.budget ?? 0
    };

    const project = await projectService.createProject(projectData);
    const response = createSuccessResponse(project, 'Proje başarıyla oluşturuldu');
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    const { response, status } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}
