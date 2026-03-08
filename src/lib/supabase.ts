import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ifbgvorutbbazbcuztqn.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmYmd2b3J1dGJiYXpiY3V6dHFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5ODA2NzEsImV4cCI6MjA4ODU1NjY3MX0.DldWQep6TR9oPhlb5oFNzesIAz9LSpRMVt5YUxyQ-Wc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})
