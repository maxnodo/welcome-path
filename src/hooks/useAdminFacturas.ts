import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Factura } from '@/types/database.types'

const PAGE_SIZE = 25

export function useAdminFacturas() {
  const { user, isGestor } = useAuth()
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  async function fetchFacturas() {
    if (!user || !isGestor) return
    setLoading(true)
    const from = page * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    const { data, count } = await supabase
      .from('facturas')
      .select('*, user:profiles!facturas_user_id_fkey(*)', { count: 'exact' })
      .order('issued_at', { ascending: false })
      .range(from, to)
    setFacturas((data as any[]) ?? [])
    setTotalCount(count ?? 0)
    setLoading(false)
  }

  useEffect(() => {
    fetchFacturas()
  }, [user?.id, isGestor, page])

  async function updateFactura(id: string, updates: Partial<Factura>) {
    const { error } = await supabase.from('facturas').update(updates).eq('id', id)
    if (!error) await fetchFacturas()
    return { error }
  }

  return {
    facturas, loading, updateFactura, refetch: fetchFacturas,
    page, totalCount, pageSize: PAGE_SIZE,
    hasMore: (page + 1) * PAGE_SIZE < totalCount,
    nextPage: () => setPage(p => p + 1),
    prevPage: () => setPage(p => Math.max(0, p - 1)),
  }
}
