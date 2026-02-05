import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jnpzkzappuxpbgukykbl.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2p3dC5zdXBhYmFzZS5pby9hdXRoL3YxIiwicmVmIjoianB6a3phcHB1eHBiZ3VreWtiZXAiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczMzk5NzMwOCwiZXhwIjoxNzQ5NjI5MzA4fQ.rxbVXL7KcDt4lFvKxh0bBg9fLjMXlNZYV0fL1ZW2gg0'

export const supabase = createClient(supabaseUrl, supabaseKey)
