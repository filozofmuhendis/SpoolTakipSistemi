import InventoryDetailPageClient from './InventoryDetailPageClient'

export async function generateStaticParams() {
  return [
    { id: 'i-uuid-1' },
    { id: 'i-uuid-2' },
    { id: 'i-uuid-3' },
    { id: 'i-uuid-4' }
  ]
}

export default async function InventoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  return <InventoryDetailPageClient params={resolvedParams} />
}
