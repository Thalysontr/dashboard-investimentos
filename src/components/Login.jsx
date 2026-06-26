import { useState } from 'react'
import { LogIn, UserPlus, Mail, Lock, Loader2 } from 'lucide-react'
import { useApp } from '../store/store'

const inputCls =
  'w-full rounded-xl border border-line bg-canvas pl-10 pr-3 py-2.5 text-sm text-ink outline-none transition focus:border-brand/40 focus:bg-white focus:ring-4 focus:ring-brand/10'

export default function Login() {
  const { signIn, signUp } = useApp()
  const [modo, setModo] = useState('entrar') // 'entrar' | 'criar'
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState(null)
  const [msg, setMsg] = useState(null)
  const [carregando, setCarregando] = useState(false)

  async function enviar(e) {
    e.preventDefault()
    setErro(null)
    setMsg(null)
    setCarregando(true)
    try {
      const fn = modo === 'entrar' ? signIn : signUp
      const { data, error } = await fn(email, senha)
      if (error) {
        setErro(traduzir(error.message))
      } else if (modo === 'criar' && !data.session) {
        setMsg('Conta criada! Se chegar um e-mail de confirmação, clique no link e depois entre aqui.')
        setModo('entrar')
      }
      // se houver sessão, o app troca de tela automaticamente
    } catch (err) {
      setErro(String(err))
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand shadow-brand">
            <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none">
              <path d="M7 21l6-7 4 4 8-10" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="text-2xl font-extrabold tracking-tight text-ink">
            Invest<span className="text-brand">.</span>
          </span>
        </div>

        <div className="rounded-2xl border border-line bg-white p-6 shadow-card sm:p-8">
          <h1 className="text-lg font-bold text-ink">
            {modo === 'entrar' ? 'Entrar na sua conta' : 'Criar sua conta'}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Seus dados ficam salvos e sincronizam em qualquer dispositivo.
          </p>

          <form onSubmit={enviar} className="mt-6 space-y-4">
            <div className="relative">
              <Mail size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className={inputCls}
                type="email"
                required
                autoComplete="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className={inputCls}
                type="password"
                required
                minLength={6}
                autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
                placeholder="Senha (mín. 6 caracteres)"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>

            {erro && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-danger">{erro}</p>
            )}
            {msg && (
              <p className="rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-success">{msg}</p>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-2.5 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-dark disabled:opacity-60"
            >
              {carregando ? (
                <Loader2 size={18} className="animate-spin" />
              ) : modo === 'entrar' ? (
                <LogIn size={18} />
              ) : (
                <UserPlus size={18} />
              )}
              {modo === 'entrar' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-muted">
            {modo === 'entrar' ? 'Ainda não tem conta?' : 'Já tem conta?'}{' '}
            <button
              onClick={() => {
                setModo(modo === 'entrar' ? 'criar' : 'entrar')
                setErro(null)
                setMsg(null)
              }}
              className="font-semibold text-brand hover:text-brand-dark"
            >
              {modo === 'entrar' ? 'Criar conta' : 'Entrar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function traduzir(m = '') {
  if (/Email not confirmed/i.test(m)) return 'Confirme seu e-mail pelo link que enviamos e tente entrar de novo.'
  if (/Invalid login credentials/i.test(m)) return 'E-mail ou senha incorretos.'
  if (/already registered|already exists/i.test(m)) return 'Este e-mail já tem conta. Use “Entrar”.'
  if (/Password should be at least/i.test(m)) return 'A senha precisa de pelo menos 6 caracteres.'
  if (/rate limit/i.test(m)) return 'Muitas tentativas. Aguarde um instante.'
  return m
}
