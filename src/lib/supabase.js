import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY, supabaseConfigurado } from '../config/supabase'

// Cliente único do Supabase. Fica null se ainda não foi configurado,
// e nesse caso o app funciona localmente (sem login/sincronização).
export const supabase = supabaseConfigurado
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null

export { supabaseConfigurado }
