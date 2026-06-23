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

export default function EditPersonnelPage({ params }: { params: { id: string } }) {
  return <EditPersonnelPageClient params={params} />
}