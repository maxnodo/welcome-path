import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Profile, UserRole } from '@/types/database.types'

export function useAdminUsers() {
  const { user, isAdmin } = useAuth()
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchUsers() {
    if (!user || !isAdmin) return
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setUsers((data as Profile[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [user?.id, isAdmin])

  async function changeRole(targetUserId: string, newRole: UserRole) {
    const { error } = await supabase.rpc('admin_update_user_role', {
      target_user_id: targetUserId,
      new_role: newRole,
    })
    if (!error) await fetchUsers()
    return { error }
  }

  return { users, loading, changeRole, refetch: fetchUsers }
}
