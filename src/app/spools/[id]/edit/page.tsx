import EditSpoolPageClient from './EditSpoolPageClient'

export async function generateStaticParams() {
  return [
    { id: 's1-uuid-1' },
    { id: 's2-uuid-2' },
    { id: 's3-uuid-3' },
    { id: 's4-uuid-4' },
    { id: 's5-uuid-5' }
  ]
}

export default async function EditSpoolPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  return <EditSpoolPageClient params={resolvedParams} />
}