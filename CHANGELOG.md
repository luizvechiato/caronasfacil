# Histórico de mudanças — Caronas Fácil

Registro (memorial) das atualizações do web app. Datas em UTC-3.
Regra de ouro dos redesigns: **só apresentação muda; a arquitetura de dados e as
mecânicas de funcionamento permanecem intactas.**

---

## v2.0.1 — 2026-08-27 · Correção de roteamento do /admin

- **fix(routing):** a rota `/admin` (um arquivo sem extensão) era entregue pelo
  navegador como **texto puro** em vez de renderizar. Adicionada regra de redirect
  (`/admin` → `/admin-login.html`, status 200, force) no `netlify.toml` ativo
  (`plataforma/netlify.toml`, base do build). Problema pré-existente, não causado
  pelo redesign.

---

## v2.0.0 — 2026-08-27 · Redesign editorial premium (todas as telas)

Revalidação editorial de layout, do "visual de app infantil" para um produto de
mobilidade premium. Benchmark: BlaBlaCar. **Nenhuma função, fluxo, integração,
handler, ID ou caminho de dados foi alterado** — mudança apenas de apresentação
(comprovado por auditoria de diff por arquivo).

### Sistema de design
- Identidade: **petróleo** (`#0c6e6b`) como cor principal, **âmbar** (`#e0913a`)
  como destaque e cor dos controles de personalização, neutro quente no lugar do
  cinza puro. Modo claro e escuro coerentes.
- Tipografia: **Fraunces** (títulos/marca) + **Hanken Grotesk** (interface),
  via Google Fonts.
- **Ícones de linha** (SVG inline) no lugar dos emoji, para tirar o ar "infantil".
- Escala de espaçamento, sombras e raios padronizados; header racionalizado
  (ações agrupadas em ícones); uma ação principal por tela, fixa na base no celular.

### event.html (tela do evento)
- Header, faixa e conteúdo reestilizados; **hero com o logo do evento** (auto-
  dimensionado) no lugar do emoji de carrinho; cartão de carona premium.
- **Personalização em 3 zonas** num menu próprio: **Zona 1 header**, **Zona 2
  faixa intermediária** (barra de datas/trajetos), **Zona 3 fundo da página**;
  **logo por upload de arquivo** (auto-dimensionado); **controles âmbar
  sobrepostos** em cada zona no modo admin; pré-visualização ao vivo.
- **fix:** contraste-coerência — quando o fundo é personalizado, superfícies,
  bordas e texto acompanham a luminância do fundo (evita mistura claro/escuro no
  modo escuro do aparelho). Descoberto em teste ao vivo.

### index.html (entrada)
- Landing, login, cadastro, recuperar senha, dashboard/viagens, criar evento e
  tela de sucesso — todas na nova identidade.

### admin-login.html / admin (login) e admin-dashboard.html (superadmin)
- Login e painel premium. A **tabela de 7 colunas vira cartões no celular**
  (via `data-label` + CSS responsivo) e volta a ser tabela no desktop.

### Auditoria (garantia de não-regressão)
- Caminhos Firebase (`ref/set/push/onValue/get/update`): idênticos antes/depois.
- Handlers `window.*` e `onclick`: idênticos (exceto os da personalização,
  refeitos de propósito).
- admin-login: JS 100% idêntico; admin-dashboard: só `data-label`/wrapper/ícone.
- Todos os bug fixes e features anteriores verificados como presentes.

---

## v1.x — 2026-08-26/27 · Funcionalidades e correções anteriores

- **feat:** login de admin real com **Firebase Authentication** (restrito a
  `lhvechiato@gmail.com`), no lugar da senha fixa em texto.
- **feat:** **geocoding genérico por cidade** — destino/origem aceitam só o nome
  da cidade (fallback para o centro da cidade), qualquer cidade/evento.
- **feat:** **trajetos opcionais** (ida/volta) — cada motorista cria o seu.
- **feat:** **personalização visual por evento** (primeira versão: logo + cores).
- **feat:** **notificações push reais via Firebase Cloud Messaging** (funcionam
  com o app fechado): pré-cadastro "avise-me" e avisos em entrar/sair/cancelar/
  editar carona. Sem dependências pagas novas.
- **feat:** parcelas no cartão via Mercado Pago (`create-payment.js`).
- **fix:** botão "Criar evento" nunca funcionava em produção — colisão do nome
  global `createEvent` com o método nativo `document.createEvent`. Corrigido para
  `window.createEvent()` no `onclick`.
- **fix:** contraste automático do texto ao personalizar cores (cabeçalho/fundo
  nunca ficam ilegíveis).

### Configuração de infraestrutura (feita pelo dono do projeto)
- Regra do Realtime Database para o nó `fcmTokens` (leitura/escrita liberadas).
- Variáveis de ambiente no Netlify para o FCM: `FCM_PROJECT_ID`,
  `FCM_CLIENT_EMAIL`, `FCM_PRIVATE_KEY` (a partir da conta de serviço do Firebase).
