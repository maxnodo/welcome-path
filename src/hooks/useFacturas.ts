import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Factura } from '@/types/database.types'

export function useFacturas() {
  const { user } = useAuth()
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchFacturas() {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('facturas')
      .select('*')
      .eq('user_id', user.id)
      .order('issued_at', { ascending: false })
    setFacturas((data as Factura[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchFacturas()
  }, [user?.id])

  const pendingCount = facturas.filter(f => f.status === 'pendiente').length

  return { facturas, loading, pendingCount, refetch: fetchFacturas }
}
