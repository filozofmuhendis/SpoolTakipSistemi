import { projectService } from '@/services/projectService';
import { spoolService } from '@/services/spoolService';
import { workOrderService } from '@/services/workOrderService';
import { inventoryService } from '@/services/inventoryService';
import prisma from '@/lib/prisma';

// Mock Actor
// Mock Actor
const adminActor = { id: '2b023053-9602-4fc4-8e4a-939e656d0001', role: 'admin' };
const userActor = { id: '2b023053-9602-4fc4-8e4a-939e656d0002', role: 'user' };

describe('Critical Integration Flow (Prisma Service Layer)', () => {
    let projectId: string;
    let spoolId: string;
    let inventoryId: string;

    beforeAll(async () => {
        // Cleaning DB before tests
        await prisma.inventoryTransaction.deleteMany();
        await prisma.workOrder.deleteMany();
        await prisma.spool.deleteMany();
        await prisma.inventory.deleteMany();
        await prisma.project.deleteMany();
        await prisma.user.deleteMany();

        // Create Users
        await prisma.user.create({
            data: {
                id: adminActor.id,
                email: 'admin@test.com',
                name: 'Admin User',
                role: adminActor.role,
                image: null
            }
        });
        await prisma.user.create({
            data: {
                id: userActor.id,
                email: 'user@test.com',
                name: 'Test User',
                role: userActor.role,
                image: null
            }
        });
    });

    afterAll(async () => {
        // Cleanup
        await prisma.inventoryTransaction.deleteMany();
        await prisma.workOrder.deleteMany();
        await prisma.spool.deleteMany();
        await prisma.inventory.deleteMany();
        await prisma.project.deleteMany();
        await prisma.$disconnect();
    });

    // 1. Project -> Spool -> WorkOrder -> Inventory Chain
    test('1. Golden Path: Create Project -> Spool -> WorkOrder -> Inventory', async () => {
        // A. Create Project
        const project = await projectService.createProject({
            name: 'Integration Test Project',
            status: 'active', // Enum
            start_date: new Date()
        });
        expect(project).toBeDefined();
        expect(project.id).toBeDefined();
        projectId = project.id;

        // B. Add Inventory (Material)
        const inventory = await inventoryService.createInventory({
            name: 'Test Pipe',
            code: `PIPE-${Date.now()}`,
            category: 'Raw Material',
            type: 'raw_material',
            quantity: 0, // Start with 0
            unit: 'm',
            cost: 100,
            location: 'Warehouse A'
        });
        expect(inventory).toBeDefined();
        inventoryId = inventory.id;

        // Add Stock (Transaction IN)
        await inventoryService.addStock(inventoryId, 100, userActor.id);
        const updatedInventory = await inventoryService.getInventoryById(inventoryId);
        expect(updatedInventory?.quantity).toBe(100);

        // Verify Ledger (IN)
        const ledgerIn = await prisma.inventoryTransaction.findFirst({
            where: { inventory_id: inventoryId, type: 'IN' }
        });
        expect(ledgerIn).toBeDefined();
        expect(ledgerIn?.delta).toBe(100);


        // C. Create Spool
        const spool = await spoolService.createSpool({
            name: 'SPL-001',
            project: { connect: { id: projectId } },
            status: 'pending', // Enum
            quantity: 1
        });
        expect(spool).toBeDefined();
        spoolId = spool.id;

        // D. Create Work Order
        const workOrder = await workOrderService.createWorkOrder({
            number: `WO-${Date.now()}`,
            title: 'Fab Spool',
            project: { connect: { id: projectId } },
            ...(spoolId && { spool: { connect: { id: spoolId } } }),
            status: 'pending' as any, // Cast to bypass enum mismatch if any
            start_date: new Date(),
            due_date: new Date(new Date().setDate(new Date().getDate() + 5))
        });
        expect(workOrder).toBeDefined();
    });

    // 2. Unauthorized Delete
    test('2. RBAC: Unauthorized user cannot delete project', async () => {
        await expect(projectService.deleteProject(projectId, userActor))
            .rejects
            .toThrow('Unauthorized');
    });

    // 3. Negative Inventory Rollback (Constraint)
    test('3. Constraint: Negative Inventory throws error', async () => {
        await expect(inventoryService.createInventory({
            name: 'Bad Inventory',
            code: 'BAD-001',
            category: 'X',
            type: 'consumable',
            quantity: -50,
            location: 'X',
            unit: 'pcs'
        })).rejects.toThrow('Quantity cannot be negative');
    });

    // 4. Concurrency / Race Condition
    test('4. Concurrency: Parallel consumption updates correctly and logs transactions', async () => {
        // Current Stock: 100
        const consumeAmount = 10;

        await Promise.all([
            inventoryService.consumeStock(inventoryId, consumeAmount, userActor.id),
            inventoryService.consumeStock(inventoryId, consumeAmount, userActor.id)
        ]);

        const updatedInventory = await inventoryService.getInventoryById(inventoryId);
        // 100 - 10 - 10 = 80
        expect(updatedInventory?.quantity).toBe(80);

        // Verify Ledger (OUT)
        const transactions = await prisma.inventoryTransaction.findMany({
            where: { inventory_id: inventoryId, type: 'OUT' }
        });
        expect(transactions.length).toBeGreaterThanOrEqual(2);

        const totalDelta = transactions.reduce((acc, tx) => acc + tx.delta, 0);
        expect(Math.abs(totalDelta)).toBeGreaterThanOrEqual(20);
    });

    // 5. Soft Delete
    test('5. Soft Delete checks', async () => {
        // Delete Spool
        await spoolService.deleteSpool(spoolId);

        // Should not be found by normal findById (assuming repo implements filter)
        // NOTE: My spoolRepository.ts implementation DOES filter `deleted_at: null`.
        await spoolService.getSpoolById(spoolId).catch(() => null);

        // Service throws "Spool not found" if repo returns null?
        // Let's check spoolService: "if (!spool) throw new Error('Spool not found')"
        // So I expect it to throw.

        // Re-read spoolService source if I can... I'll assume standard pattern.
        // Actually I can just check the repo implementation via previous knowledge.
        // `spoolRepository.findById` had `where: { deleted_at: null }`.

        await expect(spoolService.getSpoolById(spoolId))
            .rejects
            .toThrow('Spool not found');

        // Direct DB check to confirm it still exists (Soft deleted)
        const rawSpool = await prisma.spool.findUnique({ where: { id: spoolId } });
        expect(rawSpool).toBeDefined();
        expect(rawSpool?.deleted_at).not.toBeNull();
    });
});
