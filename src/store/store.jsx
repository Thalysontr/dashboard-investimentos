import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useLocalState } from '../lib/armazenamento'
import { supabase } from '../lib/supabase'
import {
  carteiraInicial,
  alocacaoAlvoInicial,
  alvoAtivosInicial,
  metasIniciais,
  doutrinaInicial,
} from '../data/dadosIniciais'
import { buscarCotacoes, getHistorico, registrarSnapshot } from '../services/cotacoes'
import { calcularPosicoes, resumoCarteira } from '../lib/calculos'

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

// Chaves do localStorage que são sincronizadas com a nuvem.
const SYNC_KEYS = [
  'carteira_v1',
  'alvo_v1',
  'alvoAtivos_v1',
  'metas_v1',
  'doutrina_v1',
  'intervaloMin_v1',
  'config_apis_v1',
]

export function AppProvider({ children }) {
  const [carteira, setCarteira] = useLocalState('carteira_v1', carteiraInicial)
  const [alvo, setAlvo] = useLocalState('alvo_v1', alocacaoAlvoInicial)
  const [alvoAtivos, setAlvoAtivos] = useLocalState('alvoAtivos_v1', alvoAtivosInicial)
  const [metas, setMetas] = useLocalState('metas_v1', metasIniciais)
  const [doutrina, setDoutrina] = useLocalState('doutrina_v1', doutrinaInicial)
  const [intervaloMin, setIntervaloMin] = useLocalState('intervaloMin_v1', 15)

  // ------------------------------------------------------------------ Auth
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(!!supabase)
  const [sincronizando, setSincronizando] = useState(false)
  const cloudLoaded = useRef(false)
  const skipPush = useRef(false)

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
      if (!s) cloudLoaded.current = false
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  // Salva o estado atual no PERFIL do usuário (user_metadata) — sem precisar
  // de tabela/SQL no banco. Cada usuário só vê os próprios dados (são da conta).
  const pushToCloud = useCallback(async () => {
    if (!supabase || !session) return
    const snapshot = {}
    SYNC_KEYS.forEach((k) => {
      const v = localStorage.getItem(k)
      if (v != null) {
        try {
          snapshot[k] = JSON.parse(v)
        } catch {
          /* ignora */
        }
      }
    })
    setSincronizando(true)
    await supabase.auth.updateUser({ data: { dashboard: snapshot } })
    setSincronizando(false)
  }, [session])

  // Ao logar: busca os dados FRESCOS do servidor (não a cópia da sessão, que
  // pode estar velha) e aplica; se não houver, migra os dados locais.
  useEffect(() => {
    if (!supabase || !session || cloudLoaded.current) return
    let cancel = false
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      if (cancel) return
      const d = data?.user?.user_metadata?.dashboard
      if (d && typeof d === 'object' && Object.keys(d).length) {
        skipPush.current = true
        if (d.carteira_v1) setCarteira(d.carteira_v1)
        if (d.alvo_v1) setAlvo(d.alvo_v1)
        if (d.alvoAtivos_v1) setAlvoAtivos(d.alvoAtivos_v1)
        if (d.metas_v1) setMetas(d.metas_v1)
        if (typeof d.doutrina_v1 === 'string') setDoutrina(d.doutrina_v1)
        if (d.intervaloMin_v1) setIntervaloMin(d.intervaloMin_v1)
        if (d.config_apis_v1) localStorage.setItem('config_apis_v1', JSON.stringify(d.config_apis_v1))
        cloudLoaded.current = true
      } else {
        // Primeira vez nesta conta: sobe o que já existe localmente.
        cloudLoaded.current = true
        pushToCloud()
      }
    })()
    return () => {
      cancel = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  // Salva na nuvem (debounce) sempre que algo muda, após o load inicial.
  useEffect(() => {
    if (!supabase || !session || !cloudLoaded.current) return
    if (skipPush.current) {
      skipPush.current = false
      return
    }
    const t = setTimeout(() => pushToCloud(), 900)
    return () => clearTimeout(t)
  }, [carteira, alvo, alvoAtivos, metas, doutrina, intervaloMin, session, pushToCloud])

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email: email.trim(), password })
  const signUp = (email, password) => supabase.auth.signUp({ email: email.trim(), password })
  const signOut = () => supabase.auth.signOut()
  const pushNow = () => pushToCloud()

  // -------------------------------------------------------------- Cotações
  const [cot, setCot] = useState({
    precos: {},
    cambioUsdBrl: 5,
    atualizadoEm: null,
    carregando: true,
    erro: null,
  })
  const [historico, setHistorico] = useState(getHistorico())

  const atualizar = useCallback(
    async (forcar = false) => {
      setCot((c) => ({ ...c, carregando: true }))
      try {
        const r = await buscarCotacoes(carteira, { forcar })
        setCot({
          precos: r.precos,
          cambioUsdBrl: r.cambioUsdBrl,
          atualizadoEm: r.atualizadoEm,
          carregando: false,
          erro: null,
        })
      } catch (e) {
        setCot((c) => ({ ...c, carregando: false, erro: String(e) }))
      }
    },
    [carteira],
  )

  const atualizarRef = useRef(atualizar)
  atualizarRef.current = atualizar

  useEffect(() => {
    atualizarRef.current(false)
    const ms = Math.max(1, intervaloMin) * 60 * 1000
    const id = setInterval(() => atualizarRef.current(true), ms)
    return () => clearInterval(id)
  }, [intervaloMin])

  const posicoes = useMemo(
    () => calcularPosicoes(carteira, cot.precos, cot.cambioUsdBrl),
    [carteira, cot.precos, cot.cambioUsdBrl],
  )
  const resumo = useMemo(() => resumoCarteira(posicoes), [posicoes])

  useEffect(() => {
    if (!cot.carregando && resumo.total > 0) {
      setHistorico(registrarSnapshot(resumo.total))
    }
  }, [cot.carregando, resumo.total])

  // --------------------------------------------------------------- Helpers
  const addPosicao = (p) => setCarteira((arr) => [...arr, { ...p, id: 'p' + Date.now() }])
  const editPosicao = (id, patch) =>
    setCarteira((arr) => arr.map((x) => (x.id === id ? { ...x, ...patch } : x)))
  const removePosicao = (id) => setCarteira((arr) => arr.filter((x) => x.id !== id))

  const comprarPosicao = (id, quantidade, preco) =>
    setCarteira((arr) =>
      arr.map((p) => {
        if (p.id !== id) return p
        const novaQtd = p.quantidade + quantidade
        const novoMedio =
          novaQtd > 0 ? (p.quantidade * p.precoMedio + quantidade * preco) / novaQtd : p.precoMedio
        return { ...p, quantidade: novaQtd, precoMedio: novoMedio }
      }),
    )

  const setAlvoAtivo = (id, pct) => setAlvoAtivos((m) => ({ ...m, [id]: pct }))

  const addMeta = (m) => setMetas((arr) => [...arr, { ...m, id: 'm' + Date.now() }])
  const removeMeta = (id) => setMetas((arr) => arr.filter((x) => x.id !== id))

  const value = {
    carteira,
    setCarteira,
    addPosicao,
    editPosicao,
    removePosicao,
    comprarPosicao,
    alvo,
    setAlvo,
    alvoAtivos,
    setAlvoAtivos,
    setAlvoAtivo,
    metas,
    setMetas,
    addMeta,
    removeMeta,
    doutrina,
    setDoutrina,
    intervaloMin,
    setIntervaloMin,
    cot,
    atualizar,
    historico,
    posicoes,
    resumo,
    // auth / sync
    session,
    authLoading,
    sincronizando,
    signIn,
    signUp,
    signOut,
    pushNow,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
