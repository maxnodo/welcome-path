import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Expediente } from '@/types/database.types'

let expedientesChannelCounter = 0

export function useExpedientes() {
  const { user, isGestor, isAdmin } = useAuth()
  const [expedientes, setExpedientes] = useState<Expediente[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchExpedientes() {
    if (!user) return
    setLoading(true)
    let query = supabase
      .from('expedientes')
      .select('*, tramites_catalog(*), documentos(*)')
      .order('created_at', { ascending: false })

    if (isAdmin) {
      // Admin sees all expedientes
    } else if (isGestor) {
      query = query.eq('advisor_id', user.id)
    } else {
      query = query.eq('user_id', user.id)
    }

    const { data } = await query
    let results = (data as Expediente[]) ?? []

    // Resolve advisor names separately (avoids RLS issues on profiles join)
    const advisorIds = [...new Set(results.map(e => e.advisor_id).filter(Boolean))] as string[]
    if (advisorIds.length > 0) {
      const { data: advisors } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', advisorIds)
      const advisorMap = new Map((advisors ?? []).map(a => [a.id, a]))
      results = results.map(e => ({
        ...e,
        advisor: e.advisor_id ? (advisorMap.get(e.advisor_id) as Partial<import('@/types/database.types').Profile> | undefined) ?? undefined : undefined,
      }))
    }

    setExpedientes(results)
    setLoading(false)
  }

  useEffect(() => {
    fetchExpedientes()

    if (!user) return
    const channelName = `expedientes-rt-${user.id}-${++expedientesChannelCounter}`
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'expedientes',
        ...(isAdmin ? {} : isGestor ? { filter: `advisor_id=eq.${user.id}` } : { filter: `user_id=eq.${user.id}` }),
      }, () => fetchExpedientes())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user?.id, isGestor, isAdmin])

  async function createExpediente(tramiteCode: string, originCountry?: string, solicitudType?: string) {
    if (!user) return null
    const { data, error } = await supabase
      .from('expedientes')
      .insert({
        user_id: user.id,
        tramite_code: tramiteCode,
        status: 'no_iniciado',
        origin_country: originCountry ?? null,
        solicitud_type: solicitudType ?? null,
      })
      .select()
      .single()
    if (!error) await fetchExpedientes()
    return { data, error }
  }

  async function updateExpediente(id: string, updates: Partial<Expediente>) {
    const { error } = await supabase.from('expedientes').update(updates).eq('id', id)
    if (!error) await fetchExpedientes()
    return { error }
  }

  async function deleteExpediente(id: string) {
    // First delete associated documents from storage and DB
    const { data: docs } = await supabase.from('documentos').select('id, file_path').eq('expediente_id', id)
    if (docs && docs.length > 0) {
      const filePaths = docs.map(d => d.file_path).filter(Boolean)
      if (filePaths.length > 0) {
        await supabase.storage.from('documentos-tramite').remove(filePaths)
      }
      await supabase.from('documentos').delete().eq('expediente_id', id)
    }
    // Delete the expediente
    const { error } = await supabase.from('expedientes').delete().eq('id', id)
    if (!error) await fetchExpedientes()
    return { error }
  }

  return { expedientes, loading, createExpediente, updateExpediente, deleteExpediente, refetch: fetchExpedientes }
}
