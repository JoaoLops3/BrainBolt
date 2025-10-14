# 🧠 Brain Bolt - Jogo de Quiz Educacional

<div align="center">
  <img src="./public/Brain-Bolt-Logo.png" alt="Brain Bolt Logo" width="200" height="200">
  
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

- 🎮 **Três Modos de Jogo**:
  - **Normal**: Sem pressão de tempo para estudo detalhado
  - **Veloz**: 15 segundos por pergunta para desafio intenso
  - **🏫 Físico**: Modo para salas de aula com botões físicos ([Tutorial ESP32/Arduino](docs/hardware/ESP32-ARDUINO-SETUP.md))
- 🏆 **6 Categorias**: Esportes, Entretenimento, Arte, Ciências, Geografia e História (400+ perguntas)
- 👥 **Sistema de Amigos Completo**: Busque, adicione e gerencie amigos com perfis detalhados
- 🌐 **Multiplayer em Tempo Real**: Partidas online com salas privadas e sincronização via Supabase
- 📊 **Estatísticas Avançadas**: Métricas detalhadas de performance, streaks e histórico de partidas
- 🎨 **Design Moderno**: Interface com glassmorphism, gradientes, animações fluidas e **Modo Escuro** 🌙
- 📱 **Multiplataforma**: PWA offline-first no navegador e apps nativos para iOS/Android
- 🔐 **Autenticação Segura**: Sistema de login com Supabase Auth
- 🏅 **Sistema de Conquistas**: Colete personagens por categoria e acompanhe rankings
- 🏫 **Sistema de Salas Educacionais**: Crie grupos/salas para competições em sala de aula
- 📝 **Perguntas Customizadas**: Professores podem criar suas próprias perguntas
- ⚡ **Performance Otimizada**: Lazy loading, code splitting e bundle otimizado

## 🚀 Stack Tecnológica

### Frontend

- **React 18.3.1** - Biblioteca de interface de usuário com hooks e contexto
- **TypeScript 5.8.3** - Tipagem estática para desenvolvimento seguro
- **Vite 5.4.19** - Build tool ultra-rápido com HMR
- **Tailwind CSS 3.4.17** - Framework CSS utilitário com design system customizado
- **shadcn/ui** - Componentes de interface modernos e acessíveis
- **Radix UI** - Primitivos de UI headless para componentes complexos
- **Lucide React** - Biblioteca de ícones SVG otimizados
- **React Router DOM 6.30.1** - Roteamento client-side
- **React Hook Form 7.61.1** - Gerenciamento de formulários performático
- **TanStack Query 5.83.0** - Cache e sincronização de dados do servidor

### Backend & Database

- **Supabase 2.57.2** - Backend-as-a-Service completo
- **PostgreSQL** - Banco de dados relacional com extensões avançadas
- **Row Level Security (RLS)** - Segurança granular a nível de linha
- **Real-time subscriptions** - Atualizações em tempo real via WebSockets
- **Supabase Auth** - Autenticação completa com providers sociais
- **Edge Functions** - Serverless functions para lógica de negócio

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
- **Sistema de Pontuação**: 100 pontos por acerto, bônus por streaks
- **Coleção de Personagens**: Desbloqueie personagens acertando 2+ perguntas por categoria
- **Dificuldade Progressiva**: Perguntas de fácil a difícil por categoria

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
| 🏃‍♂️ **Esportes**       | Azul    | Futebol, basquete, tênis e mais            |
| 🎬 **Entretenimento** | Rosa    | Cinema, música, TV e celebridades          |
| 🎨 **Arte**           | Roxo    | Pintura, escultura, literatura e cultura   |
| 🔬 **Ciências**       | Verde   | Física, química, biologia e tecnologia     |
| 🌍 **Geografia**      | Laranja | Países, capitais, continentes e mapas      |
| 🏛️ **História**       | Âmbar   | Eventos históricos, personalidades e datas |

## 🎮 Como Jogar

### 🏠 Uso Individual

1. **Cadastre-se** ou faça login na plataforma
2. **Escolha o modo**: Normal, Veloz ou Físico
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

### 4. Execute o projeto

```bash
npm run dev
```

O projeto estará disponível em `http://localhost:8080`

### 5. Configuração Mobile (Opcional)

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
│   ├── data/              # Dados estáticos (perguntas.ts - 400+ perguntas)
│   ├── hooks/             # Hooks customizados (use-mobile, use-toast)
│   ├── integrations/      # Integrações externas (Supabase client)
│   ├── lib/               # Utilitários (utils, validações)
│   ├── pages/             # Páginas principais (Index, Auth, NotFound)
│   └── types/             # Definições TypeScript (game.ts)
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
# Desenvolvimento Web
npm run dev          # Servidor de desenvolvimento (localhost:8080)
npm run build        # Build para produção
npm run build:dev    # Build em modo desenvolvimento
npm run preview      # Preview do build de produção
npm run lint         # Linting do código com ESLint

