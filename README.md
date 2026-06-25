# Investimentos · Dashboard pessoal

Dashboard de investimentos construído com **React + Vite + Tailwind CSS**, com
cotações atualizadas automaticamente. Tudo o que você cadastra fica salvo no
seu navegador (localStorage) — nada vai para servidores.

## O que tem

- **Visão Geral** — patrimônio total, lucro/prejuízo, dólar, alocação por classe e
  evolução do patrimônio (snapshot diário que cresce a cada dia que você abrir).
- **Minha Carteira** — suas ações/FIIs/ETFs/cripto/renda fixa com preço médio,
  preço atual e **lucro/prejuízo**. Adicione, edite e exclua ativos pela tela.
- **Rebalanceamento** — alocação atual vs. alvo + simulador de aporte (quanto
  comprar/vender de cada classe).
- **Metas** — objetivos com barra de progresso (patrimônio, valor ou % de classe).
- **Doutrina** — seus princípios de investimento (texto editável).
- **Configurações** — chaves de API e reset dos dados.

## Cotações (atualização diária automática)

Ao abrir, o app busca as cotações **uma vez por dia** (com cache) e dá para forçar
no botão **Atualizar** do topo. Fontes gratuitas:

| Ativo | Fonte | Precisa de chave? |
|-------|-------|-------------------|
| Cripto | CoinGecko | ❌ Não |
| Câmbio USD/BRL | AwesomeAPI | ❌ Não |
| Ações B3 / FIIs | brapi.dev | ⚠️ Token grátis (sem ele, vira preço manual) |
| Ações EUA | Twelve Data | ⚠️ Chave grátis (sem ela, vira preço manual) |

Cole o token/chave em **Configurações**. Sem eles, o ativo usa o preço manual que
você informar (ou o preço médio).

## Como rodar

```bash
npm install      # só na primeira vez
npm run dev      # desenvolvimento → http://localhost:5173
npm run build    # gera o site estático em /dist (pronto p/ GitHub Pages)
npm run preview  # pré-visualiza o build de produção
```

> Requer **Node.js**. Se o terminal não reconhecer `npm`, feche e reabra o terminal.

## Estrutura

```
src/
├── store/store.jsx        # estado central (carteira, metas, cotações, cálculos)
├── lib/
│   ├── calculos.js        # P&L, alocação, rebalanceamento, metas
│   ├── formato.js         # formatação pt-BR (R$, %, datas)
│   └── armazenamento.js   # persistência no localStorage
├── services/cotacoes.js   # busca de cotações ao vivo + histórico
├── data/dadosIniciais.js  # 👈 carteira/metas/doutrina de exemplo (sementes)
├── config/                # navegação e usuário
├── components/            # Sidebar, Header, StatCard, Modal, DashboardCard...
├── pages/                 # VisaoGeral, Carteira, Rebalanceamento, Metas, Doutrina, Configuracoes
└── layout/AppLayout.jsx   # sidebar + header + roteamento simples
```

## Publicar no GitHub Pages (próximo passo)

1. Crie um repositório e suba estes arquivos.
2. Rode `npm run build` (gera `/dist`).
3. Em Settings → Pages, publique a pasta `/dist` (ou use uma GitHub Action de deploy).
   O `base: './'` no `vite.config.js` já deixa o build pronto para qualquer caminho.

> Para um histórico de patrimônio compartilhado entre dispositivos (em vez do
> snapshot local), o próximo passo é uma GitHub Action diária que salva as
> cotações num arquivo do repositório.
