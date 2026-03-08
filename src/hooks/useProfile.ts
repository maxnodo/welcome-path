import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types/database.types'
import { useToast } from '@/hooks/use-toast'

export function useProfile() {
  const { profile, refreshProfile } = useAuth()
  const { toast } = useToast()

  async function updateProfile(updates: Partial<Profile>) {
    if (!profile) return
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id)
    if (error) {
      toast({ title: 'Error al guardar', description: error.message, variant: 'destructive' })
    } else {
      await refreshProfile()
      toast({ title: 'Perfil guardado correctamente' })
    }
  }

  return { profile, updateProfile }
}
