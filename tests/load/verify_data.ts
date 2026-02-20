import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const userCount = await prisma.user.count()
    const projectCount = await prisma.project.count()
    const spoolCount = await prisma.spool.count()
    const inventoryCount = await prisma.inventory.count()
    const workOrderCount = await prisma.workOrder.count()
    const transactionCount = await prisma.inventoryTransaction.count()

    console.log('--- Verification Results ---')
    console.log(`Users: ${userCount}`)
    console.log(`Projects: ${projectCount}`)
    console.log(`Spools: ${spoolCount}`)
    console.log(`Inventory Items: ${inventoryCount}`)
    console.log(`WorkOrders: ${workOrderCount}`)
    console.log(`Inventory Transactions: ${transactionCount}`)

    if (transactionCount > 0) {
        const latestTransactions = await prisma.inventoryTransaction.findMany({
            take: 5,
            orderBy: { created_at: 'desc' },
            include: {
                inventory: {
                    select: {
                        name: true,
                        unit: true
                    }
                }
            }
        })
        console.log('\nLatest Transactions:')
        latestTransactions.forEach((t: any) => {
            console.log(`- ${t.type} ${t.quantity} ${t.inventory?.unit || ''} for ${t.inventory?.name || 'Unknown'}`)
        })
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
