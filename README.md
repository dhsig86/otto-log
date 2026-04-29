# OTTO Logbook — Registro Cirúrgico para Otorrinolaringologistas

> PWA monorepo para registro, análise e gestão da casuística cirúrgica em ORL.

## Estrutura

```
otto-monorepo/
├── apps/otto-pwa/          # React 18 + Vite + TypeScript (Vercel)
├── packages/
│   ├── shared-auth/        # useAuth, RequireAuth, RequireRole
│   ├── shared-firebase/    # Cliente Firebase + converters tipados
│   ├── shared-ontology/    # Motor ENT (TUSS/CID/MeSH)
│   ├── shared-types/       # Tipos transversais
│   ├── shared-ui/          # Design system
│   └── shared-utils/       # Datas, formatadores
├── services/otto-backend/  # Express + TypeScript (Render.com)
├── functions/              # Firebase Cloud Functions
└── firebase/               # Rules + indexes
```

## Pré-requisitos

- Node.js >= 20
- pnpm >= 9 (`npm install -g pnpm`)

## Início rápido

```bash
# Instalar dependências
pnpm install

# Rodar frontend em dev
pnpm dev

# Build de produção
pnpm build
```

## Variáveis de ambiente

Copie `.env.example` para `.env.local` em `apps/otto-pwa/`:

```bash
cp apps/otto-pwa/.env.example apps/otto-pwa/.env.local
```

## Módulos

### OTTO Logbook (`/logbook`)
Registro cirúrgico completo com:
- Formulário multi-step (Fase 3)
- Voice-to-Log via Whisper (Fase 4)
- Upload seguro de imagens com sanitização EXIF (Fase 5)
- Dashboard de casuística (Fase 6)
- Integração com ontologia ENT e guidelines (Fase 7)
- Offline-first com sync automático (Fase 8)

## Deploy

- **Frontend:** Vercel (auto-deploy no push para `main`)
- **Backend:** Render.com (veja `services/otto-backend/render.yaml`)
- **Firebase:** `firebase deploy --only fires