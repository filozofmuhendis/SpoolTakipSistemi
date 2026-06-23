import EditInventoryPageClient from './EditInventoryPageClient'

export async function generateStaticParams() {
  return [
    { id: 'i-uuid-1' },
    { id: 'i-uuid-2' },
    { id: 'i-uuid-3' },
    { id: 'i-uuid-4' }
  ]
}

export default function EditInventoryPage({ params }: { params: { id: string } }) {
  return <EditInventoryPageClient params={params} />
}
