import ProjectDetailClient from './ProjectDetailClient'

export async function generateStaticParams() {
  return [
    { id: 'p1-uuid-1111-2222' },
    { id: 'p2-uuid-3333-4444' },
    { id: 'p3-uuid-5555-6666' },
    { id: 'p4-uuid-7777-8888' }
  ]
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  return <ProjectDetailClient params={resolvedParams} />
}