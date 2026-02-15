import { supabaseAdmin } from '@/lib/supabase';

// Helper to generate unique names
const generateId = () => Math.random().toString(36).substring(7);

describe('Critical Integration Flow (E2E)', () => {
    // We need a dedicated test project to isolate our data
    let projectId: string;
    let managerId: string;
    let spoolId: string;
    let inventoryId: string;

    beforeAll(async () => {
        // Ensure we have admin access
        if (!supabaseAdmin) {
            throw new Error('supabaseAdmin is null. Check environment variables and test setup.');
        }

        // 1. Get or Create a Manager User
        const { data: profiles, error: profileError } = await supabaseAdmin.from('profiles').select('id').limit(1);

        if (profileError || !profiles || !profiles[0]) {
            console.error('Profile Fetch Error:', JSON.stringify(profileError, null, 2));
            throw new Error('No profiles found in DB. Integration tests require at least one user.');
        }

        managerId = profiles[0].id;
    });

    afterAll(async () => {
        // Cleanup: Delete the Project. Cascade should handle Spools, WorkOrders, Inventory(if linked)
        if (projectId && supabaseAdmin) {
            await supabaseAdmin.from('projects').delete().eq('id', projectId);
            // Also delete inventory if it wasn't cascaded (Inventory has FK set to project_id?)
            // Schema says: project_id UUID REFERENCES public.projects(id)
            // But does it cascade? Schema doesn't specify ON DELETE CASCADE for Inventory!
            // Let's check schema/migrations. 
            // Migration 001/002 didn't change FK.
            // Original schema: project_id UUID REFERENCES public.projects(id) [No Cascade mentioned explicitly, default is NO ACTION]
            // So we might need to delete inventory manually if cascade isn't set.
            // Wait, `WorkOrders` has ON DELETE CASCADE. `Spools` has ON DELETE CASCADE.
            // `Inventory` references projects(id) but NO CASCADE in the SQL I saw (Step 361).
            // So we should delete inventory manually.
            if (inventoryId) {
                await supabaseAdmin.from('inventory').delete().eq('id', inventoryId);
            }
        }
    });

    test('1. Create Project (Golden Path)', async () => {
        const { data, error } = await supabaseAdmin!
            .from('projects')
            .insert({
                name: `Integration Test Project ${generateId()}`,
                start_date: new Date().toISOString(),
                manager_id: managerId, // Optional in DB? schema says REFERENCES public.profiles(id), nullable? No "NOT NULL".
                status: 'active',
                budget: 10000
            })
            .select()
            .single();

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data?.id).toBeDefined();
        projectId = data!.id;
    });

    test('2. Add Inventory (Constraint Check)', async () => {
        // Happy Path
        const { data, error } = await supabaseAdmin!
            .from('inventory')
            .insert({
                name: `Steel Pipe ${generateId()}`,
                code: `MAT-${generateId()}`,
                category: 'Pipes',
                type: 'raw_material',
                quantity: 100,
                unit: 'm',
                cost: 50,
                location: 'Warehouse A',
                supplier: 'Test Supplier',
                project_id: projectId
            })
            .select()
            .single();

        expect(error).toBeNull();
        inventoryId = data!.id;

        // Fail Path: Negative Quantity
        const { error: errorNeg } = await supabaseAdmin!
            .from('inventory')
            .insert({
                name: 'Bad Inventory',
                code: `BAD-${generateId()}`,
                category: 'Pipes',
                type: 'raw_material',
                quantity: -5, // Should fail
                unit: 'm',
                cost: 10,
                location: 'X',
                supplier: 'X'
            });

        expect(errorNeg).toBeDefined();
        expect(errorNeg?.message).toMatch(/check_inventory_quantity_positive/); // Expect constraint name
    });

    test('3. Create Spool linked to Project', async () => {
        const { data, error } = await supabaseAdmin!
            .from('spools')
            .insert({
                name: `SPL-${generateId()}`,
                project_id: projectId,
                status: 'pending',
                quantity: 10
            })
            .select()
            .single();

        expect(error).toBeNull();
        spoolId = data!.id;
    });

    test('4. Create Work Order (Date Validation)', async () => {
        // Happy Path
        const { data, error } = await supabaseAdmin!
            .from('work_orders')
            .insert({
                number: `WO-${generateId()}`,
                title: 'Fabricate Spool',
                project_id: projectId,
                spool_id: spoolId,
                assigned_to: managerId,
                status: 'pending',
                start_date: '2026-03-01',
                due_date: '2026-03-05'
            })
            .select()
            .single();

        expect(error).toBeNull();
        expect(data).toBeDefined();

        // Fail Path: Due Date before Start Date
        const { error: errorDate } = await supabaseAdmin!
            .from('work_orders')
            .insert({
                number: `WO-BAD-${generateId()}`,
                title: 'Bad Dates',
                project_id: projectId,
                assigned_to: managerId,
                start_date: '2026-03-10',
                due_date: '2026-03-01' // Invalid
            });

        expect(errorDate).toBeDefined();
        expect(errorDate?.message).toMatch(/check_work_orders_dates_valid/);
    });

    test('5. Audit Log verification', async () => {
        // Check if the previous creation was logged
        const { data } = await supabaseAdmin!
            .from('audit_logs')
            .select('*')
            .eq('table_name', 'work_orders')
            .eq('operation', 'INSERT')
            .order('changed_at', { ascending: false })
            .limit(1);

        expect(data).toBeDefined();
        expect(data!.length).toBeGreaterThan(0);
        // Note: changed_by might be null if using supabaseAdmin without service_role impersonating a user, 
        // or it uses the service_role's "fake" user if auth.uid() is simulated. 
        // In strict service_role mode, auth.uid() might be null or specialized. 
        // Our trigger 'set_tracking_columns' sets created_by := auth.uid(). 
        // If auth.uid() is null, created_by is null.
        // That's acceptable for system actions, but good to verify the log exists.
    });
});
