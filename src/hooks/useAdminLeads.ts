import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

let mountCounter = 0

const PAGE_SIZE = 25

export interface Lead {
  id: string
  nombre: string
  email: string | null
  telefono: string
  pais_origen: string | null
  necesidad: string | null
  ubicacion: string | null
  cuando: string | null
  descripcion: string | null
  advisor_id: string | null
  status: 'pending' | 'converted'
  created_at: string
}

export function useAdminLeads() {
  const { user, isGestor } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  async function fetchLeads() {
    if (!user || !isGestor) return
    setLoading(true)
    const from = page * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    const { data, count } = await supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)
    setLeads((data as Lead[]) ?? [])
    setTotalCount(count ?? 0)
    setLoading(false)
  }

  useEffect(() => {
    if (!user || !isGestor) return
    const channelName = `leads-rt-${user.id}-${++mountCounter}`

    fetchLeads()

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        fetchLeads()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user?.id, isGestor, page])

  async function updateLead(id: string, updates: Partial<Lead>) {
    const { error } = await supabase.from('leads').update(updates).eq('id', id)
    if (!error) await fetchLeads()
    return { error }
  }

  return {
    leads, loading, updateLead, refetch: fetchLeads,
    page, totalCount, pageSize: PAGE_SIZE,
    hasMore: (page + 1) * PAGE_SIZE < totalCount,
    nextPage: () => setPage(p => p + 1),
    prevPage: () => setPage(p => Math.max(0, p - 1)),
  }
}
