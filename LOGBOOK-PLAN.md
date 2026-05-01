# OTTO Logbook — Plano de Desenvolvimento e Status

> Documento de controle do projeto. Atualizado automaticamente a cada sessão de desenvolvimento.
> **Última atualização:** Abril 2026

---

## Visão Geral

PWA para registro cirúrgico de otorrinolaringologistas (ORL), integrada ao ecossistema OTTO.

- **Repositório:** https://github.com/dhsig86/otto-log
- **Pasta local:** `C:\Users\drdhs\OneDrive\Documentos\AOTTO ECOSYSTEM\OTTO LOGBOOK`
- **Frontend:** React 18 + Vite + TypeScript — deploy Vercel
- **Backend:** Express + TypeScript — deploy Render.com
- **Auth & DB:** Firebase (mesmo projeto do OTTO PWA)

---

## Estrutura do Monorepo

```
OTTO LOGBOOK/
├── apps/
│   └── otto-pwa/                   ✅ PWA principal
├── packages/
│   ├── shared-auth/                ✅ useAuth, AuthProvider, RequireAuth, RequireRole
│   ├── shared-firebase/            ✅ Cliente Firebase + converters tipados
│   ├── shared-ontology/            ✅ ENTOntologyEngine (27 procedimentos ORL)
│   ├── shared-types/               ✅ Tipos transversais
│   ├── shared-ui/                  ✅ Design system (Button, Input, Badge, Card, Spinner, etc.)
│   └── shared-utils/               ✅ formatDate, formatDuration, etc.
├── services/
│   └── otto-backend/               ✅ API Express + Zod + Firebase Admin
├── functions/                      ✅ Cloud Functions v2 (audit, sanitização de imagens)
└── firebase/                       ✅ Firestore rules + Storage rules + indexes
```

---

## Status por Fase

### ✅ Fase 0 — Monorepo Scaffold
- Turborepo + pnpm workspaces configurados
- Todos os pacotes `@otto/*` criados e referenciados
- `turbo.json`, `.gitignore`, `package.json` raiz prontos
- CI/CD: `.github/workflows/ci.yml` e configurações de deploy

### ✅ Fase 1 — Design System (shared-ui)
Componentes disponíveis em `packages/shared-ui/src/`:
- `Button` — variantes: primary, secondary, ghost, danger; tamanhos: sm, md, lg
- `Input` — com erro, hint, ícone
- `Textarea` — com resize e contador
- `Select` — tipado com opções
- `FormField` — wrapper com label, erro, hint
- `Badge` — cores: blue, purple, amber, red, slate, green; com dot
- `Card` — clicável com hover
- `Spinner` — tamanhos sm/md/lg
- `EmptyState` — ícone + título + descrição + ação

### ✅ Fase 2 — Backend API
Rotas em `services/otto-backend/src/routes/logbook/`:
- `POST /logbook` — criar registro
- `GET /logbook` — listar com paginação cursor-based e filtros
- `GET /logbook/:id` — detalhe
- `PATCH /logbook/:id` — editar
- `DELETE /logbook/:id` — remover
- `POST /logbook/:id/duplicate` — duplicar
- `POST /logbook/extract-from-voice` — placeholder para Fase 4 (Whisper)

Validação Zod com middleware genérico. Auth middleware com Firebase Admin.

### ✅ Fase 3 — Formulário Multi-Seção
7 seções no formulário (`LogbookForm`):
1. **Cirurgia** — data, hora início/fim, duração, instituição, sala
2. **Procedimento** — subespecialidade, lateralidade, busca por ontologia ENT, CIDs, abordagem
3. **Paciente** — idade, sexo, ASA, comorbidades (sem PII)
4. **Equipe** — papel do cirurgião, supervisor, membros da equipe
5. **Técnica** — anestesia, enxerto, implante, achados intraoperatórios
6. **Desfecho** — sangramento estimado, complicações, conversão não planejada
7. **Notas** — ensino, notas clínicas, notas privadas

Funcionalidades:
- **Auto-save rascunho** a cada 10 segundos após última alteração
- Validação com React Hook Form + Zod
- Acordeão por seção com indicador de erro

Páginas:
- `LogbookListPage` — lista com infinite scroll + filtros (busca, subespecialidade, papel)
- `LogbookDetailPage` — visualização completa com ações (editar, duplicar, excluir)
- `LogbookNewPage` — formulário de criação
- `LogbookEditPage` — formulário de edição pré-populado

### ✅ Fase 7 — Ontologia ENT + Guidelines
Motor de ontologia em `packages/shared-ontology/`:
- **27 procedimentos ORL** com TUSS, CID-10, MeSH, subespecialidade
- Subespecialidades cobertas: otologia, rinologia, laringo-faringe, cabeça e pescoço, sono, pediátrica, plástica facial
- Guidelines vinculadas: AAO-HNS, EPOS, ATA, AAOHNS, ERS, BSACI
- Links PubMed gerados automaticamente por MeSH

