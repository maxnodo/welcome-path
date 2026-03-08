import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Alerta } from '@/types/database.types'

export function useAlertas() {
  const { user } = useAuth()
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchAlertas() {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('alertas')
      .select('*, expediente:expedientes(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setAlertas((data as Alerta[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchAlertas()

    if (!user) return
    const channel = supabase
      .channel('alertas-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'alertas',
        filter: `user_id=eq.${user.id}`,
      }, () => fetchAlertas())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user?.id])

  async function markAsRead(id: string) {
    await supabase.from('alertas').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', id)
    await fetchAlertas()
  }

  async function markAllAsRead() {
    if (!user) return
    await supabase.from('alertas').update({ is_read: true, read_at: new Date().toISOString() }).eq('user_id', user.id).eq('is_read', false)
    await fetchAlertas()
  }

  const unreadCount = alertas.filter(a => !a.is_read).length

  return { alertas, loading, markAsRead, markAllAsRead, unreadCount, refetch: fetchAlertas }
}
