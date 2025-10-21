# ✅ Checklist de Melhorias - Brain Bolt

Este documento contém um checklist prático e acionável de todas as melhorias sugeridas, organizadas por prioridade.

---

## 🚨 PRIORIDADE CRÍTICA (Fazer AGORA)

### 1. Segurança - Credenciais Expostas

- [ ] **Criar arquivo `.env.local` na raiz do projeto**

  ```bash
  touch .env.local
  ```

- [ ] **Criar arquivo `.env.example` na raiz**

  ```bash
  # .env.example
  VITE_SUPABASE_URL=https://seu-projeto.supabase.co
  VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
  ```

- [ ] **Atualizar `src/integrations/supabase/client.ts`**

  ```typescript
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error("Missing Supabase environment variables");
  }
  ```

- [ ] **Adicionar `.env.local` ao `.gitignore` (verificar se já existe)**
- [ ] **Revocar chaves antigas no dashboard do Supabase**
- [ ] **Gerar novas chaves no Supabase**
- [ ] **Atualizar README.md com instruções de configuração**
- [ ] **Fazer commit das mudanças**

**Arquivos a modificar:**

- `src/integrations/supabase/client.ts`
- `.env.example` (criar)
- `.gitignore` (verificar)
- `README.md` (atualizar)

---

### 2. TypeScript Strict Mode

- [ ] **Atualizar `tsconfig.json`**

  ```json
  {
    "compilerOptions": {
      "noImplicitAny": true,
      "strictNullChecks": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true
    }
  }
  ```

- [ ] **Corrigir erros de tipo que aparecerem**

  ```bash
  npm run build
  # Verificar erros e corrigir um por um
  ```

- [ ] **Remover todos os `any` explícitos**

  ```bash
  # Buscar por 'any' no código
  grep -r ": any" src/
  ```

- [ ] **Adicionar tipos para funções sem retorno explícito**

**Estimativa:** 2-4 horas

---

---

## 🔴 PRIORIDADE ALTA (Fazer esta semana)

### 3. Documentação

- [ ] **Criar `CHANGELOG.md`**

  ```markdown
  # Changelog

  ## [2.0.0] - 2025-10-21

  ### Added

  - Sistema de salas de aula
  - Perguntas customizadas
  - Modo escuro
  - Tutorial interativo
  - Hardware Arduino

  ### Changed

  - Melhorias de performance
  - UI redesenhada

  ### Fixed

  - Correções de bugs diversos

  ## [1.0.0] - 2024-XX-XX

  - Lançamento inicial
  ```

- [ ] **Criar `LICENSE`**

  ```
  MIT License

  Copyright (c) 2025 João Gabriel Lopes Aguiar

  Permission is hereby granted, free of charge, to any person obtaining a copy...
  ```

- [ ] **Atualizar `README.md`**
  - Adicionar link para documentação
  - Atualizar seção de instalação com .env.example

**Estimativa:** 1-2 horas

---

### 4. Código Arduino

- [ ] **Criar pasta `hardware/arduino/`**

  ```bash
  mkdir -p hardware/arduino
  ```

- [ ] **Criar `hardware/arduino/BrainBoltButtons/BrainBoltButtons.ino`**

  - Código completo do Arduino
  - Comentários explicativos
  - Configuração WiFi/WebSocket

- [ ] **Criar `hardware/arduino/README.md`**

  - Lista de componentes
  - Diagrama de circuito
  - Instruções de upload

- [ ] **Criar `hardware/arduino/diagrams/circuit.png`**

  - Diagrama Fritzing
  - Esquemático

- [ ] **Adicionar ao README principal**
  - Link para hardware/arduino/
  - Fotos do hardware montado

**Estimativa:** 4-6 horas

---

## 🟡 PRIORIDADE MÉDIA (Fazer este mês)

### 5. Performance Monitoring

- [ ] **Instalar Sentry**

  ```bash
  npm install @sentry/react @sentry/vite-plugin
  ```

- [ ] **Configurar Sentry no `main.tsx`**

  ```typescript
  import * as Sentry from "@sentry/react";

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 1.0,
  });
  ```

- [ ] **Adicionar Web Vitals**

  ```bash
  npm install web-vitals
  ```

- [ ] **Criar `src/utils/webVitals.ts`**

  ```typescript
  import { onCLS, onFID, onFCP, onLCP, onTTFB } from "web-vitals";

  export function reportWebVitals() {
    onCLS(console.log);
    onFID(console.log);
    onFCP(console.log);
    onLCP(console.log);
    onTTFB(console.log);
  }
  ```

**Estimativa:** 2-3 horas

---

### 6. SEO e Marketing

- [ ] **Criar `public/robots.txt`**

  ```
  User-agent: *
  Allow: /
  Sitemap: https://brainbolt.com/sitemap.xml
  ```