Integração na UI:
- `ProcedureSearch` — autocomplete com busca client-side (sem API round-trip, funciona offline)
- `GuidelineCard` — card compacto com link para guideline + PubMed
- `GuidelinesInline` — exibido automaticamente no formulário ao selecionar um procedimento
- `LogbookDetailPage` — guidelines e PubMed exibidos na visualização do caso

---

## ✅ Autenticação Unificada (implementado nesta sessão)

O login do OTTO Logbook é **o mesmo login do OTTO PWA** — mesmo projeto Firebase, mesma conta.

**Como funciona:**
- `AuthProvider` no topo da árvore (`App.tsx`) — único contexto de auth para todas as rotas
- `LoginPage` (`/login`) com:
  - Formulário email + senha
  - Botão "Entrar com Google" (OAuth)
  - Tratamento de erros em português
  - Redirect automático para a página solicitada após login
- `RequireAuth` protege todas as rotas do logbook — redireciona para `/login` se não autenticado
- Tokens Firebase gerenciados automaticamente (persistência via IndexedDB no browser)

**Configuração necessária no Firebase Console:**
1. Authentication → Sign-in method → ativar "E-mail/senha"
2. Authentication → Sign-in method → ativar "Google"
3. Authentication → Settings → Authorized domains → adicionar o domínio da Vercel

---

## ✅ Exportação de Dados (implementado nesta sessão)

Botão "⬇ Exportar" aparece na lista quando há registros.

**Formatos disponíveis:**
- **CSV** — compatível com Excel (BOM UTF-8), inclui todos os campos clínicos relevantes
- **JSON** — estruturado com metadados de versão, ideal para backup ou importação futura

**Campos exportados no CSV:**
`id, data_cirurgia, instituição, sala, subespecialidade, procedimento, código TUSS, lateralidade, abordagem, duração, idade paciente, sexo, ASA, comorbidades, papel cirurgião, supervisor, anestesia, enxerto, implante, achados, sangramento, conversão, nº complicações, tipos complicações, severidade, CIDs, pontos de ensino, notas clínicas, criado em, atualizado em`

Somente registros **publicados** (não rascunhos) são exportados.

---

## ⏳ Fases Pendentes (aguardam curadoria)

### Fase 4 — Voice-to-Log (Whisper)
- **Status:** Placeholder no backend criado (`POST /logbook/extract-from-voice`)
- **O que falta:** Integrar Whisper API real + UI de gravação de voz + validação dos campos extraídos
- **Requer:** Testes com gravações reais em português médico

### Fase 5 — Upload de Imagens Intraoperatórias
- **Status:** Cloud Function de sanitização EXIF criada; schema `LogbookImage` definido
- **O que falta:** UI de upload no formulário; integração com Firebase Storage; visualização no detalhe
- **Requer:** Teste com dispositivo real (câmera/galeria)

### Fase 6 — Dashboard de Casuística
- **Status:** Rota `/logbook/dashboard` criada (página placeholder `LogbookDashboardPage`)
- **O que falta:** Gráficos de evolução temporal, distribuição por subespecialidade, taxa de complicações, mapa de curva de aprendizado
- **Requer:** Decisão de design e biblioteca de gráficos (sugestão: Recharts)

### Fase 8 — Offline-First + Sync Automático
- **Status:** `syncStatus` e `version` presentes no schema; estrutura preparada
- **O que falta:** Service Worker com cache de Firestore; resolução de conflitos; fila de sync
- **Requer:** Testes em ambiente com conectividade intermitente

### Fase 9 — Beta e Onboarding
- **Status:** Não iniciada
- **O que falta:** Tela de onboarding, convites para beta testers, analytics

---

## Pendências Técnicas

### Crítico (bloqueia build)
- [ ] **Confirmar `@hookform/resolvers` em `apps/otto-pwa/package.json`** — o formulário usa `zodResolver` desse pacote
  ```bash
  cd apps/otto-pwa && pnpm add @hookform/resolvers
  ```

### Configuração Firebase (fazer no Console antes do primeiro deploy)
- [ ] Ativar "E-mail/senha" em Authentication → Sign-in method
- [ ] Ativar "Google" em Authentication → Sign-in method
- [ ] Adicionar domínio Vercel em Authentication → Authorized domains
- [ ] Copiar credenciais para `apps/otto-pwa/.env.local` (baseado em `.env.example`)
- [ ] `firebase deploy --only firestore:rules,storage:rules,firestore:indexes`

### Antes do Deploy
- [ ] Verificar variáveis de ambiente no painel da Vercel
- [ ] Configurar `FIREBASE_ADMIN_*` no Render.com (para o backend)
- [ ] Definir CORS do backend para o domínio da Vercel

---

## Instruções de Commit (do Windows PowerShell)

Após cada sessão de desenvolvimento do Claude, fazer commit do que foi produzido:

```powershell
cd "C:\Users\drdhs\OneDrive\Documentos\AOTTO ECOSYSTEM\OTTO LOGBOOK"
git add .
git commit -m "feat: <descrição das mudanças>"
git push origin main
```

