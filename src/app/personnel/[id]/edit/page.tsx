import EditPersonnelPageClient from './EditPersonnelPageClient'

export async function generateStaticParams() {
  return [
    { id: 'u1-uuid-admin' },
    { id: 'u2-uuid-manager' },
    { id: 'u3-uuid-qc' },
    { id: 'u4-uuid-welder' },
    { id: 'u5-uuid-fitter' }
  ]
}

export default async function EditPersonnelPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  return <EditPersonnelPageClient params={resolvedParams} />
}