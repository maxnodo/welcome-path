import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface Gestor {
  id: string
  full_name: string | null
  email: string | null
  role: string
}

export function useGestores() {
  const [gestores, setGestores] = useState<Gestor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .in('role', ['gestor', 'admin'])
      .order('full_name')
      .then(({ data }) => {
        setGestores((data as Gestor[]) ?? [])
        setLoading(false)
      })
  }, [])

  return { gestores, loading }
}