- [ ] **Criar `public/sitemap.xml`**

  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>https://brainbolt.com/</loc>
      <lastmod>2025-10-21</lastmod>
      <priority>1.0</priority>
    </url>
  </urlset>
  ```

- [ ] **Adicionar meta tags no `index.html`**

  ```html
  <!-- Open Graph -->
  <meta property="og:title" content="Brain Bolt - Quiz Educacional" />
  <meta
    property="og:description"
    content="Jogo de quiz educacional gamificado"
  />
  <meta property="og:image" content="/Brain-Bolt-Logo.png" />
  <meta property="og:url" content="https://brainbolt.com" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Brain Bolt" />
  <meta name="twitter:description" content="Quiz educacional gamificado" />
  <meta name="twitter:image" content="/Brain-Bolt-Logo.png" />
  ```

- [ ] **Adicionar Google Analytics**
  ```html
  <!-- Google tag (gtag.js) -->
  <script
    async
    src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
  ></script>
  ```

**Estimativa:** 2-3 horas

---

### 7. Melhorias UX

- [ ] **Adicionar loading skeletons**

  ```typescript
  // src/components/ui/skeleton.tsx
  import { cn } from "@/lib/utils";

  function Skeleton({
    className,
    ...props
  }: React.HTMLAttributes<HTMLDivElement>) {
    return (
      <div
        className={cn("animate-pulse rounded-md bg-muted", className)}
        {...props}
      />
    );
  }
  ```

- [ ] **Implementar em componentes que carregam dados**

  - BrainBoltGame
  - ClassroomDetails
  - FriendsModal
  - StatsModal

- [ ] **Adicionar transições de página**

  ```bash
  npm install framer-motion
  ```

- [ ] **Implementar i18n (internacionalização)**

  ```bash
  npm install i18next react-i18next
  ```

- [ ] **Criar arquivos de tradução**
  - `src/locales/pt-BR.json`
  - `src/locales/en.json`

**Estimativa:** 6-8 horas

---

## 🔵 PRIORIDADE BAIXA (Nice to Have)

### 8. Features Avançadas

- [ ] **Sistema de XP e Níveis**

  - Adicionar campos no banco
  - Criar componente de progresso
  - Implementar cálculo de XP

- [ ] **Modo Sobrevivência**

  - Criar nova tabela no banco
  - Implementar lógica de jogo
  - Criar leaderboard

- [ ] **Chat entre amigos**

  - Usar Supabase Realtime
  - Criar UI de chat
  - Notificações de mensagem

- [ ] **Sistema de badges**
  - Criar tabela de badges
  - Implementar conquistas especiais
  - UI de galeria de badges

**Estimativa:** 20-30 horas por feature

---

### 9. Infraestrutura

- [ ] **Criar `Dockerfile`**

  ```dockerfile
  FROM node:18-alpine AS builder
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci
  COPY . .
  RUN npm run build

  FROM nginx:alpine
  COPY --from=builder /app/dist /usr/share/nginx/html
  EXPOSE 80
  CMD ["nginx", "-g", "daemon off;"]
  ```

- [ ] **Criar `docker-compose.yml`**

  ```yaml
  version: "3.8"
  services:
    web:
      build: .
      ports:
        - "8080:80"
      environment:
        - NODE_ENV=production
  ```

- [ ] **Setup de backup automático**
  - Configurar no Supabase
  - Scripts de backup local

**Estimativa:** 4-6 horas

---

## 📊 Progresso Geral

### Status Inicial

- [ ] 🔴 Segurança (0/8)
- [ ] 🔴 TypeScript Strict (0/4)
- [ ] 🟡 Documentação (0/3)
- [ ] 🟡 Arduino (0/5)
- [ ] 🟢 Performance (0/4)
- [ ] 🟢 SEO (0/4)
- [ ] 🟢 UX (0/5)
- [ ] 🔵 Features (0/4)
- [ ] 🔵 Infra (0/3)

**Total: 0/40 tarefas concluídas**

---

## 🎯 Metas Semanais Sugeridas

### Semana 1

- [ ] Completar todas as tarefas CRÍTICAS (Segurança + TypeScript)
- Meta: 12/40 tarefas (30%)

### Semana 2

- [ ] Completar todas as tarefas ALTA (Documentação + Arduino)
- Meta: 20/40 tarefas (50%)

### Semana 3

- [ ] Completar tarefas MÉDIA (Performance + SEO + UX)
- Meta: 33/40 tarefas (82%)

### Semana 4

- [ ] Completar tarefas BAIXA (Features + Infra)
- Meta: 40/40 tarefas (100%)

---

## 📝 Notas

- Marque as tarefas conforme for completando
- Faça commits frequentes
- Teste cada mudança antes de continuar
- Peça ajuda se necessário
- Celebre pequenas vitórias! 🎉

---

**Bom trabalho! 💪**
