import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { inventoryService } from '@/services/inventoryService'
import { z } from 'zod'

const consumeSchema = z.object({
    inventoryId: z.string().uuid('Geçersiz envanter ID'),
    amount: z.number().positive('Miktar pozitif olmalıdır')
})

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ success: false, error: 'Yetkisiz.' }, { status: 401 })
    }

    try {
        const body = await req.json()
        const parse = consumeSchema.safeParse(body)

        if (!parse.success) {
            return NextResponse.json(
                { success: false, error: parse.error.flatten().fieldErrors },
                { status: 400 }
            )
        }

        const { inventoryId, amount } = parse.data
        const updatedItem = await inventoryService.consumeStock(inventoryId, amount, session.user.id)

        return NextResponse.json({
            success: true,
            data: updatedItem,
            message: 'Stok başarıyla tüketildi ve ledger kaydı oluşturuldu.'
        })
    } catch (error) {
        console.error('Stok tüketme hatası:', error)
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        )
    }
}
