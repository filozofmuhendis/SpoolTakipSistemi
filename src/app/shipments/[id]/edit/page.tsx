import EditShipmentPageClient from './EditShipmentPageClient'

export async function generateStaticParams() {
  return [
    { id: 'sh-uuid-1' },
    { id: 'sh-uuid-2' }
  ]
}

export default async function EditShipmentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  return <EditShipmentPageClient params={resolvedParams} />
}