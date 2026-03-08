import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Alerta } from '@/types/database.types'

export function useAdminAlertas() {
  const { user, isGestor } = useAuth()
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchAlertas() {
    if (!user || !isGestor) return
    setLoading(true)
    const { data } = await supabase
      .from('alertas')
      .select('*, expediente:expedientes(*), user:profiles!alertas_user_id_fkey(*)')
      .order('created_at', { ascending: false })
    setAlertas((data as any[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchAlertas()
  }, [user?.id, isGestor])

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

  return { alertas, loading, deleteAlerta, createAlerta, refetch: fetchAlertas }
}
