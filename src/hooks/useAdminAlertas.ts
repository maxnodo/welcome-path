import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Alerta } from '@/types/database.types'

let adminAlertasCounter = 0

const PAGE_SIZE = 25

export function useAdminAlertas() {
  const { user, isGestor, isAdmin } = useAuth()
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  async function fetchAlertas() {
    if (!user || !isGestor) return
    setLoading(true)

    let data: any[] | null = null
    let count: number | null = null

    if (isAdmin) {
      const res = await supabase
        .from('alertas')
        .select('*, expediente:expedientes(*), user:profiles!alertas_user_id_fkey(*)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
      data = res.data
      count = res.count
    } else {
      const res = await supabase
        .from('alertas')
        .select('*, expediente:expedientes!inner(*), user:profiles!alertas_user_id_fkey(*)', { count: 'exact' })
        .eq('expediente.advisor_id', user.id)
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
      data = res.data
      count = res.count
    }

    setAlertas((data as any[]) ?? [])
    setTotalCount(count ?? 0)
    setLoading(false)
  }

  useEffect(() => {
    if (!user || !isGestor) return

    fetchAlertas()

    const channelName = `admin-alertas-rt-${user.id}-${++adminAlertasCounter}`
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alertas' }, () => fetchAlertas())
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'alertas' }, () => fetchAlertas())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user?.id, isGestor, isAdmin, page])

  async function deleteAlerta(id: string) {
    const { error } = await supabase.from('alertas').delete().eq('id', id)
    if (!error) await fetchAlertas()
    return { error }
  }

  async function createAlerta(userId: string, title: string, type: Alerta['type'], description?: string, expedienteId?: string) {
    if (!user) return
    const { error } = await supabase.from('alertas').insert({
      user_id: userId,
      title,
      type,
      description: description ?? null,
      expediente_id: expedienteId ?? null,
      created_by: user.id,
    })
    if (!error) await fetchAlertas()
    return { error }
  }

  return {
    alertas, loading, deleteAlerta, createAlerta, refetch: fetchAlertas,
    page, totalCount, pageSize: PAGE_SIZE,
    hasMore: (page + 1) * PAGE_SIZE < totalCount,
    nextPage: () => setPage(p => p + 1),
    prevPage: () => setPage(p => Math.max(0, p - 1)),
  }
}
