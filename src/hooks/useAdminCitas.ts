import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Cita } from '@/types/database.types'

let adminCitasCounter = 0

const PAGE_SIZE = 25

export function useAdminCitas() {
  const { user, isGestor, isAdmin } = useAuth()
  const [citas, setCitas] = useState<Cita[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

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

    fetchCitas()

    const channelName = `admin-citas-rt-${user.id}-${++adminCitasCounter}`
    const channelConfig: any = { event: '*', schema: 'public', table: 'citas' }
    if (isGestor && !isAdmin) {
      channelConfig.filter = `advisor_id=eq.${user.id}`
    }

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', channelConfig, () => fetchCitas())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user?.id, isGestor, isAdmin, page])

  async function updateCita(id: string, updates: Partial<Cita>) {
    const { error } = await supabase.from('citas').update(updates).eq('id', id)
    if (!error) await fetchCitas()
    return { error }
  }

  return {
    citas, loading, updateCita, refetch: fetchCitas,
    page, totalCount, pageSize: PAGE_SIZE,
    hasMore: (page + 1) * PAGE_SIZE < totalCount,
    nextPage: () => setPage(p => p + 1),
    prevPage: () => setPage(p => Math.max(0, p - 1)),
  }
}
