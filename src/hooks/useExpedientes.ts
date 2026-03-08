import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Expediente } from '@/types/database.types'

export function useExpedientes() {
  const { user, isGestor } = useAuth()
  const [expedientes, setExpedientes] = useState<Expediente[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchExpedientes() {
    if (!user) return
    setLoading(true)
    let query = supabase
      .from('expedientes')
      .select('*, tramites_catalog(*), documentos(*)')
      .order('created_at', { ascending: false })

    if (!isGestor) {
      query = query.eq('user_id', user.id)
    }

    const { data } = await query
    setExpedientes((data as Expediente[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchExpedientes()

    if (!user) return
    const channel = supabase
      .channel('expedientes-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'expedientes',
        ...(isGestor ? {} : { filter: `user_id=eq.${user.id}` }),
      }, () => fetchExpedientes())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user?.id, isGestor])

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

  return { expedientes, loading, createExpediente, updateExpediente, refetch: fetchExpedientes }
}
