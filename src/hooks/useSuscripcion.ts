import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Suscripcion } from '@/types/database.types'

export function useSuscripcion() {
  const { user } = useAuth()
  const [suscripcion, setSuscripcion] = useState<Suscripcion | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchSuscripcion() {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('suscripciones')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
    setSuscripcion(data as Suscripcion | null)
    setLoading(false)
  }

  useEffect(() => {
    fetchSuscripcion()
  }, [user?.id])

  async function cancelSuscripcion() {
    if (!suscripcion) return
    await supabase.from('suscripciones').update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      auto_renew: false,
    }).eq('id', suscripcion.id)
    await fetchSuscripcion()
  }

  const isActive = suscripcion?.status === 'active'

  return { suscripcion, loading, isActive, cancelSuscripcion, refetch: fetchSuscripcion }
}
