import ShipmentDetailPageClient from './ShipmentDetailPageClient'

export async function generateStaticParams() {
  return [
    { id: 'sh-uuid-1' },
    { id: 'sh-uuid-2' }
  ]
}

export default function ShipmentDetailPage({ params }: { params: { id: string } }) {
  return <ShipmentDetailPageClient params={params} />
}