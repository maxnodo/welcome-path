import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Cita } from '@/types/database.types'

let adminCitasCounter = 0

const PAGE_SIZE = 25

interface AdminCitasFilters {
  search?: string
  status?: string
}

export function useAdminCitas(filters?: AdminCitasFilters) {
  const { user, isGestor, isAdmin } = useAuth()
  const [citas, setCitas] = useState<Cita[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [todayCount, setTodayCount] = useState(0)
  const [upcomingCount, setUpcomingCount] = useState(0)
  const [totalCitas, setTotalCitas] = useState(0)

  // Reset page when filters change
  useEffect(() => {
    setPage(0)
  }, [filters?.search, filters?.status])

  async function fetchStats() {
    if (!user || !isGestor) return

    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()

    let todayQuery = supabase
      .from('citas')
      .select('id', { count: 'exact', head: true })
      .gte('scheduled_at', todayStart)
      .lt('scheduled_at', todayEnd)
      .neq('status', 'cancelada')

    let upcomingQuery = supabase
      .from('citas')
      .select('id', { count: 'exact', head: true })
      .gt('scheduled_at', new Date().toISOString())
      .neq('status', 'cancelada')

    let totalQuery = supabase
      .from('citas')
      .select('id', { count: 'exact', head: true })

    if (isGestor && !isAdmin) {
      todayQuery = todayQuery.eq('advisor_id', user.id)
      upcomingQuery = upcomingQuery.eq('advisor_id', user.id)
      totalQuery = totalQuery.eq('advisor_id', user.id)
    }

    const [todayRes, upcomingRes, totalRes] = await Promise.all([
      todayQuery, upcomingQuery, totalQuery
    ])

    setTodayCount(todayRes.count ?? 0)
    setUpcomingCount(upcomingRes.count ?? 0)
    setTotalCitas(totalRes.count ?? 0)
  }

  async function fetchCitas() {
    if (!user || !isGestor) return
    setLoading(true)

    let query = supabase
      .from('citas')
      .select('*, advisor:profiles!citas_advisor_id_fkey(*), user:profiles!citas_user_id_fkey(*)', { count: 'exact' })
      .order('scheduled_at', { ascending: true })

    if (isGestor && !isAdmin) {
      query = query.eq('advisor_id', user.id)
    }

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }

    // Search by client name requires filtering on the joined profile
    // Supabase doesn't support ilike on joined tables easily, so we use a workaround
    // We'll filter by user full_name using the foreign table filter
    if (filters?.search) {
      query = query.ilike('user.full_name', `%${filters.search}%`)
    }

    const from = page * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    query = query.range(from, to)

    const { data, count } = await query
    setCitas((data as any[]) ?? [])
    setTotalCount(count ?? 0)
    setLoading(false)
  }

  useEffect(() => {
    if (!user || !isGestor) return
    fetchStats()
  }, [user?.id, isGestor, isAdmin])

  useEffect(() => {
    if (!user || !isGestor) return

    fetchCitas()

    const channelName = `admin-citas-rt-${user.id}-${++adminCitasCounter}`
    const channelConfig: any = { event: '*', schema: 'public', table: 'citas' }
    if (isGestor && !isAdmin) {
      channelConfig.filter = `advisor_id=eq.${user.id}`
    }

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', channelConfig, () => {
        fetchCitas()
        fetchStats()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user?.id, isGestor, isAdmin, page, filters?.search, filters?.status])

  async function updateCita(id: string, updates: Partial<Cita>) {
    const { error } = await supabase.from('citas').update(updates).eq('id', id)
    if (!error) {
      await fetchCitas()
      await fetchStats()
    }
    return { error }
  }

  return {
    citas, loading, updateCita, refetch: fetchCitas,
    page, totalCount, pageSize: PAGE_SIZE,
    hasMore: (page + 1) * PAGE_SIZE < totalCount,
    nextPage: () => setPage(p => p + 1),
    prevPage: () => setPage(p => Math.max(0, p - 1)),
    todayCount, upcomingCount, totalCitas,
  }
}
