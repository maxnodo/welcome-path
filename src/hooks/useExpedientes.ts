import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Expediente, ExpedienteStatus } from '@/types/database.types'

let expedientesChannelCounter = 0

const PAGE_SIZE = 25

export interface ExpedienteFilters {
  search?: string
  status?: string
  gestorId?: string
}

export function useExpedientes(filters?: ExpedienteFilters) {
  const { user, isGestor, isAdmin } = useAuth()
  const [expedientes, setExpedientes] = useState<Expediente[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({})

  // Reset page when filters change
  const filterKey = `${filters?.search ?? ''}|${filters?.status ?? ''}|${filters?.gestorId ?? ''}`
  useEffect(() => {
    setPage(0)
  }, [filterKey])

  const fetchStatusCounts = useCallback(async () => {
    if (!user) return
    let query = supabase.from('expedientes').select('status')

    if (isAdmin) {
      // admin sees all
    } else if (isGestor) {
      query = query.eq('advisor_id', user.id)
    } else {
      query = query.eq('user_id', user.id)
    }

    // Apply gestor filter (but NOT status filter — counts are per-status)
    if (filters?.gestorId && filters.gestorId !== 'all') {
      if (filters.gestorId === 'none') {
        query = query.is('advisor_id', null)
      } else if (filters.gestorId === 'no_user') {
        query = query.is('user_id', null)
      } else {
        query = query.eq('advisor_id', filters.gestorId)
      }
    }

    const { data } = await query
    if (data) {
      const counts: Record<string, number> = {}
      data.forEach((row: any) => {
        counts[row.status] = (counts[row.status] || 0) + 1
      })
      setStatusCounts(counts)
    }
  }, [user?.id, isGestor, isAdmin, filters?.gestorId])

  async function fetchExpedientes() {
    if (!user) return
    setLoading(true)
    let query = supabase
      .from('expedientes')
      .select('*, tramites_catalog(*), documentos(*)', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (isAdmin) {
      // Admin sees all
    } else if (isGestor) {
      query = query.eq('advisor_id', user.id)
    } else {
      query = query.eq('user_id', user.id)
    }

    // Server-side filters
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }
    if (filters?.gestorId && filters.gestorId !== 'all') {
      if (filters.gestorId === 'none') {
        query = query.is('advisor_id', null)
      } else if (filters.gestorId === 'no_user') {
        query = query.is('user_id', null)
      } else {
        query = query.eq('advisor_id', filters.gestorId)
      }
    }
    if (filters?.search) {
      query = query.or(`expediente_number.ilike.%${filters.search}%,tramite_code.ilike.%${filters.search}%`)
    }

    // Pagination
    const from = page * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    query = query.range(from, to)

    const { data, count } = await query
    setExpedientes((data as Expediente[]) ?? [])
    setTotalCount(count ?? 0)
    setLoading(false)
  }

  useEffect(() => {
    fetchExpedientes()
  }, [user?.id, isGestor, isAdmin, page, filterKey])

  // Fetch status counts on mount and when gestor filter changes
  const gestorFilterKey = filters?.gestorId ?? 'all'
  useEffect(() => {
    fetchStatusCounts()
  }, [user?.id, isGestor, isAdmin, gestorFilterKey])

  useEffect(() => {
    if (!user) return
    const channelName = `expedientes-rt-${user.id}-${++expedientesChannelCounter}`
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'expedientes',
        ...(isAdmin ? {} : isGestor ? { filter: `advisor_id=eq.${user.id}` } : { filter: `user_id=eq.${user.id}` }),
      }, () => {
        fetchExpedientes()
        fetchStatusCounts()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user?.id, isGestor, isAdmin])

  async function createExpediente(userId: string, tramiteCode: string, originCountry?: string, solicitudType?: string) {
    if (!user) return null
    const { data, error } = await supabase
      .from('expedientes')
      .insert({
        user_id: userId,
        tramite_code: tramiteCode,
        status: 'no_iniciado',
        origin_country: originCountry ?? null,
        solicitud_type: solicitudType ?? null,
      })
      .select()
      .single()
    if (!error) {
      await fetchExpedientes()
      await fetchStatusCounts()
    }
    return { data, error }
  }

  async function updateExpediente(id: string, updates: Partial<Expediente>) {
    const { error } = await supabase.from('expedientes').update(updates).eq('id', id)
    if (!error) {
      await fetchExpedientes()
      await fetchStatusCounts()
    }
    return { error }
  }

  async function deleteExpediente(id: string) {
    const { data: docs } = await supabase.from('documentos').select('id, file_path').eq('expediente_id', id)
    if (docs && docs.length > 0) {
      const filePaths = docs.map(d => d.file_path).filter(Boolean)
      if (filePaths.length > 0) {
        await supabase.storage.from('documentos-tramite').remove(filePaths)
      }
      await supabase.from('documentos').delete().eq('expediente_id', id)
    }
    const { error } = await supabase.from('expedientes').delete().eq('id', id)
    if (!error) {
      await fetchExpedientes()
      await fetchStatusCounts()
    }
    return { error }
  }

  return {
    expedientes, loading, createExpediente, updateExpediente, deleteExpediente,
    refetch: fetchExpedientes,
    page, totalCount, statusCounts,
    pageSize: PAGE_SIZE,
    hasMore: (page + 1) * PAGE_SIZE < totalCount,
    nextPage: () => setPage(p => p + 1),
    prevPage: () => setPage(p => Math.max(0, p - 1)),
  }
}
