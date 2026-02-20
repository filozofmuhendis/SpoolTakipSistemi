import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const password = await bcrypt.hash('password123', 10)
    const adminPassword = await bcrypt.hash('admin123', 10)
    const managerPassword = await bcrypt.hash('manager123', 10)

    const adminId = '00000000-0000-0000-0000-000000000002'
    const managerId = '00000000-0000-0000-0000-000000000003'
    const userId = '00000000-0000-0000-0000-000000000004'

    // Users
    await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: { id: adminId, password: adminPassword, role: 'admin' },
        create: {
            id: adminId,
            email: 'admin@example.com',
            name: 'Admin User',
            password: adminPassword,
            role: 'admin',
        },
    })

    await prisma.user.upsert({
        where: { email: 'manager@example.com' },
        update: { id: managerId, password: managerPassword, role: 'manager' },
        create: {
            id: managerId,
            email: 'manager@example.com',
            name: 'Manager User',
            password: managerPassword,
            role: 'manager',
        },
    })

    await prisma.user.upsert({
        where: { email: 'testuser@example.com' },
        update: { id: userId, password: password, role: 'user' },
        create: {
            id: userId,
            email: 'testuser@example.com',
            name: 'Test User',
            password: password,
            role: 'user',
        },
    })

    // Project
    const projectId = '00000000-0000-0000-0000-000000000001'
    await prisma.project.upsert({
        where: { id: projectId },
        update: { status: 'active', manager_id: managerId },
        create: {
            id: projectId,
            name: 'Load Test Project',
            status: 'active',
            start_date: new Date(),
            manager_id: managerId,
        },
    })

    // Spools - Create if count is low
    const spoolCount = await prisma.spool.count({ where: { project_id: projectId } })
    if (spoolCount < 50) {
        await prisma.spool.createMany({
            data: Array.from({ length: 50 }).map((_, i) => ({
                name: `Spool-${i + 1}`,
                project_id: projectId,
                status: 'pending',
                quantity: 1,
            })),
        })
    }

    // Inventory
    const inventoryId = '00000000-0000-0000-0000-000000000005'
    await prisma.inventory.upsert({
        where: { id: inventoryId },
        update: { quantity: 1000 },
        create: {
            id: inventoryId,
            name: 'Steel Pipe',
            code: 'PIPE-001',
            category: 'Material',
            type: 'Pipe',
            quantity: 1000,
            unit: 'meters',
            cost: 50,
        },
    })

    console.log('Seed completed successfully')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
