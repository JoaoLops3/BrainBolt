# 🧠 Brain Bolt - Jogo de Quiz Educacional

<div align="center">
  <img src="public/Brain-Bolt-Logo.png" alt="Brain Bolt Logo" width="200" height="200">
  
  [![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-5.4.19-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-2.57.2-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
  [![Capacitor](https://img.shields.io/badge/Capacitor-7.4.3-119EFF?style=flat&logo=capacitor&logoColor=white)](https://capacitorjs.com/)
</div>

## 📖 Sobre o Projeto

**Brain Bolt** é um jogo de quiz educacional que transforma o aprendizado em uma experiência divertida e gamificada. Desenvolvido especialmente para uso em salas de aula, combina tecnologia digital com interação física para criar um ambiente de aprendizado envolvente e competitivo.

### 🎯 Missão Educacional

O Brain Bolt foi criado para resolver um dos maiores desafios da educação moderna: manter o foco e o engajamento dos alunos durante as aulas. Através da gamificação, os estudantes aprendem sem perceber, competem de forma saudável e desenvolvem conhecimentos em diversas áreas enquanto se divertem.

### ✨ Características Principais

#### 🎮 Sistema de Jogo

- **4 Modos**: Normal (sem tempo), Veloz (15s), Físico (botões hardware), Multiplayer
- **160 Perguntas** em 8 categorias: ⚽ Esportes, 🎬 Entretenimento, 🎨 Arte, 🔬 Ciências, 🌍 Geografia, 🏛️ História, ➕ Matemática, 📚 Português
- **Sistema de Pontuação**: 100 pontos/acerto + bônus por streaks
- **Personagens Colecionáveis**: Desbloqueie por categoria

#### 👥 Social

- **Multiplayer em Tempo Real**: Partidas 1v1 com salas privadas
- **Sistema de Amigos**: Busque, adicione e desafie amigos
- **Rankings Globais**: Compare estatísticas com outros jogadores

#### 🏫 Educacional

- **Salas de Aula**: Professores criam grupos para turmas
- **Perguntas Customizadas**: Crie perguntas ilimitadas
- **Competições**: Rankings e estatísticas por sala
- **Hardware Físico**: Botões Arduino via Web Serial API - [Guia de Conexão](docs/CONECTAR-ARDUINO-RAPIDO.md)

#### 🎨 UX/UI

- **Modo Escuro** 🌙: Claro, Escuro ou Automático
- **Tutorial Interativo** 🎓: 6 passos para novos usuários
- **Totalmente Responsivo** 📱: Mobile, Tablet, Desktop, iOS, Android
- **Design Moderno**: Glassmorphism, gradientes, animações fluidas

#### ⚡ Performance

- **PWA Offline**: Funciona sem internet após 1º acesso
- **Lazy Loading**: Carregamento otimizado de componentes
- **Code Splitting**: Bundle reduzido em ~40%
- **Cache Inteligente**: Service Worker avançado

## 🚀 Stack Tecnológica

### Frontend

- **React 18.3.1** - UI library com hooks e contexto
- **TypeScript 5.8.3** - Tipagem estática
- **Vite 5.4.19** - Build tool ultra-rápido
- **Tailwind CSS 3.4.17** - Framework CSS utilitário
- **shadcn/ui + Radix UI** - Componentes modernos e acessíveis
- **Lucide React** - Ícones SVG otimizados
- **React Router DOM 6.30.1** - Roteamento
- **TanStack Query 5.83.0** - Cache e sincronização
- **Zustand** - State management

### Backend & Database

- **Supabase 2.57.2** - Backend-as-a-Service completo
- **PostgreSQL** - Banco de dados relacional com extensões avançadas
- **Row Level Security (RLS)** - Segurança granular a nível de linha
- **Real-time subscriptions** - Atualizações em tempo real via WebSockets
- **Supabase Auth** - Autenticação completa com providers sociais
- **Edge Functions** - Serverless functions para lógica de negócio

### Hardware & IoT

- **Web Serial API** - Conexão direta USB → Navegador (sem servidor)
- **Arduino** - Controladores físicos para modo educacional
- **Plug & Play** - Configuração zero, conexão instantânea

### Mobile & PWA

- **Capacitor 7.4.3** - Framework para apps híbridos nativos
- **iOS & Android** - Versões nativas otimizadas
- **PWA Avançado** - Progressive Web App com:
  - Service Worker com cache inteligente
  - Estratégias de cache: Cache First, Network First, Stale While Revalidate
  - Suporte offline completo
  - Background Sync para sincronização de dados
  - Push Notifications
- **App ID**: `com.joaolops3.brainbolt`

## 🎮 Funcionalidades Detalhadas

### Sistema de Jogo

- **Modo Normal**: Partidas sem pressão de tempo para estudo detalhado
- **Modo Veloz**: 15 segundos por pergunta para desafio intenso
- **🏫 Modo Físico**: Revolucionário sistema para salas de aula
  - **4 Botões de Resposta**: Cada aluno tem 4 botões para escolher entre as alternativas (A, B, C, D)
  - **1 Botão de Resposta Rápida**: Botão especial para quem quer responder primeiro
  - **Competição Física**: Alunos competem fisicamente apertando os botões
  - **Dinâmica em Sala**: Professor controla o jogo, alunos participam ativamente
- **Modo Multiplayer**: Partidas 1v1 em tempo real com amigos
- **Sistema de Pontuação**: 100 pontos por acerto, bônus por streaks
- **Coleção de Personagens**: Desbloqueie personagens acertando 2+ perguntas por categoria
- **Dificuldade Progressiva**: Perguntas de fácil a difícil por categoria
- **160 Perguntas Fixas**: Distribuídas em 8 categorias (20 perguntas por categoria)

### 🏫 Sistema de Salas Educacionais

- **Criação de Grupos/Salas**: Professores podem criar salas específicas para suas turmas
- **Período de Competição**: Defina data de início e fim (não pode ser alterado depois)
- **Adição de Alunos**: Convide alunos para participar da sala
- **Rankings por Sala**: Visualize quem tem mais precisão, pontos e conquistas
- **Competições Escolares**: Professores podem organizar competições diárias, semanais ou mensais
- **Gamificação Educacional**: Alunos ganham conquistas e competem de forma saudável
- **Relatórios de Performance**: Acompanhe o progresso individual e da turma

### Multiplayer em Tempo Real

- **Salas Privadas**: Códigos únicos para partidas entre amigos
- **Sincronização Instantânea**: Atualizações em tempo real via Supabase
- **Sistema de Host/Convidado**: Controle de sala e início de partidas
- **Timer Sincronizado**: 15 segundos por pergunta para ambos os jogadores
- **Resultados Comparativos**: Estatísticas detalhadas pós-partida

### Sistema de Amigos

- **Busca de Usuários**: Encontre amigos por email ou nome
- **Solicitações de Amizade**: Sistema de pedidos pendentes/aceitos
- **Perfis Detalhados**: Visualize estatísticas e histórico de amigos
- **Comparação de Performance**: Rankings e métricas entre amigos
- **Status de Amizade**: Gerenciamento completo de relacionamentos

### Estatísticas Avançadas

- **Métricas de Performance**: Precisão, streaks, tempo médio por pergunta
- **Histórico de Partidas**: Últimas 10 sessões com detalhes completos
- **Estatísticas por Categoria**: Performance individual em cada área
- **Rankings Globais**: Comparação com outros jogadores
- **Progresso Temporal**: Evolução do desempenho ao longo do tempo

## 🎯 Categorias do Jogo

| Categoria             | Ícone   | Descrição                                  |
| --------------------- | ------- | ------------------------------------------ |
| ⚽ **Esportes**        | Azul    | Futebol, basquete, tênis e mais            |
| 🎬 **Entretenimento** | Rosa    | Cinema, música, TV e celebridades          |
| 🎨 **Arte**           | Roxo    | Pintura, escultura, literatura e cultura   |
| 🔬 **Ciências**       | Verde   | Física, química, biologia e tecnologia     |
| 🌍 **Geografia**      | Laranja | Países, capitais, continentes e mapas      |
| 🏛️ **História**       | Âmbar   | Eventos históricos, personalidades e datas |
| ➕ **Matemática**     | Azul    | Cálculos, álgebra, geometria e mais        |
| 📚 **Português**      | Roxo    | Gramática, ortografia, literatura e mais   |

## 🎮 Como Jogar

### 🏠 Uso Individual

1. **Cadastre-se** ou faça login na plataforma
2. **Escolha o modo**: Normal, Veloz, Físico ou Multiplayer
3. **Responda perguntas** de diferentes categorias
4. **Colete personagens** acertando 2+ perguntas por categoria
5. **Desafie amigos** no modo multiplayer
6. **Acompanhe suas estatísticas** e melhore seu desempenho

### 🏫 Uso em Sala de Aula

1. **Professor cria uma sala** para sua turma
2. **Define o período** da competição (início e fim)
3. **Convida os alunos** para participar da sala
4. **Inicia o modo físico** com botões para cada aluno
5. **Alunos competem** fisicamente apertando os botões
6. **Acompanha rankings** e progresso da turma
7. **Organiza competições** diárias, semanais ou mensais
8. **Premia os melhores** alunos ou turmas

### 🎯 Dinâmica Educacional

- **Aprendizado Gamificado**: Alunos aprendem sem perceber
- **Competição Saudável**: Estimula o estudo e a participação
- **Engajamento Total**: Mantém o foco dos alunos durante as aulas
- **Feedback Imediato**: Resultados instantâneos e rankings em tempo real
- **Flexibilidade**: Use em qualquer matéria ou disciplina

## 🛠️ Instalação e Configuração

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Supabase

### 1. Clone o repositório

```bash
git clone https://github.com/JoaoLops3/BrainBolt.git
cd BrainBolt
```

### 2. Instale as dependências

```bash
npm install
# ou
bun install
```

### 3. Configure o Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute as migrações SQL da pasta `supabase/migrations/` em ordem cronológica
3. Configure as variáveis de ambiente:
   - Copie o arquivo `.env.example` para `.env.local`
   - Preencha com suas credenciais do Supabase:

```bash
cp .env.example .env.local
```

Edite `.env.local`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

> 💡 **Dica**: Nunca compartilhe seu arquivo `.env.local` - ele contém credenciais sensíveis!

### 4. Execute o Projeto

```bash
# Desenvolvimento (hot reload)
npm run dev

# Produção (preview)
npm run build
npm run preview
```

Acesse: `http://localhost:8080`

### 5. Hardware Arduino (Opcional)

**🎉 Conexão Direta via Web Serial API:** [Guia Rápido](docs/CONECTAR-ARDUINO-RAPIDO.md)

✨ **Super Simples:**

1. Conecte Arduino via USB
2. Clique em "Conectar Arduino"
3. Jogue!

**Sem servidor, sem terminal, sem complicação!** A conexão é feita diretamente do navegador para o Arduino usando a Web Serial API.

### 6. Configuração Mobile (Opcional)

Para desenvolvimento mobile, você precisa do Capacitor configurado:

```bash
# Build para produção
npm run build

# Sincronizar com plataformas nativas
npx cap sync

# Abrir no Xcode (iOS)
npx cap open ios

# Abrir no Android Studio
npx cap open android
```

## 📱 Desenvolvimento Mobile

### Pré-requisitos para Mobile

- **iOS**: Xcode 14+ e macOS
- **Android**: Android Studio e Java 11+
- **Node.js**: 18+ com npm

### Comandos Mobile

```bash
# Build para produção
npm run build

# Sincronizar com plataformas nativas
npx cap sync

# Abrir projeto iOS no Xcode
npx cap open ios

# Abrir projeto Android no Android Studio
npx cap open android

# Executar no dispositivo/simulador
npx cap run ios
npx cap run android
```

### Configuração Mobile

- **App ID**: `com.joaolops3.brainbolt`
- **Splash Screen**: Cor roxa (#8B5CF6) personalizada
- **PWA**: Funciona offline após primeiro carregamento

## 🗄️ Arquitetura do Banco de Dados

### Tabelas Principais

#### `profiles` - Perfis de Usuário

- Armazena informações básicas e estatísticas dos usuários
- Campos: `user_id`, `display_name`, `avatar_url`, `total_score`, `games_played`, `win_percentage`, etc.
- Atualizada automaticamente via triggers após cada partida

#### `game_sessions` - Sessões de Jogo

- Histórico completo de todas as partidas
- Campos: `user_id`, `game_mode`, `final_score`, `correct_answers`, `max_streak`, `time_spent`
- Suporte a partidas multiplayer com `opponent_id` e `room_id`

#### `multiplayer_rooms` - Salas Multiplayer

- Gerencia partidas em tempo real entre jogadores
- Campos: `room_code`, `host_id`, `guest_id`, `game_status`, `current_question_id`
- Sincronização via WebSockets para updates em tempo real

#### `friendships` - Sistema de Amigos

- Relacionamentos entre usuários
- Campos: `user_id`, `friend_id`, `status` (pending/accepted/blocked)
- Suporte a solicitações de amizade bidirecionais

### Funcionalidades Avançadas

- **Row Level Security (RLS)**: Segurança granular por usuário
- **Triggers Automáticos**: Atualização de estatísticas em tempo real
- **Real-time Subscriptions**: Sincronização instantânea via Supabase
- **Funções SQL**: Lógica de negócio no servidor (cálculo de estatísticas)

## 📁 Estrutura do Projeto

```
BrainBolt/
├── src/
│   ├── components/          # Componentes React organizados
│   │   ├── game/           # Lógica do jogo (BrainBoltGame, MultiplayerGame)
│   │   ├── friends/        # Sistema de amigos (FriendsModal, FriendProfile)
│   │   └── ui/             # Componentes de interface (shadcn/ui)
│   ├── contexts/           # Contextos React (AuthContext)
│   ├── data/              # Dados estáticos (perguntas.ts - 160 perguntas)
│   ├── hooks/             # Hooks customizados (useArduinoSerial - Web Serial API)
│   ├── integrations/      # Integrações externas (Supabase client)
│   ├── lib/               # Utilitários (utils, validações)
│   ├── pages/             # Páginas principais (Index, Auth, NotFound)
│   └── types/             # Definições TypeScript (game.ts)
├── arduino/               # Código Arduino para hardware físico
├── ios/                   # Projeto iOS nativo (Xcode)
├── android/               # Projeto Android nativo (Gradle)
├── supabase/              # Configurações do Supabase
│   ├── migrations/        # Migrações SQL do banco
│   └── config.toml        # Configuração local
├── public/                # Assets estáticos (logo, ícones)
├── dist/                  # Build de produção (Vite)
├── capacitor.config.ts    # Configuração do Capacitor
└── docs/                  # Documentação adicional
```

## 🎨 Design System

### Paleta de Cores

- **Primária**: `#8B5CF6` (Roxo)
- **Secundária**: `#EC4899` (Rosa)
- **Acentos**: `#F59E0B` (Amarelo), `#10B981` (Verde), `#3B82F6` (Azul)
- **Fundo**: Gradientes vibrantes
- **Cards**: Glassmorphism com blur

### Componentes

- **Cards** com efeito glassmorphism
- **Botões** com animações hover
- **Modais** responsivos e acessíveis
- **Gradientes** coloridos e modernos
- **Ícones** minimalistas do Lucide

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Netlify

1. Conecte o repositório
2. Configure build command: `npm run build`
3. Configure publish directory: `dist`

### Outras Plataformas

O projeto pode ser deployado em qualquer plataforma que suporte aplicações React estáticas.

### Mobile Stores

#### iOS App Store

1. Configure certificados no Xcode
2. Build para produção: `npx cap build ios`
3. Submeta via Xcode ou App Store Connect

#### Google Play Store

1. Configure assinatura no Android Studio
2. Build para produção: `npx cap build android`
3. Submeta via Google Play Console

### PWA (Progressive Web App)

- Funciona offline após primeiro carregamento
- Instalável como app nativo no navegador
- Notificações push (quando implementadas)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Scripts Disponíveis

```bash
# Web
npm run dev          # Dev server (localhost:8080)
npm run build        # Build produção
npm run preview      # Preview build

# Mobile
npx cap sync         # Sincronizar
npx cap open ios     # Xcode
npx cap open android # Android Studio

# Utilitários
npm run lint         # ESLint
npx cap doctor       # Verificar Capacitor
```

## 🆕 Versão 2.0.0 - Novas Funcionalidades

### ✅ Implementado Recentemente

#### 🌙 Modo Escuro Completo

- **3 Opções**: ☀️ Claro, 🌙 Escuro, 🔄 Automático
- Transições suaves (300ms)
- Persistência de preferência
- Variáveis CSS customizadas

#### 🎓 Tutorial Interativo

- **6 Etapas** educativas
- Totalmente responsivo
- Botão flutuante (?) sempre disponível
- Animações e ícones ilustrativos
- Auto-exibição para novos usuários

#### 📱 Responsividade Total

- **Mobile**: iPhone SE a Pro Max
- **Tablet**: iPad, iPad Pro, Android tablets
- **Desktop**: 1280px+
- **Safe Areas**: Notch, Dynamic Island
- **Touch Targets**: 44px mínimo (iOS guidelines)
- **Orientação**: Portrait e Landscape

#### 📝 Perguntas Customizadas

- Professores criam perguntas ilimitadas
- 8 categorias + 3 dificuldades
- Explicações educacionais
- Compartilhamento público
- Estatísticas de uso

#### 🔧 Hardware Físico

- **Web Serial API**: Conexão direta USB → Navegador
- **Zero Configuração**: Sem servidor ou terminal
- **Plug & Play**: Conecte e jogue instantaneamente
- **Compatível**: Chrome, Edge, Opera

#### ⚡ Performance

- Lazy loading de rotas
- Code splitting otimizado
- Bundle reduzido ~40%
- Service Worker v2.0.0
- Cache inteligente

---

## 🎓 Impacto Educacional

### Benefícios para Professores

- **Engajamento Total**: Mantém a atenção dos alunos durante toda a aula
- **Avaliação Contínua**: Feedback imediato sobre o aprendizado da turma
- **Gamificação Natural**: Transforma o estudo em diversão
- **Flexibilidade**: Use em qualquer matéria ou disciplina
- **Competição Saudável**: Estimula o estudo e a participação
- **Relatórios Detalhados**: Acompanhe o progresso individual e da turma

### Benefícios para Alunos

- **Aprendizado Divertido**: Estuda sem perceber que está estudando
- **Competição Saudável**: Desenvolve espírito competitivo positivo
- **Feedback Imediato**: Sabe instantaneamente se acertou ou errou
- **Conquistas e Rankings**: Motivação através de gamificação
- **Participação Ativa**: Todos os alunos participam da aula
- **Desenvolvimento de Conhecimento**: Aprende enquanto se diverte

### Benefícios para Instituições

- **Melhoria no Aprendizado**: Alunos mais engajados aprendem melhor
- **Tecnologia Educacional**: Posiciona a escola como inovadora
- **Relatórios Institucionais**: Dados sobre o desempenho das turmas
- **Competições Escolares**: Organize torneios entre turmas ou séries
- **Diferencial Competitivo**: Atrai alunos e pais interessados em inovação

## 📊 Estatísticas do Projeto

- **Arquivos TS/TSX**: 141
- **Componentes**: 80+
- **Linhas de código**: ~25.000+
- **Bundle (gzip)**:
  - CSS: 22 kB
  - JS Total: ~250 kB
- **Build time**: ~4s
- **Categorias**: 8
- **Perguntas**: 160 (fixas) + Ilimitadas (custom)

## 👨‍💻 Autor

**João Gabriel Lopes Aguiar**

- GitHub: [@JoaoLops3](https://github.com/JoaoLops3)
- Projeto: Brain Bolt - Quiz Educacional
- Versão: 2.0.0

## 🙏 Agradecimentos

- [Supabase](https://supabase.com) - Backend
- [shadcn/ui](https://ui.shadcn.com) - Componentes UI
- [Lucide](https://lucide.dev) - Ícones
- [Tailwind CSS](https://tailwindcss.com) - Framework CSS
- **Educadores e Alunos** - Inspiração

## 📄 Licença

Este projeto é de código aberto para fins educacionais.

---

<div align="center">
  <b>🧠 Brain Bolt - Aprenda Brincando! ⚡</b>
  <br><br>
  Feito com ❤️ para educadores e alunos
</div>
