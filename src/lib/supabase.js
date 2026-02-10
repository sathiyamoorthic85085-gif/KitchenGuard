import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jnpzkzappuxpbgukykbl.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpucHpremFwcHV4cGJndWt5a2JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNjU2MTQsImV4cCI6MjA4NTg0MTYxNH0.zXckzgQHvd-f9DK9y7jSK5QMkdHHfSRoqEffdtGFFB8'

export const supabase = createClient(supabaseUrl, supabaseKey)
