import SpoolDetailPageClient from './SpoolDetailPageClient'

export async function generateStaticParams() {
  return [
    { id: 's1-uuid-1' },
    { id: 's2-uuid-2' },
    { id: 's3-uuid-3' },
    { id: 's4-uuid-4' },
    { id: 's5-uuid-5' }
  ]
}

export default function SpoolDetailPage({ params }: { params: { id: string } }) {
  return <SpoolDetailPageClient params={params} />
}