# Desenvolvimento Mobile (Capacitor)
npx cap sync         # Sincronizar com plataformas nativas
npx cap open ios     # Abrir projeto iOS no Xcode
npx cap open android # Abrir projeto Android no Android Studio
npx cap run ios      # Executar no simulador iOS
npx cap run android  # Executar no emulador Android

# Utilitários
npx cap doctor       # Verificar configuração do Capacitor
npm run type-check   # Verificação de tipos TypeScript
```

## ✅ Funcionalidades Implementadas Recentemente

### Novas Funcionalidades

- ✅ **Sistema de Perguntas Customizadas**: Professores podem criar suas próprias perguntas
  - Formulário completo com validação
  - Suporte a 6 categorias e 3 níveis de dificuldade
  - Opção de compartilhar perguntas publicamente
  - Estatísticas de uso e taxa de acerto
- ✅ **Modo Escuro Completo**:
  - 3 opções: Claro, Escuro e Automático
  - Transições suaves entre temas
  - Preserva preferência do usuário
- ✅ **PWA Offline Avançado**:
  - Service Worker com estratégias inteligentes de cache
  - Funciona completamente offline após primeiro carregamento
  - Background Sync para sincronização de dados
- ✅ **Otimizações de Performance**:
  - Lazy loading de rotas e componentes
  - Code splitting automático
  - Bundle otimizado (redução de ~40% no tamanho)
  - Cache inteligente de assets e API calls
- ✅ **Documentação de Hardware**: Tutorial completo para montar sistema de botões físicos com ESP32/Arduino

### 📋 Roadmap Futuro

#### Funcionalidades Planejadas

- [ ] **Modo Torneio**: Competições com múltiplos jogadores e eliminatórias
- [ ] **Integração Social**: Compartilhamento de resultados nas redes sociais
- [ ] **Relatórios Avançados**: Análise detalhada do progresso dos alunos com gráficos
- [ ] **Integração com LMS**: Conectividade com Moodle, Google Classroom, etc.
- [ ] **Sistema de Badges**: Conquistas e medalhas especiais
- [ ] **Modo Treinamento**: Revisão de perguntas erradas

#### Melhorias de UX/UI

- [ ] **Animações Avançadas**: Transições mais fluidas e efeitos visuais
- [ ] **Acessibilidade**: Melhorias WCAG 2.1 AA compliant
- [ ] **Internacionalização**: Suporte a Inglês, Espanhol e outros idiomas
- [ ] **Responsividade Tablet**: Layouts otimizados para tablets
- [ ] **Tema Customizável**: Cores personalizáveis pelo usuário

## 🔧 Hardware Físico para Sala de Aula

O Brain Bolt suporta um modo físico revolucionário com botões reais que transforma a sala de aula em um ambiente de competição interativo!

### 🎮 Sistema de Botões com ESP32/Arduino

Construa seu próprio controlador físico com:

- **4 botões coloridos** (A, B, C, D) para respostas
- **1 botão de resposta rápida** para competições
- **LEDs indicadores** para feedback visual
- **Buzzer** para efeitos sonoros
- **Display OLED** (opcional) para informações do jogo

### 📚 Tutorial Completo

Acesse o tutorial detalhado de montagem: **[ESP32/Arduino Setup Guide](docs/hardware/ESP32-ARDUINO-SETUP.md)**

O guia inclui:

- ✅ Lista completa de materiais (custo aproximado: R$ 80-150)
- ✅ Esquema de conexões detalhado
- ✅ Código Arduino completo e comentado
- ✅ Instruções de montagem passo a passo
- ✅ Integração com o aplicativo via WebSocket
- ✅ Solução de problemas comuns

### 💰 Materiais Necessários

- ESP32 DevKit (~R$ 30-50)
- 5x Botões Push Button (~R$ 20-40)
- 5x LEDs e resistores (~R$ 10)
- Buzzer passivo (~R$ 3)
- Display OLED (opcional, ~R$ 15-25)
- Protoboard, jumpers e case

**Total**: R$ 80-150 para um controlador completo!

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

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

- GitHub: [@JoaoLops3](https://github.com/JoaoLops3)

## 🙏 Agradecimentos

- [Supabase](https://supabase.com) pela infraestrutura backend
- [shadcn/ui](https://ui.shadcn.com) pelos componentes de interface
- [Lucide](https://lucide.dev) pelos ícones
- [Tailwind CSS](https://tailwindcss.com) pelo framework CSS
- **Educadores e Alunos** que inspiraram este projeto educacional