### Commits por sessão
| Sessão | O que comitar |
|--------|--------------|
| 1 | Monorepo scaffold + todos os packages + módulo logbook completo |
| 2 | Login unificado + exportação CSV/JSON + guidelines inline no formulário |

---

## Decisões de Arquitetura

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Monorepo | Turborepo + pnpm | Build incremental, compartilhamento de tipos sem bridges |
| Auth | Firebase Auth (mesmo projeto OTTO PWA) | Login unificado, sem conta separada |
| DB | Firestore | Real-time, offline-capable, regras por ownerUid |
| Formulário | React Hook Form + Zod | Performance, validação tipada end-to-end |
| Paginação | Cursor-based (Firestore startAfter) | Escalável, sem offset |
| Busca textual | Client-side após Firestore query | Simplicidade; Algolia pode ser adicionado depois |
| Ontologia | ENTOntologyEngine client-side | Zero latência, funciona offline |
| Export | CSV (Excel-compatible) + JSON | CSV para planilhas, JSON para backup/importação |

---

## Próximos Passos Sugeridos

1. **Agora:** Fazer o primeiro commit e push (instruções acima)
2. **Antes de testar:** Configurar Firebase Console e variáveis de ambiente
3. **Próxima sessão:** Fase 6 — Dashboard de Casuística (decidir quais métricas mostrar)
4. **Após testes:** Fase 4 — Voice-to-Log com Whisper
5. **Médio prazo:** Fase 5 — Upload de imagens + Fase 8 — Offline sync

---

## ✅ Fase 6 — Dashboard de Casuística (implementado nesta sessão)

### Dependência adicionada
- `recharts@^2.12.0` adicionado a `apps/otto-pwa/package.json`
- `@hookform/resolvers@^3.3.0` adicionado (necessário para validação do formulário)

### Hook `useLogbookStats`
Arquivo: `apps/otto-pwa/src/modules/logbook/hooks/useLogbookStats.ts`
- Busca todos os registros publicados via `LogbookService.listAllForExport()`
- Computa estatísticas client-side (adequado para logbooks pessoais de dezenas a centenas de casos)
- Stale time de 5 minutos (não precisa ser realtime)

### Dashboard `LogbookDashboardPage`
Arquivo: `apps/otto-pwa/src/modules/logbook/pages/LogbookDashboardPage.tsx`

**Cards de resumo (topo):**
- Total de cirurgias publicadas + contagem de rascunhos
- Taxa de complicações (% — verde/âmbar/vermelho adaptativo)
- Duração média por cirurgia
- Número de instituições distintas

**Gráficos:**
- BarChart: casos por mês (últimos 18 meses)
- PieChart: distribuição por subespecialidade (com % inline)
- PieChart: papel do cirurgião (attending, residente, fellow, etc.)
- BarChart horizontal: top 8 procedimentos mais frequentes
- Barras de progresso: tipos de anestesia
- Barras de progresso: complicações por severidade (Leve / Grave / Risco de Vida)
- Barras de progresso: top 5 instituições

**Estado vazio:** tela especial quando não há casos publicados, com botão para registrar o primeiro caso.

**Exportação:** botão "⬇ Exportar" (CSV ou JSON) disponível também no dashboard.

---

## 🚀 Deploy no Vercel — Checklist Completo

O código está no GitHub mas ainda **não foi enviado ao Vercel**. Siga estes passos:

### 1. Instalar dependências novas (após git pull, no terminal Windows)
```powershell
cd "C:\Users\drdhs\OneDrive\Documentos\AOTTO ECOSYSTEM\OTTO LOGBOOK"
pnpm install
```

### 2. Configurar Firebase Console (antes do deploy)
Acesse https://console.firebase.google.com → seu projeto OTTO:

- **Authentication → Sign-in method:**
  - ✅ Ativar "E-mail/senha"
  - ✅ Ativar "Google"
- **Authentication → Settings → Authorized domains:**
  - Adicionar o domínio da Vercel (ex: `otto-logbook.vercel.app`)
- **Firestore Database:** criar o banco se ainda não existe (modo produção)
- **Deploy das regras e índices:**
  ```bash
  firebase deploy --only firestore:rules,storage:rules,firestore:indexes
  ```

### 3. Criar `.env.local` com credenciais Firebase
```bash
cp apps/otto-pwa/.env.example apps/otto-pwa/.env.local
# Editar .env.local com as chaves do Firebase Console
```

Chaves necessárias (encontre em Firebase Console → Configurações do projeto → Web):
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### 4. Testar build local antes do deploy
```powershell
pnpm build
# Verificar se o build termina sem erros
```

### 5. Conectar ao Vercel
1. Acesse https://vercel.com → "Add New Project"
2. Importar o repositório `dhsig86/otto-log` do GitHub
3. **Framework Preset:** Vite
4. **Root Directory:** `apps/otto-pwa`
5. **Environment Variables:** copiar todas as `VITE_FIREBASE_*` do `.env.local`
6. Clicar em "Deploy"

### 6. Verificar após deploy
- Acessar a URL da Vercel
- Testar login com email e com Google
- Criar um registro de teste
- Verificar dashboard e exportação
