import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Alerta } from '@/types/database.types'

export function useAdminAlertas() {
  const { user, isGestor, isAdmin } = useAuth()
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchAlertas() {
    if (!user || !isGestor) return
    setLoading(true)

    let data: any[] | null = null

    if (isAdmin) {
      // Admin sees all alertas
      const res = await supabase
        .from('alertas')
        .select('*, expediente:expedientes(*), user:profiles!alertas_user_id_fkey(*)')
        .order('created_at', { ascending: false })
      data = res.data
    } else {
      // Gestor only sees alertas linked to expedientes they manage (advisor_id = user.id).
      // NOTE: Alertas without expediente_id (general alerts) will NOT be visible
      // to gestors with this inner join — only admins can see those.
      const res = await supabase
        .from('alertas')
        .select('*, expediente:expedientes!inner(*), user:profiles!alertas_user_id_fkey(*)')
        .eq('expediente.advisor_id', user.id)
        .order('created_at', { ascending: false })
      data = res.data
    }

    setAlertas((data as any[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchAlertas()
  }, [user?.id, isGestor, isAdmin])

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
