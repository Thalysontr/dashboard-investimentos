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

export function AppProvider({ children }) {
  const [carteira, setCarteira] = useLocalState('carteira_v1', carteiraInicial)
  const [alvo, setAlvo] = useLocalState('alvo_v1', alocacaoAlvoInicial)
  const [alvoAtivos, setAlvoAtivos] = useLocalState('alvoAtivos_v1', alvoAtivosInicial)
  const [metas, setMetas] = useLocalState('metas_v1', metasIniciais)
  const [intervaloMin, setIntervaloMin] = useLocalState('intervaloMin_v1', 15)
  const [doutrina, setDoutrina] = useLocalState('doutrina_v1', doutrinaInicial)

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

  // Ref para a versão mais recente de `atualizar` (carteira atual).
  const atualizarRef = useRef(atualizar)
  atualizarRef.current = atualizar

  // Primeira carga + revalidação automática no intervalo escolhido.
  // O intervalo é reagendado sempre que `intervaloMin` muda.
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

  // Snapshot diário do patrimônio (constrói a evolução ao longo do tempo).
  useEffect(() => {
    if (!cot.carregando && resumo.total > 0) {
      setHistorico(registrarSnapshot(resumo.total))
    }
  }, [cot.carregando, resumo.total])

  // Helpers de carteira
  const addPosicao = (p) => setCarteira((arr) => [...arr, { ...p, id: 'p' + Date.now() }])
  const editPosicao = (id, patch) =>
    setCarteira((arr) => arr.map((x) => (x.id === id ? { ...x, ...patch } : x)))
  const removePosicao = (id) => setCarteira((arr) => arr.filter((x) => x.id !== id))

  // Registra uma compra: soma a quantidade e recalcula o preço médio ponderado.
  const comprarPosicao = (id, quantidade, preco) =>
    setCarteira((arr) =>
      arr.map((p) => {
        if (p.id !== id) return p
        const novaQtd = p.quantidade + quantidade
        const novoMedio =
          novaQtd > 0
            ? (p.quantidade * p.precoMedio + quantidade * preco) / novaQtd
            : p.precoMedio
        return { ...p, quantidade: novaQtd, precoMedio: novoMedio }
      }),
    )

  const setAlvoAtivo = (id, pct) => setAlvoAtivos((m) => ({ ...m, [id]: pct }))

  // Helpers de metas
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
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
