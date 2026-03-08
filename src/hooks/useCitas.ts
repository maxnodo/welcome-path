import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Cita } from '@/types/database.types'

export function useCitas() {
  const { user } = useAuth()
  const [citas, setCitas] = useState<Cita[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchCitas() {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('citas')
      .select('*, advisor:profiles!citas_advisor_id_fkey(*)')
      .eq('user_id', user.id)
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
    setCitas((data as Cita[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchCitas()
  }, [user?.id])

  async function createCita(type: Cita['type'], scheduledAt: string, durationMinutes: number, advisorId?: string) {
    if (!user) return
    await supabase.from('citas').insert({
      user_id: user.id,
      advisor_id: advisorId ?? null,
      type,
      status: 'confirmada',
      scheduled_at: scheduledAt,
      duration_minutes: durationMinutes,
      is_monthly_included: type !== 'reunion_extendida',
    })
    await fetchCitas()
  }

  async function cancelCita(id: string) {
    await supabase.from('citas').update({ status: 'cancelada', cancelled_at: new Date().toISOString() }).eq('id', id)
    await fetchCitas()
  }

  return { citas, loading, createCita, cancelCita, refetch: fetchCitas }
}
