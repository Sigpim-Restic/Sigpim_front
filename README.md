# SIGPIM-SLZ — Frontend Fase 1 (MVP)

Sistema Integrado de Gestão do Patrimônio Imobiliário Municipal de São Luís — MA  
Prefeitura Municipal de São Luís · SEMAD / SIN

## Escopo da Fase 1

- Ficha do imóvel (wizard 5 etapas: Identificação → Localização → Classificação → Dados Físicos → Ocupação)
- Lista e busca de imóveis com filtros
- Gestão de ocupações
- Gestão de documentos/anexos
- Relatórios gerenciais (ficha, lista, ocupação)
- Auditoria completa (quem fez o quê, quando)
- Mapa GIS (base Leaflet + OpenStreetMap)
- Catálogos administrativos
- Usuários e perfis (7 perfis reais)

## Rodar com Docker (recomendado)

```bash
docker compose up --build
```

Acesse: http://localhost:5173

## Rodar localmente

```bash
npm install --legacy-peer-deps
npm run dev
```

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste:

```
VITE_API_URL=http://localhost:8080
```

## Stack

- React 19 + TypeScript
- Vite 6 + Tailwind CSS 4
- shadcn/ui (Radix UI)
- React Router 7
- Leaflet + React-Leaflet (mapa)
- Lucide React (ícones)
- Docker + Node 22 Alpine
