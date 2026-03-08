import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Cita } from '@/types/database.types'

export function useAdminCitas() {
  const { user, isGestor } = useAuth()
  const [citas, setCitas] = useState<Cita[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchCitas() {
    if (!user || !isGestor) return
    setLoading(true)
    const { data } = await supabase
      .from('citas')
      .select('*, advisor:profiles!citas_advisor_id_fkey(*), user:profiles!citas_user_id_fkey(*)')
      .order('scheduled_at', { ascending: true })
    setCitas((data as any[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchCitas()
  }, [user?.id, isGestor])

  async function updateCita(id: string, updates: Partial<Cita>) {
    const { error } = await supabase.from('citas').update(updates).eq('id', id)
    if (!error) await fetchCitas()
    return { error }
  }

  return { citas, loading, updateCita, refetch: fetchCitas }
}
