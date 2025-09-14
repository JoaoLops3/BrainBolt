# 🎯 BrainBolt - Jogo de Quiz Online

<div align="center">
  <img src="/logo.png" alt="BrainBolt Logo" width="200" height="200">
  
  [![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-5.4.19-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-2.57.2-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
  [![Capacitor](https://img.shields.io/badge/Capacitor-7.4.3-119EFF?style=flat&logo=capacitor&logoColor=white)](https://capacitorjs.com/)
</div>

## 📖 Sobre o Projeto

**BrainBolt** é um jogo de quiz online moderno e interativo que testa seus conhecimentos em 6 categorias diferentes. Desenvolvido com React, TypeScript e Supabase, oferece uma experiência gamificada completa com sistema de amigos, multiplayer e estatísticas detalhadas.

### ✨ Características Principais

- 🎮 **Dois Modos de Jogo**: Normal (sem tempo) e Veloz (15 segundos por pergunta)
- 🏆 **6 Categorias**: Esportes, Entretenimento, Arte, Ciências, Geografia e História (400+ perguntas)
- 👥 **Sistema de Amigos Completo**: Busque, adicione e gerencie amigos com perfis detalhados
- 🌐 **Multiplayer em Tempo Real**: Partidas online com salas privadas e sincronização via Supabase
- 📊 **Estatísticas Avançadas**: Métricas detalhadas de performance, streaks e histórico de partidas
- 🎨 **Design Moderno**: Interface com glassmorphism, gradientes e animações fluidas
- 📱 **Multiplataforma**: PWA no navegador e apps nativos para iOS/Android
- 🔐 **Autenticação Segura**: Sistema de login com Supabase Auth
- 🏅 **Sistema de Conquistas**: Colete personagens por categoria e acompanhe rankings

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
- **PWA** - Progressive Web App com cache offline
- **App ID**: `com.joaolops3.brainbolt`

## 🎮 Funcionalidades Detalhadas

### Sistema de Jogo

- **Modo Normal**: Partidas sem pressão de tempo para estudo detalhado
- **Modo Veloz**: 15 segundos por pergunta para desafio intenso
- **Sistema de Pontuação**: 100 pontos por acerto, bônus por streaks
- **Coleção de Personagens**: Desbloqueie personagens acertando 2+ perguntas por categoria
- **Dificuldade Progressiva**: Perguntas de fácil a difícil por categoria

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

1. **Cadastre-se** ou faça login na plataforma
2. **Escolha o modo**: Normal ou Veloz
3. **Responda perguntas** de diferentes categorias
4. **Colete personagens** acertando 2+ perguntas por categoria
5. **Desafie amigos** no modo multiplayer
6. **Acompanhe suas estatísticas** e melhore seu desempenho

## 🛠️ Instalação e Configuração

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Supabase

### 1. Clone o repositório

```bash
git clone https://github.com/JoaoLops3/quiz-world-quest.git
cd quiz-world-quest
```

### 2. Instale as dependências

```bash
npm install
# ou
bun install
```

### 3. Configure o Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute as migrações SQL da pasta `supabase/migrations/`:
   ```sql
   -- Execute cada arquivo de migração em ordem:
   -- 20250906171319_07fa682c-24e7-4cdc-9b94-c4e2b44abf9e.sql
   -- 20250909203617_e2572c8d-518c-4766-bd54-c8827c8d15af.sql
   -- 20250909204307_cb21112e-41ed-4214-9133-11c1c64f922c.sql
   ```
3. Configure as variáveis de ambiente criando um arquivo `.env.local`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

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
quiz-world-quest/
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

## 🚀 Roadmap e Melhorias Futuras

### Funcionalidades Planejadas

- [ ] **Sistema de Notificações Push**: Alertas para partidas multiplayer e convites
- [ ] **Modo Torneio**: Competições com múltiplos jogadores e eliminatórias
- [ ] **Criação de Perguntas**: Sistema para usuários criarem suas próprias perguntas
- [ ] **Temas Personalizados**: Customização de cores e estilos da interface
- [ ] **Modo Offline**: Jogo completo sem conexão com internet
- [ ] **Integração Social**: Compartilhamento de resultados nas redes sociais

### Otimizações Técnicas

- [ ] **Lazy Loading**: Carregamento sob demanda de componentes
- [ ] **Bundle Splitting**: Redução do tamanho inicial do app
- [ ] **Service Workers**: Cache inteligente para melhor performance
- [ ] **PWA Avançado**: Funcionalidades offline completas
- [ ] **Análise de Performance**: Métricas detalhadas de uso e performance

### Melhorias de UX/UI

- [ ] **Animações Avançadas**: Transições mais fluidas entre telas
- [ ] **Modo Escuro**: Tema dark completo
- [ ] **Acessibilidade**: Melhorias para usuários com necessidades especiais
- [ ] **Internacionalização**: Suporte a múltiplos idiomas
- [ ] **Responsividade Avançada**: Otimização para tablets e diferentes resoluções

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**João Gabriel Lopes Aguiar**

- GitHub: [@JoaoLops3](https://github.com/JoaoLops3)
- LinkedIn: [João Gabriel](https://linkedin.com/in/joaogabriellopes)

## 🙏 Agradecimentos

- [Supabase](https://supabase.com) pela infraestrutura backend
- [shadcn/ui](https://ui.shadcn.com) pelos componentes de interface
- [Lucide](https://lucide.dev) pelos ícones
- [Tailwind CSS](https://tailwindcss.com) pelo framework CSS
