// Dados do projeto Supabase. São PÚBLICOS (a anon key é feita para uso no
// navegador) — a segurança vem das políticas de acesso (RLS) no banco.
// Preencher com os valores do seu projeto (Project Settings → API).
export const SUPABASE_URL = 'https://ojdgljkroediijnngysp.supabase.co'
export const SUPABASE_ANON_KEY = 'sb_publishable_177jJPfA8nYpAbpdg2LC0w_roopttCU'

export const supabaseConfigurado =
  SUPABASE_URL.startsWith('https://') && SUPABASE_ANON_KEY.length > 20
