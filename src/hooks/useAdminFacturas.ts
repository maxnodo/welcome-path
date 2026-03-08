import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Factura } from '@/types/database.types'

export function useAdminFacturas() {
  const { user, isGestor } = useAuth()
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchFacturas() {
    if (!user || !isGestor) return
    setLoading(true)
    const { data } = await supabase
      .from('facturas')
      .select('*, user:profiles!facturas_user_id_fkey(*)')
      .order('issued_at', { ascending: false })
    setFacturas((data as any[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchFacturas()
  }, [user?.id, isGestor])

  async function updateFactura(id: string, updates: Partial<Factura>) {
    const { error } = await supabase.from('facturas').update(updates).eq('id', id)
    if (!error) await fetchFacturas()
    return { error }
  }

  return { facturas, loading, updateFactura, refetch: fetchFacturas }
}
