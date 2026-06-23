import EditShipmentPageClient from './EditShipmentPageClient'

export async function generateStaticParams() {
  return [
    { id: 'sh-uuid-1' },
    { id: 'sh-uuid-2' }
  ]
}

export default function EditShipmentPage({ params }: { params: { id: string } }) {
  return <EditShipmentPageClient params={params} />
}