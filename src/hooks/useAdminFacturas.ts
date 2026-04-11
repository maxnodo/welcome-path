import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Factura } from '@/types/database.types'

const PAGE_SIZE = 25

interface AdminFacturasFilters {
  search?: string
  status?: string
}

interface FacturaStats {
  totalRevenue: number
  pendingAmount: number
  failedCount: number
}

export function useAdminFacturas(filters?: AdminFacturasFilters) {
  const { user, isGestor } = useAuth()
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [stats, setStats] = useState<FacturaStats>({ totalRevenue: 0, pendingAmount: 0, failedCount: 0 })

  // Reset page when filters change
  useEffect(() => {
    setPage(0)
  }, [filters?.search, filters?.status])

  async function fetchStats() {
    if (!user || !isGestor) return

    // Global stats - no filters, no pagination
    const { data: allFacturas } = await supabase
      .from('facturas')
      .select('status, total_amount')

    if (allFacturas) {
      const totalRevenue = allFacturas.filter(f => f.status === 'pagada').reduce((sum, f) => sum + f.total_amount, 0)
      const pendingAmount = allFacturas.filter(f => f.status === 'pendiente').reduce((sum, f) => sum + f.total_amount, 0)
      const failedCount = allFacturas.filter(f => f.status === 'fallida').length
      setStats({ totalRevenue, pendingAmount, failedCount })
    }
  }

  async function fetchFacturas() {
    if (!user || !isGestor) return
    setLoading(true)

    let query = supabase
      .from('facturas')
      .select('*, user:profiles!facturas_user_id_fkey(*)', { count: 'exact' })
      .order('issued_at', { ascending: false })

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }

    if (filters?.search) {
      // Search by invoice number or client name
      query = query.or(`invoice_number.ilike.%${filters.search}%,user.full_name.ilike.%${filters.search}%`)
    }

    const from = page * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    query = query.range(from, to)

    const { data, count } = await query
    setFacturas((data as any[]) ?? [])
    setTotalCount(count ?? 0)
    setLoading(false)
  }

  useEffect(() => {
    fetchStats()
  }, [user?.id, isGestor])

  useEffect(() => {
    fetchFacturas()
  }, [user?.id, isGestor, page, filters?.search, filters?.status])

  async function updateFactura(id: string, updates: Partial<Factura>) {
    const { error } = await supabase.from('facturas').update(updates).eq('id', id)
    if (!error) {
      await fetchFacturas()
      await fetchStats()
    }
    return { error }
  }

  return {
    facturas, loading, updateFactura, refetch: fetchFacturas,
    page, totalCount, pageSize: PAGE_SIZE,
    hasMore: (page + 1) * PAGE_SIZE < totalCount,
    nextPage: () => setPage(p => p + 1),
    prevPage: () => setPage(p => Math.max(0, p - 1)),
    stats,
  }
}
