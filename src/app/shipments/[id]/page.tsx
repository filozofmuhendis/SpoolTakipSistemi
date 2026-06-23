import ShipmentDetailPageClient from './ShipmentDetailPageClient'

export async function generateStaticParams() {
  return [
    { id: 'sh-uuid-1' },
    { id: 'sh-uuid-2' }
  ]
}

export default async function ShipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  return <ShipmentDetailPageClient params={resolvedParams} />
}