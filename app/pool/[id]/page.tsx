import { getPoolById } from '@/lib/actions/pool'
import { notFound } from 'next/navigation'
import PoolDetailClient from './PoolDetailClient'

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PoolDetailPage({ params }: PageProps) {
  const { id } = await params;
  const pool = await getPoolById(id)

  if (!pool) {
    notFound()
  }

  return <PoolDetailClient pool={pool} />
}
