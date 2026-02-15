import { NextRequest, NextResponse } from 'next/server';
import { projectService } from '@/services/projectService';
import { z } from 'zod';
import {
  createSuccessResponse,
  handleApiError,
  createValidationErrorResponse
} from '@/lib/api-response';



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

    // Map camalCase to snake_case if necessary, or just rely on Zod to validate what's sent.
    // The frontend likely sends snake_case keys if it uses the Supabase types directly, 
    // BUT the previous schema used camelCase (startDate, managerId).
    // The new Repository expects snake_case (start_date, manager_id) to match DB.
    // So we need to map here or update Zod schema to expect camelCase and transform?
    // Let's update schema to expect camelCase (as per previous implementation) and transform to snake_case for service.

    // Actually, looking at the previous file (Step 233), it used `startDate`, `endDate`, `managerId`.
    // But `projectService.createProject` in previous file just spread `parse.data`.
    // Wait, `projectService.createProject` in old file was:
    // `const { data, error } = await supabase.from('projects').insert(project)...`
    // Supabase expects `start_date`, `end_date`, `manager_id`.
    // So the previous code might have been broken if it sent `startDate` to Supabase?
    // Let's check `src/lib/services/projects.ts` again (Step 222).
    // It takes `ProjectInsert`. `ProjectInsert` is `TablesInsert<'projects'>` which uses `start_date`.
    // So the previous API route implementation (Step 233) was likely sending wrong keys if it validated `startDate` and then spread it into `createProject`.
    // `const project = await projectService.createProject({ ...parse.data, description: ... })`
    // If user sent `startDate`, it would be passed as `startDate` to `insert`. Supabase would ignore it or error depending on strictness?
    // If it was working, maybe there was some transformation I missed? Or it wasn't working.
    // To be safe and correct now: I will update the Schema to accept what frontend sends (likely camelCase if that's the convention so far) 
    // OR just use snake_case if I want to enforce DB structure.
    // Given the previous schema used camelCase, I should stick to accepting camelCase but transform it for the Service/Repo.

    // HOWEVER, I want to be "Strict". Standard practice: API accepts JSON (often camelCase), backend converts to snake_case for DB.
    // Let's define schema with transformations.

    const requestSchema = z.object({
      name: z.string().min(1, 'Proje adı zorunlu.'),
      status: z.enum(['pending', 'active', 'completed'], { required_error: 'Durum zorunlu.' }),
      startDate: z.string().min(1, 'Başlangıç tarihi zorunlu.'),
      endDate: z.string().min(1, 'Bitiş tarihi zorunlu.'),
      managerId: z.string().min(1, 'Yönetici zorunlu.'),
      description: z.string().optional()
    });

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

    // Transform to snake_case for Service layer (which expects snake_case DB types)
    const projectData = {
      name: parse.data.name,
      status: parse.data.status,
      start_date: parse.data.startDate, // Map
      end_date: parse.data.endDate,     // Map
      manager_id: parse.data.managerId, // Map
      description: parse.data.description || ''
    };

    const project = await projectService.createProject(projectData);
    const response = createSuccessResponse(project, 'Proje başarıyla oluşturuldu');
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    const { response, status } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}
